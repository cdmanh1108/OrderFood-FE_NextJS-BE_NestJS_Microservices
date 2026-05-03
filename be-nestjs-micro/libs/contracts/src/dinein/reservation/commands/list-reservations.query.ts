import { ReservationStatus } from '../../enums/reservation-status.enum';

export interface ListReservationsQuery {
  tableId?: string;
  userId?: string;
  status?: ReservationStatus;
  date?: string;
  page?: number;
  limit?: number;
}
