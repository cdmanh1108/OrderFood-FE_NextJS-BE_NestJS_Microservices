export interface CancelOrderCommand {
  id: string;
  actorId?: string;
  reason?: string;
}
