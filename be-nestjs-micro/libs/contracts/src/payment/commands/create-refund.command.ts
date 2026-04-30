export class CreateRefundCommand {
  paymentId: string;

  amount: string;
  currency?: string;

  reason?: string | null;
  requestedBy?: string | null;

  metadata?: Record<string, any> | null;
}