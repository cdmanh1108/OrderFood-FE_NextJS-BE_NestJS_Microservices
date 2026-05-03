import { ReservationStatus } from '../../enums/reservation-status.enum';

export interface UpdateReservationStatusCommand {
  id: string;
  status: ReservationStatus;
}
