import { Injectable, NotFoundException } from '@nestjs/common';
import { MockRepository } from '../../database/mock-repository';
import {
  EquipmentType,
  Equipment,
  EquipmentCategory,
  EquipmentStatus,
} from '../../common/types';

export interface EquipmentTypeWithStock extends EquipmentType {
  stock: {
    total: number;
    available: number;
    cleaning: number;
    borrowed: number;
    maintenance: number;
  };
}

@Injectable()
export class EquipmentService {
  constructor(private readonly repo: MockRepository) {}

  getAllTypes(category?: EquipmentCategory): EquipmentTypeWithStock[] {
    let types = this.repo.getEquipmentTypes();
    if (category) {
      types = types.filter((t) => t.category === category);
    }
    return types.map((t) => ({
      ...t,
      stock: this.repo.getStockCountByTypeId(t.id),
    }));
  }

  getTypeById(id: string): EquipmentTypeWithStock {
    const type = this.repo.getEquipmentTypeById(id);
    if (!type) {
      throw new NotFoundException('设备类型不存在');
    }
    return {
      ...type,
      stock: this.repo.getStockCountByTypeId(id),
    };
  }

  getEquipmentsByType(
    typeId: string,
    status?: EquipmentStatus,
  ): (Equipment & { type: EquipmentType })[] {
    const type = this.repo.getEquipmentTypeById(typeId);
    if (!type) {
      throw new NotFoundException('设备类型不存在');
    }
    const list = this.repo.getEquipments({ type_id: typeId, status });
    return list.map((e) => ({ ...e, type }));
  }

  getEquipmentById(
    id: string,
  ): (Equipment & { type: EquipmentType }) | undefined {
    const eq = this.repo.getEquipmentById(id);
    if (!eq) return undefined;
    const type = this.repo.getEquipmentTypeById(eq.type_id)!;
    return { ...eq, type };
  }

  getAvailableEquipments(
    typeId: string,
  ): (Equipment & { type: EquipmentType })[] {
    return this.getEquipmentsByType(typeId, EquipmentStatus.IN_STOCK);
  }

  getAlternativeTypes(typeId: string): EquipmentTypeWithStock[] {
    const currentType = this.repo.getEquipmentTypeById(typeId);
    if (!currentType) return [];
    return this.getAllTypes(currentType.category).filter(
      (t) => t.id !== typeId && t.stock.available > 0,
    );
  }

  getEquipmentStatusLabel(status: EquipmentStatus): string {
    const map: Record<EquipmentStatus, string> = {
      [EquipmentStatus.IN_STOCK]: '在库可借',
      [EquipmentStatus.BORROWED]: '已借出',
      [EquipmentStatus.CLEANING]: '清洁消毒中',
      [EquipmentStatus.MAINTENANCE]: '维修保养中',
      [EquipmentStatus.DAMAGED]: '已损坏',
    };
    return map[status];
  }

  getCategoryLabel(category: EquipmentCategory): string {
    const map: Record<EquipmentCategory, string> = {
      [EquipmentCategory.WHEELCHAIR]: '轮椅',
      [EquipmentCategory.WALKER]: '助行器',
      [EquipmentCategory.OXYGEN_CONCENTRATOR]: '制氧机',
    };
    return map[category];
  }
}
