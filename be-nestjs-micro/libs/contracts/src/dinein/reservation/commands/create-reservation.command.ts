export interface CreateReservationCommand {
  tableId: string;
  userId?: string;
  guestName: string;
  guestPhone: string;
  partySize: number;
  scheduledAt: string;
  note?: string;
}
