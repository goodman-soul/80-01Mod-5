import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MockRepository } from '../../database/mock-repository';
import { EquipmentService } from '../equipment/equipment.service';
import {
  ShipmentRecord,
  ReturnRecord,
  EquipmentStatus,
  BorrowRequestStatus,
  Equipment,
  EquipmentType,
} from '../../common/types';

export interface ShipDto {
  borrow_request_id: string;
  equipment_id: string;
  accessories: string[];
  shipped_by: string;
}

export interface ReturnItemDto {
  borrow_request_id: string;
  equipment_id: string;
  has_damage: boolean;
  damage_description?: string;
}

export interface CompleteCleaningDto {
  return_record_id: string;
  completed_by: string;
}

export interface RestockDto {
  return_record_id: string;
}

export interface ShipmentDetail extends ShipmentRecord {
  equipment: Equipment & { type: EquipmentType };
  elderly_name: string;
  elderly_phone: string;
}

export interface ReturnRecordDetail extends ReturnRecord {
  equipment: Equipment & { type: EquipmentType };
  borrow_request_id: string;
  elderly_name?: string;
}

@Injectable()
export class WarehouseService {
  constructor(
    private readonly repo: MockRepository,
    private readonly equipmentService: EquipmentService,
  ) {}

  getPendingShipments(): {
    borrow_request_id: string;
    elderly_name: string;
    elderly_phone: string;
    type_name: string;
    deposit: number;
    expected_return_date: string;
    adaptation_notes?: string;
    available_equipments: (Equipment & { type: EquipmentType })[];
  }[] {
    const approvedRequests = this.repo.getBorrowRequests({
      status: BorrowRequestStatus.APPROVED,
    });
    const pendingRequests = this.repo.getBorrowRequests({
      status: BorrowRequestStatus.PENDING,
    });
    const all = [...approvedRequests, ...pendingRequests].filter(
      (r) => r.status === BorrowRequestStatus.APPROVED,
    );

    return all.map((r) => {
      const type = this.repo.getEquipmentTypeById(r.type_id)!;
      const available = this.equipmentService.getAvailableEquipments(r.type_id);
      return {
        borrow_request_id: r.id,
        elderly_name: r.elderly_name,
        elderly_phone: r.elderly_phone,
        type_name: type.name,
        deposit: type.deposit,
        expected_return_date: r.expected_return_date,
        adaptation_notes: r.adaptation_notes,
        available_equipments: available,
      };
    });
  }

  ship(dto: ShipDto): ShipmentDetail {
    const borrowRequest = this.repo.getBorrowRequestById(dto.borrow_request_id);
    if (!borrowRequest) {
      throw new NotFoundException('借用申请不存在');
    }
    if (
      borrowRequest.status !== BorrowRequestStatus.PENDING &&
      borrowRequest.status !== BorrowRequestStatus.APPROVED
    ) {
      throw new BadRequestException('该申请当前状态不可发货');
    }

    const equipment = this.repo.getEquipmentById(dto.equipment_id);
    if (!equipment) {
      throw new NotFoundException('设备不存在');
    }
    if (equipment.status !== EquipmentStatus.IN_STOCK) {
      throw new BadRequestException('该设备当前不可借出');
    }
    if (equipment.type_id !== borrowRequest.type_id) {
      throw new BadRequestException('设备类型与申请不匹配');
    }

    const type = this.repo.getEquipmentTypeById(equipment.type_id)!;
    const missingAccessories = dto.accessories.filter(
      (a) => !type.accessories.includes(a),
    );
    if (missingAccessories.length > 0) {
      throw new BadRequestException(
        `配件列表包含无效项: ${missingAccessories.join('、')}`,
      );
    }

    const now = new Date().toISOString();
    const shipment = this.repo.createShipmentRecord({
      borrow_request_id: dto.borrow_request_id,
      equipment_id: dto.equipment_id,
      serial_number: equipment.serial_number,
      accessories: dto.accessories,
      shipped_by: dto.shipped_by,
      shipped_at: now,
    });

    this.repo.updateEquipmentStatus(dto.equipment_id, EquipmentStatus.BORROWED);
    this.repo.updateBorrowRequest(dto.borrow_request_id, {
      status: BorrowRequestStatus.SHIPPED,
      equipment_id: dto.equipment_id,
      shipped_by: dto.shipped_by,
      shipped_at: now,
    });

    const eqWithType = this.equipmentService.getEquipmentById(dto.equipment_id)!;
    return {
      ...shipment,
      equipment: eqWithType,
      elderly_name: borrowRequest.elderly_name,
      elderly_phone: borrowRequest.elderly_phone,
    };
  }

  getShipmentByBorrowRequest(id: string): ShipmentDetail | undefined {
    const shipment = this.repo.getShipmentRecordByBorrowRequestId(id);
    if (!shipment) return undefined;
    const eqWithType = this.equipmentService.getEquipmentById(
      shipment.equipment_id,
    )!;
    const borrowRequest = this.repo.getBorrowRequestById(id)!;
    return {
      ...shipment,
      equipment: eqWithType,
      elderly_name: borrowRequest.elderly_name,
      elderly_phone: borrowRequest.elderly_phone,
    };
  }

