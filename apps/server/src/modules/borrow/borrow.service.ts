import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MockRepository } from '../../database/mock-repository';
import { EquipmentService } from '../equipment/equipment.service';
import {
  BorrowRequest,
  BorrowRequestStatus,
  EquipmentStatus,
  EquipmentType,
} from '../../common/types';

export interface CreateBorrowRequestDto {
  elderly_id: string;
  elderly_name: string;
  elderly_phone: string;
  type_id: string;
  deposit_paid: boolean;
  expected_return_date: string;
  adaptation_notes?: string;
  created_by?: string;
}

export interface BorrowRequestDetail extends BorrowRequest {
  type: EquipmentType;
  available_count: number;
  cleaning_count: number;
  alternatives: EquipmentType[];
}

@Injectable()
export class BorrowService {
  constructor(
    private readonly repo: MockRepository,
    private readonly equipmentService: EquipmentService,
  ) {}

  getAll(status?: BorrowRequestStatus): BorrowRequestDetail[] {
    const list = this.repo.getBorrowRequests(status ? { status } : undefined);
    return list.map((r) => this.enrichBorrowRequest(r));
  }

  getById(id: string): BorrowRequestDetail {
    const req = this.repo.getBorrowRequestById(id);
    if (!req) {
      throw new NotFoundException('借用申请不存在');
    }
    return this.enrichBorrowRequest(req);
  }

  create(dto: CreateBorrowRequestDto): BorrowRequestDetail {
    const type = this.repo.getEquipmentTypeById(dto.type_id);
    if (!type) {
      throw new NotFoundException('设备类型不存在');
    }

    const stock = this.repo.getStockCountByTypeId(dto.type_id);
    if (stock.available === 0 && stock.cleaning === 0) {
      throw new BadRequestException(
        '该设备当前无库存，请选择其他型号或稍后再试',
      );
    }

    if (!dto.deposit_paid) {
      throw new BadRequestException(
        `请先缴纳押金 ¥${type.deposit}，完成后再提交申请`,
      );
    }

    if (!dto.expected_return_date) {
      throw new BadRequestException('请选择预计归还日期');
    }

    const expectedDate = new Date(dto.expected_return_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (expectedDate < today) {
      throw new BadRequestException('预计归还日期不能早于今天');
    }

    const record = this.repo.createBorrowRequest(dto);
    return this.enrichBorrowRequest(record);
  }

  approve(id: string): BorrowRequestDetail {
    const req = this.repo.getBorrowRequestById(id);
    if (!req) {
      throw new NotFoundException('借用申请不存在');
    }
    if (req.status !== BorrowRequestStatus.PENDING) {
      throw new BadRequestException('该申请当前状态不可审批');
    }
    const updated = this.repo.updateBorrowRequest(id, {
      status: BorrowRequestStatus.APPROVED,
    });
    return this.enrichBorrowRequest(updated!);
  }

  reject(id: string, reason: string): BorrowRequestDetail {
    const req = this.repo.getBorrowRequestById(id);
    if (!req) {
      throw new NotFoundException('借用申请不存在');
    }
    if (req.status !== BorrowRequestStatus.PENDING) {
      throw new BadRequestException('该申请当前状态不可驳回');
    }
    const updated = this.repo.updateBorrowRequest(id, {
      status: BorrowRequestStatus.REJECTED,
      damage_notes: reason,
    });
    return this.enrichBorrowRequest(updated!);
  }

  getStatusLabel(status: BorrowRequestStatus): string {
    const map: Record<BorrowRequestStatus, string> = {
      [BorrowRequestStatus.PENDING]: '待审核',
      [BorrowRequestStatus.APPROVED]: '已批准待发货',
      [BorrowRequestStatus.REJECTED]: '已驳回',
      [BorrowRequestStatus.SHIPPED]: '已借出',
      [BorrowRequestStatus.RETURNED]: '已归还待消毒',
      [BorrowRequestStatus.COMPLETED]: '已完成',
    };
    return map[status];
  }

  private enrichBorrowRequest(req: BorrowRequest): BorrowRequestDetail {
    const type = this.repo.getEquipmentTypeById(req.type_id)!;
    const stock = this.repo.getStockCountByTypeId(req.type_id);
    const alternatives = this.equipmentService.getAlternativeTypes(req.type_id);
    return {
      ...req,
      type,
      available_count: stock.available,
      cleaning_count: stock.cleaning,
      alternatives,
    };
  }
}
