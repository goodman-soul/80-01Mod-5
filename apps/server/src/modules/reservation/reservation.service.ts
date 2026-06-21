import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MockRepository } from '../../database/mock-repository';
import { EquipmentService } from '../equipment/equipment.service';
import {
  ServiceReservation,
  ReservationStatus,
  EquipmentType,
} from '../../common/types';

export interface CreateReservationDto {
  elderly_id: string;
  elderly_name: string;
  elderly_phone: string;
  type_id: string;
  preferred_date: string;
  note?: string;
  created_by: string;
}

export interface ReservationDetail extends ServiceReservation {
  type: EquipmentType;
  available_count: number;
  cleaning_count: number;
  stock_warning?: string;
  alternatives: EquipmentType[];
}

@Injectable()
export class ReservationService {
  constructor(
    private readonly repo: MockRepository,
    private readonly equipmentService: EquipmentService,
  ) {}

  getAll(status?: ReservationStatus): ReservationDetail[] {
    const list = this.repo.getServiceReservations(
      status ? { status } : undefined,
    );
    return list.map((r) => this.enrichReservation(r));
  }

  getById(id: string): ReservationDetail {
    const res = this.repo.getServiceReservationById(id);
    if (!res) {
      throw new NotFoundException('预约不存在');
    }
    return this.enrichReservation(res);
  }

  create(dto: CreateReservationDto): ReservationDetail {
    if (!dto.preferred_date) {
      throw new BadRequestException('请选择预约日期');
    }
    if (!dto.elderly_name || !dto.elderly_phone) {
      throw new BadRequestException('请填写老人姓名和联系电话');
    }
    const type = this.repo.getEquipmentTypeById(dto.type_id);
    if (!type) {
      throw new NotFoundException('设备类型不存在');
    }

    const record = this.repo.createServiceReservation(dto);
    return this.enrichReservation(record);
  }

  confirm(id: string): ReservationDetail {
    const res = this.repo.getServiceReservationById(id);
    if (!res) {
      throw new NotFoundException('预约不存在');
    }
    if (res.status !== ReservationStatus.PENDING) {
      throw new BadRequestException('该预约当前状态不可确认');
    }
    const updated = this.repo.updateServiceReservation(id, {
      status: ReservationStatus.CONFIRMED,
    });
    return this.enrichReservation(updated!);
  }

  cancel(id: string, reason?: string): ReservationDetail {
    const res = this.repo.getServiceReservationById(id);
    if (!res) {
      throw new NotFoundException('预约不存在');
    }
    if (
      res.status !== ReservationStatus.PENDING &&
      res.status !== ReservationStatus.CONFIRMED
    ) {
      throw new BadRequestException('该预约当前状态不可取消');
    }
    const updated = this.repo.updateServiceReservation(id, {
      status: ReservationStatus.CANCELLED,
      note: reason ? `${res.note || ''}\n取消原因: ${reason}`.trim() : res.note,
    });
    return this.enrichReservation(updated!);
  }

  complete(id: string): ReservationDetail {
    const res = this.repo.getServiceReservationById(id);
    if (!res) {
      throw new NotFoundException('预约不存在');
    }
    if (res.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException('该预约当前状态不可完成');
    }
    const updated = this.repo.updateServiceReservation(id, {
      status: ReservationStatus.COMPLETED,
    });
    return this.enrichReservation(updated!);
  }

  getStatusLabel(status: ReservationStatus): string {
    const map: Record<ReservationStatus, string> = {
      [ReservationStatus.PENDING]: '待确认',
      [ReservationStatus.CONFIRMED]: '已确认',
      [ReservationStatus.CANCELLED]: '已取消',
      [ReservationStatus.COMPLETED]: '已完成',
    };
    return map[status];
  }

  private enrichReservation(res: ServiceReservation): ReservationDetail {
    const type = this.repo.getEquipmentTypeById(res.type_id)!;
    const stock = this.repo.getStockCountByTypeId(res.type_id);
    const alternatives = this.equipmentService.getAlternativeTypes(res.type_id);

    let stock_warning: string | undefined;
    if (stock.available === 0 && stock.cleaning > 0) {
      stock_warning = `当前无在库设备，有 ${stock.cleaning} 台正在清洁消毒中，预计1-2个工作日后可使用。`;
    } else if (stock.available === 0 && stock.cleaning === 0) {
      stock_warning = '当前无可用设备，建议选择同类其他型号。';
    } else if (stock.available <= 1) {
      stock_warning = `库存紧张，仅剩 ${stock.available} 台可借，另有 ${stock.cleaning} 台消毒中。`;
    }

    return {
      ...res,
      type,
      available_count: stock.available,
      cleaning_count: stock.cleaning,
      stock_warning,
      alternatives,
    };
  }
}
