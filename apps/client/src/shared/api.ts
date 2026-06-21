import type {
  EquipmentTypeWithStock,
  Equipment,
  BorrowRequestDetail,
  ReservationDetail,
  BorrowRequestStatus,
  ReservationStatus,
  EquipmentCategory,
  EquipmentStatus,
  ShipmentRecord,
  ReturnRecord,
} from './types';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `请求失败: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getEquipmentTypes: (category?: EquipmentCategory) =>
    request<EquipmentTypeWithStock[]>(
      `/equipment/types${category ? `?category=${category}` : ''}`,
    ),

  getEquipmentType: (id: string) =>
    request<EquipmentTypeWithStock>(`/equipment/types/${id}`),

  getEquipmentAlternatives: (id: string) =>
    request<EquipmentTypeWithStock[]>(`/equipment/types/${id}/alternatives`),

  getEquipmentsByType: (typeId: string, status?: EquipmentStatus) =>
    request<(Equipment & { type: EquipmentTypeWithStock })[]>(
      `/equipment/types/${typeId}/equipments${status ? `?status=${status}` : ''}`,
    ),

  getAvailableEquipments: (typeId: string) =>
    request<(Equipment & { type: EquipmentTypeWithStock })[]>(
      `/equipment/types/${typeId}/available`,
    ),

  getBorrowRequests: (status?: BorrowRequestStatus) =>
    request<BorrowRequestDetail[]>(
      `/borrow${status ? `?status=${status}` : ''}`,
    ),

  getBorrowRequest: (id: string) =>
    request<BorrowRequestDetail>(`/borrow/${id}`),

  createBorrowRequest: (data: {
    elderly_id: string;
    elderly_name: string;
    elderly_phone: string;
    type_id: string;
    deposit_paid: boolean;
    expected_return_date: string;
    adaptation_notes?: string;
    created_by?: string;
  }) =>
    request<BorrowRequestDetail>('/borrow', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  approveBorrowRequest: (id: string) =>
    request<BorrowRequestDetail>(`/borrow/${id}/approve`, { method: 'POST' }),

  rejectBorrowRequest: (id: string, reason: string) =>
    request<BorrowRequestDetail>(`/borrow/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  getPendingShipments: () =>
    request<
      {
        borrow_request_id: string;
        elderly_name: string;
        elderly_phone: string;
        type_name: string;
        deposit: number;
        expected_return_date: string;
        adaptation_notes?: string;
        available_equipments: (Equipment & { type: EquipmentTypeWithStock })[];
      }[]
    >('/warehouse/pending-shipments'),

  shipEquipment: (data: {
    borrow_request_id: string;
    equipment_id: string;
    accessories: string[];
    shipped_by: string;
  }) =>
    request<ShipmentRecord>('/warehouse/ship', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getShipment: (borrowRequestId: string) =>
    request<ShipmentRecord | null>(`/warehouse/shipments/${borrowRequestId}`),

  returnEquipment: (data: {
    borrow_request_id: string;
    equipment_id: string;
    has_damage: boolean;
    damage_description?: string;
  }) =>
    request<ReturnRecord>('/warehouse/return', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getPendingReturns: () =>
    request<
      (ReturnRecord & {
        equipment: Equipment & { type: EquipmentTypeWithStock };
        elderly_name?: string;
      })[]
    >('/warehouse/pending-returns'),

  completeCleaning: (data: {
    return_record_id: string;
    completed_by: string;
  }) =>
    request<ReturnRecord>('/warehouse/complete-cleaning', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  restockEquipment: (data: { return_record_id: string }) =>
    request<ReturnRecord>('/warehouse/restock', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getReservations: (status?: ReservationStatus) =>
    request<ReservationDetail[]>(
      `/reservations${status ? `?status=${status}` : ''}`,
    ),

  getReservation: (id: string) =>
    request<ReservationDetail>(`/reservations/${id}`),

  createReservation: (data: {
    elderly_id: string;
    elderly_name: string;
    elderly_phone: string;
    type_id: string;
    preferred_date: string;
    note?: string;
    created_by: string;
  }) =>
    request<ReservationDetail>('/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  confirmReservation: (id: string) =>
    request<ReservationDetail>(`/reservations/${id}/confirm`, {
      method: 'POST',
    }),

  cancelReservation: (id: string, reason?: string) =>
    request<ReservationDetail>(`/reservations/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  completeReservation: (id: string) =>
    request<ReservationDetail>(`/reservations/${id}/complete`, {
      method: 'POST',
    }),
};
