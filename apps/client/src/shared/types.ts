export const EquipmentCategory = {
  WHEELCHAIR: 'wheelchair',
  WALKER: 'walker',
  OXYGEN_CONCENTRATOR: 'oxygen_concentrator',
} as const;
export type EquipmentCategory = (typeof EquipmentCategory)[keyof typeof EquipmentCategory];

export const EquipmentStatus = {
  IN_STOCK: 'in_stock',
  BORROWED: 'borrowed',
  CLEANING: 'cleaning',
  MAINTENANCE: 'maintenance',
  DAMAGED: 'damaged',
} as const;
export type EquipmentStatus = (typeof EquipmentStatus)[keyof typeof EquipmentStatus];

export const BorrowRequestStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SHIPPED: 'shipped',
  RETURNED: 'returned',
  COMPLETED: 'completed',
} as const;
export type BorrowRequestStatus = (typeof BorrowRequestStatus)[keyof typeof BorrowRequestStatus];

export const ReservationStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;
export type ReservationStatus = (typeof ReservationStatus)[keyof typeof ReservationStatus];

export interface EquipmentType {
  id: string;
  category: EquipmentCategory;
  name: string;
  description: string;
  deposit: number;
  adaptation_guide: string;
  accessories: string[];
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: string;
  type_id: string;
  serial_number: string;
  status: EquipmentStatus;
  last_cleaned_at?: string;
  last_maintained_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EquipmentTypeWithStock extends EquipmentType {
  stock: {
    total: number;
    available: number;
    cleaning: number;
    borrowed: number;
    maintenance: number;
  };
}

export interface BorrowRequest {
  id: string;
  elderly_id: string;
  elderly_name: string;
  elderly_phone: string;
  type_id: string;
  deposit_paid: boolean;
  expected_return_date: string;
  adaptation_notes?: string;
  status: BorrowRequestStatus;
  equipment_id?: string;
  shipped_by?: string;
  shipped_at?: string;
  returned_at?: string;
  damage_notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface BorrowRequestDetail extends BorrowRequest {
  type: EquipmentTypeWithStock;
  available_count: number;
  cleaning_count: number;
  alternatives: EquipmentTypeWithStock[];
}

export interface ShipmentRecord {
  id: string;
  borrow_request_id: string;
  equipment_id: string;
  serial_number: string;
  accessories: string[];
  shipped_by: string;
  shipped_at: string;
}

export interface ReturnRecord {
  id: string;
  borrow_request_id: string;
  equipment_id: string;
  returned_at: string;
  cleaning_completed: boolean;
  cleaning_completed_by?: string;
  cleaning_completed_at?: string;
  has_damage: boolean;
  damage_description?: string;
  restocked: boolean;
  restocked_at?: string;
}

export interface ServiceReservation {
  id: string;
  elderly_id: string;
  elderly_name: string;
  elderly_phone: string;
  type_id: string;
  preferred_date: string;
  note?: string;
  created_by: string;
  status: ReservationStatus;
  created_at: string;
  updated_at: string;
}

export interface ReservationDetail extends ServiceReservation {
  type: EquipmentTypeWithStock;
  available_count: number;
  cleaning_count: number;
  stock_warning?: string;
  alternatives: EquipmentTypeWithStock[];
}

export const CATEGORY_LABEL: Record<EquipmentCategory, string> = {
  [EquipmentCategory.WHEELCHAIR]: '轮椅',
  [EquipmentCategory.WALKER]: '助行器',
  [EquipmentCategory.OXYGEN_CONCENTRATOR]: '制氧机',
};

export const EQUIPMENT_STATUS_LABEL: Record<EquipmentStatus, string> = {
  [EquipmentStatus.IN_STOCK]: '在库可借',
  [EquipmentStatus.BORROWED]: '已借出',
  [EquipmentStatus.CLEANING]: '清洁消毒中',
  [EquipmentStatus.MAINTENANCE]: '维修保养中',
  [EquipmentStatus.DAMAGED]: '已损坏',
};

export const BORROW_STATUS_LABEL: Record<BorrowRequestStatus, string> = {
  [BorrowRequestStatus.PENDING]: '待审核',
  [BorrowRequestStatus.APPROVED]: '已批准待发货',
  [BorrowRequestStatus.REJECTED]: '已驳回',
  [BorrowRequestStatus.SHIPPED]: '已借出',
  [BorrowRequestStatus.RETURNED]: '已归还待消毒',
  [BorrowRequestStatus.COMPLETED]: '已完成',
};

export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  [ReservationStatus.PENDING]: '待确认',
  [ReservationStatus.CONFIRMED]: '已确认',
  [ReservationStatus.CANCELLED]: '已取消',
  [ReservationStatus.COMPLETED]: '已完成',
};
