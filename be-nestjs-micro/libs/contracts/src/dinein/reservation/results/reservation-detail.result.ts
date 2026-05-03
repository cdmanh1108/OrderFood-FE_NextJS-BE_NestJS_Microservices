import { ReservationStatus } from '../../enums/reservation-status.enum';

export interface ReservationDetailResult {
  id: string;
  tableId: string;
  tableNumber: string;
  userId: string | null;
  guestName: string;
  guestPhone: string;
  partySize: number;
  scheduledAt: Date;
  note: string | null;
  status: ReservationStatus;
  createdAt: Date;
  updatedAt: Date;
}
