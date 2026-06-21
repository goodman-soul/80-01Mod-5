export enum EquipmentCategory {
  WHEELCHAIR = 'wheelchair',
  WALKER = 'walker',
  OXYGEN_CONCENTRATOR = 'oxygen_concentrator',
}

export enum EquipmentStatus {
  IN_STOCK = 'in_stock',
  BORROWED = 'borrowed',
  CLEANING = 'cleaning',
  MAINTENANCE = 'maintenance',
  DAMAGED = 'damaged',
}

export enum BorrowRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SHIPPED = 'shipped',
  RETURNED = 'returned',
  COMPLETED = 'completed',
}

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

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
  cleaning_done?: boolean;
  cleaning_done_by?: string;
  cleaning_done_at?: string;
  damage_notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
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