  returnItem(dto: ReturnItemDto): ReturnRecordDetail {
    const borrowRequest = this.repo.getBorrowRequestById(dto.borrow_request_id);
    if (!borrowRequest) {
      throw new NotFoundException('借用申请不存在');
    }
    if (borrowRequest.status !== BorrowRequestStatus.SHIPPED) {
      throw new BadRequestException('该申请当前状态不可归还');
    }
    if (borrowRequest.equipment_id !== dto.equipment_id) {
      throw new BadRequestException('归还设备与借出设备不匹配');
    }

    const now = new Date().toISOString();
    const returnRecord = this.repo.createReturnRecord({
      borrow_request_id: dto.borrow_request_id,
      equipment_id: dto.equipment_id,
      returned_at: now,
      cleaning_completed: false,
      has_damage: dto.has_damage,
      damage_description: dto.damage_description,
      restocked: false,
    });

    this.repo.updateEquipmentStatus(
      dto.equipment_id,
      dto.has_damage ? EquipmentStatus.DAMAGED : EquipmentStatus.CLEANING,
    );
    this.repo.updateBorrowRequest(dto.borrow_request_id, {
      status: BorrowRequestStatus.RETURNED,
      returned_at: now,
      damage_notes: dto.damage_description,
    });

    const eqWithType = this.equipmentService.getEquipmentById(dto.equipment_id)!;
    return {
      ...returnRecord,
      equipment: eqWithType,
      elderly_name: borrowRequest.elderly_name,
    };
  }

  getPendingReturns(): ReturnRecordDetail[] {
    const all = this.repo.getReturnRecords();
    return all
      .filter((r) => !r.restocked)
      .map((r) => {
        const eqWithType = this.equipmentService.getEquipmentById(
          r.equipment_id,
        )!;
        const borrowRequest = this.repo.getBorrowRequestById(
          r.borrow_request_id,
        );
        return {
          ...r,
          equipment: eqWithType,
          elderly_name: borrowRequest?.elderly_name,
        };
      });
  }

  completeCleaning(dto: CompleteCleaningDto): ReturnRecordDetail {
    const returnRecord = this.repo.getReturnRecords().find(
      (r) => r.id === dto.return_record_id,
    );
    if (!returnRecord) {
      throw new NotFoundException('归还记录不存在');
    }
    if (returnRecord.cleaning_completed) {
      throw new BadRequestException('该设备已完成清洁消毒');
    }
    if (returnRecord.has_damage) {
      throw new BadRequestException('损坏设备不可完成清洁，请先送修');
    }

    const now = new Date().toISOString();
    const updated = this.repo.updateReturnRecord(dto.return_record_id, {
      cleaning_completed: true,
      cleaning_completed_by: dto.completed_by,
      cleaning_completed_at: now,
    });

    const eqWithType = this.equipmentService.getEquipmentById(
      returnRecord.equipment_id,
    )!;
    const borrowRequest = this.repo.getBorrowRequestById(
      returnRecord.borrow_request_id,
    );

    return {
      ...updated!,
      equipment: eqWithType,
      elderly_name: borrowRequest?.elderly_name,
    };
  }

  restock(dto: RestockDto): ReturnRecordDetail {
    const returnRecords = this.repo.getReturnRecords();
    const returnRecord = returnRecords.find((r) => r.id === dto.return_record_id);
    if (!returnRecord) {
      throw new NotFoundException('归还记录不存在');
    }
    if (returnRecord.restocked) {
      throw new BadRequestException('该设备已再次上架');
    }
    if (!returnRecord.cleaning_completed && !returnRecord.has_damage) {
      throw new BadRequestException('请先完成清洁消毒再上架');
    }
    if (returnRecord.has_damage) {
      throw new BadRequestException('损坏设备不可上架，请先完成维修');
    }

    const now = new Date().toISOString();
    const updated = this.repo.updateReturnRecord(dto.return_record_id, {
      restocked: true,
      restocked_at: now,
    });

    this.repo.updateEquipmentStatus(
      returnRecord.equipment_id,
      EquipmentStatus.IN_STOCK,
      { last_cleaned_at: returnRecord.cleaning_completed_at },
    );

    const borrowRequest = this.repo.getBorrowRequestById(
      returnRecord.borrow_request_id,
    );
    if (borrowRequest) {
      this.repo.updateBorrowRequest(returnRecord.borrow_request_id, {
        status: BorrowRequestStatus.COMPLETED,
        cleaning_done: true,
        cleaning_done_by: returnRecord.cleaning_completed_by,
        cleaning_done_at: returnRecord.cleaning_completed_at,
      });
    }

    const eqWithType = this.equipmentService.getEquipmentById(
      returnRecord.equipment_id,
    )!;

    return {
      ...updated!,
      equipment: eqWithType,
      elderly_name: borrowRequest?.elderly_name,
    };
  }
}
