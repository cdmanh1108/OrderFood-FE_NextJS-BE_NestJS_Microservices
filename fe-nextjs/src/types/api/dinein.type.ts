export enum TableStatusApi {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  CLEANING = 'CLEANING',
}

export enum ReservationStatusApi {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELED = 'CANCELED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

// ---- Table ----

export interface TableApiModel {
  id: string;
  number: string;
  seats: number;
  status: TableStatusApi;
  note: string | null;
  qrCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTablesResponse {
  items: TableApiModel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListTablesRequest {
  status?: TableStatusApi;
  page?: number;
  limit?: number;
}

export interface CreateTableRequest {
  number: string;
  seats: number;
  note?: string;
  qrCode?: string;
}

export interface UpdateTableRequest {
  number?: string;
  seats?: number;
  status?: TableStatusApi;
  note?: string;
  qrCode?: string;
}

// ---- Reservation ----

export interface ReservationApiModel {
  id: string;
  tableId: string;
  tableNumber: string;
  userId: string | null;
  guestName: string;
  guestPhone: string;
  partySize: number;
  scheduledAt: string;
  note: string | null;
  status: ReservationStatusApi;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedReservationsResponse {
  items: ReservationApiModel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListReservationsRequest {
  tableId?: string;
  status?: ReservationStatusApi;
  date?: string;
  page?: number;
  limit?: number;
}

export interface CreateReservationRequest {
  tableId: string;
  guestName: string;
  guestPhone: string;
  partySize: number;
  scheduledAt: string;
  note?: string;
}

export interface UpdateReservationStatusRequest {
  status: ReservationStatusApi;
}

// ---- TableSession ----

export enum TableSessionStatusApi {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

export type DineInPaymentMethodApi = 'CASH' | 'BANK_TRANSFER';

export interface TableSessionApiModel {
  id: string;
  tableId: string;
  table: TableApiModel;
  status: TableSessionStatusApi;
  paymentMethod: DineInPaymentMethodApi | null;
  openedAt: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
