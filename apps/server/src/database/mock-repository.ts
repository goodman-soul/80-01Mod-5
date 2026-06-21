import { Injectable } from '@nestjs/common';
import {
  EquipmentType,
  Equipment,
  BorrowRequest,
  ShipmentRecord,
  ReturnRecord,
  ServiceReservation,
  EquipmentStatus,
  BorrowRequestStatus,
  ReservationStatus,
} from '../common/types';
import {
  mockEquipmentTypes,
  mockEquipments,
  mockBorrowRequests,
  mockShipmentRecords,
  mockReturnRecords,
  mockServiceReservations,
} from './mock-data.store';

@Injectable()
export class MockRepository {
  private equipmentTypes: EquipmentType[] = [...mockEquipmentTypes];
  private equipments: Equipment[] = [...mockEquipments];
  private borrowRequests: BorrowRequest[] = [...mockBorrowRequests];
  private shipmentRecords: ShipmentRecord[] = [...mockShipmentRecords];
  private returnRecords: ReturnRecord[] = [...mockReturnRecords];
  private serviceReservations: ServiceReservation[] = [...mockServiceReservations];

  private generateId(prefix: string): string {
    const rand = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${Date.now()}-${rand}`;
  }

  getEquipmentTypes(): EquipmentType[] {
    return [...this.equipmentTypes];
  }

  getEquipmentTypeById(id: string): EquipmentType | undefined {
    return this.equipmentTypes.find((t) => t.id === id);
  }

  getEquipments(filters?: {
    type_id?: string;
    status?: EquipmentStatus;
  }): Equipment[] {
    let result = [...this.equipments];
    if (filters?.type_id) {
      result = result.filter((e) => e.type_id === filters.type_id);
    }
    if (filters?.status) {
      result = result.filter((e) => e.status === filters.status);
    }
    return result;
  }

  getEquipmentById(id: string): Equipment | undefined {
    return this.equipments.find((e) => e.id === id);
  }

  updateEquipmentStatus(
    id: string,
    status: EquipmentStatus,
    extra?: Partial<Equipment>,
  ): Equipment | undefined {
    const idx = this.equipments.findIndex((e) => e.id === id);
    if (idx === -1) return undefined;
    this.equipments[idx] = {
      ...this.equipments[idx],
      status,
      ...extra,
      updated_at: new Date().toISOString(),
    };
    return this.equipments[idx];
  }

  getStockCountByTypeId(typeId: string): {
    total: number;
    available: number;
    cleaning: number;
    borrowed: number;
    maintenance: number;
  } {
    const list = this.equipments.filter((e) => e.type_id === typeId);
    return {
      total: list.length,
      available: list.filter((e) => e.status === EquipmentStatus.IN_STOCK)
        .length,
      cleaning: list.filter((e) => e.status === EquipmentStatus.CLEANING)
        .length,
      borrowed: list.filter((e) => e.status === EquipmentStatus.BORROWED)
        .length,
      maintenance: list.filter((e) => e.status === EquipmentStatus.MAINTENANCE)
        .length,
    };
  }

  getBorrowRequests(filters?: {
    status?: BorrowRequestStatus;
    elderly_id?: string;
  }): BorrowRequest[] {
    let result = [...this.borrowRequests];
    if (filters?.status) {
      result = result.filter((r) => r.status === filters.status);
    }
    if (filters?.elderly_id) {
      result = result.filter((r) => r.elderly_id === filters.elderly_id);
    }
    return result.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  getBorrowRequestById(id: string): BorrowRequest | undefined {
    return this.borrowRequests.find((r) => r.id === id);
  }

  createBorrowRequest(
    data: Omit<BorrowRequest, 'id' | 'status' | 'created_at' | 'updated_at'>,
  ): BorrowRequest {
    const now = new Date().toISOString();
    const record: BorrowRequest = {
      ...data,
      id: this.generateId('br'),
      status: BorrowRequestStatus.PENDING,
      created_at: now,
      updated_at: now,
    };
    this.borrowRequests.push(record);
    return record;
  }

  updateBorrowRequest(
    id: string,
    data: Partial<BorrowRequest>,
  ): BorrowRequest | undefined {
    const idx = this.borrowRequests.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    this.borrowRequests[idx] = {
      ...this.borrowRequests[idx],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return this.borrowRequests[idx];
  }

  createShipmentRecord(
    data: Omit<ShipmentRecord, 'id'>,
  ): ShipmentRecord {
    const record: ShipmentRecord = {
      ...data,
      id: this.generateId('ship'),
    };
    this.shipmentRecords.push(record);
    return record;
  }

  getShipmentRecordByBorrowRequestId(
    borrowRequestId: string,
  ): ShipmentRecord | undefined {
    return this.shipmentRecords.find(
      (s) => s.borrow_request_id === borrowRequestId,
    );
  }

  createReturnRecord(data: Omit<ReturnRecord, 'id'>): ReturnRecord {
    const record: ReturnRecord = {
      ...data,
      id: this.generateId('ret'),
    };
    this.returnRecords.push(record);
    return record;
  }

  updateReturnRecord(
    id: string,
    data: Partial<ReturnRecord>,
  ): ReturnRecord | undefined {
    const idx = this.returnRecords.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    this.returnRecords[idx] = {
      ...this.returnRecords[idx],
      ...data,
    };
    return this.returnRecords[idx];
  }

  getReturnRecordByBorrowRequestId(
    borrowRequestId: string,
  ): ReturnRecord | undefined {
    return this.returnRecords.find(
      (r) => r.borrow_request_id === borrowRequestId,
    );
  }

  getReturnRecords(): ReturnRecord[] {
    return [...this.returnRecords].sort(
      (a, b) =>
        new Date(b.returned_at).getTime() - new Date(a.returned_at).getTime(),
    );
  }

  getServiceReservations(filters?: {
    status?: ReservationStatus;
  }): ServiceReservation[] {
    let result = [...this.serviceReservations];
    if (filters?.status) {
      result = result.filter((r) => r.status === filters.status);
    }
    return result.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  getServiceReservationById(id: string): ServiceReservation | undefined {
    return this.serviceReservations.find((r) => r.id === id);
  }

  createServiceReservation(
    data: Omit<ServiceReservation, 'id' | 'status' | 'created_at' | 'updated_at'>,
  ): ServiceReservation {
    const now = new Date().toISOString();
    const record: ServiceReservation = {
      ...data,
      id: this.generateId('res'),
      status: ReservationStatus.PENDING,
      created_at: now,
      updated_at: now,
    };
    this.serviceReservations.push(record);
    return record;
  }

  updateServiceReservation(
    id: string,
    data: Partial<ServiceReservation>,
  ): ServiceReservation | undefined {
    const idx = this.serviceReservations.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    this.serviceReservations[idx] = {
      ...this.serviceReservations[idx],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return this.serviceReservations[idx];
  }
}
