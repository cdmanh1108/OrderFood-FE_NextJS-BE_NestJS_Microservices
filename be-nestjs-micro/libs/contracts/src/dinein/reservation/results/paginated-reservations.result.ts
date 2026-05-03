import { ReservationDetailResult } from './reservation-detail.result';

export interface PaginatedReservationsResult {
  items: ReservationDetailResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
