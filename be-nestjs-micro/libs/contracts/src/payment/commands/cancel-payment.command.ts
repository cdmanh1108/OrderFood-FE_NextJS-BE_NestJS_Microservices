export class CancelPaymentCommand {
  id: string;

  reason?: string | null;
  rawPayload?: Record<string, any> | null;
}