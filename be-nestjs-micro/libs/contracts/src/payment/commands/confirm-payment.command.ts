export class ConfirmPaymentCommand {
  id: string;

  gatewayTransactionId?: string | null;
  gatewayReference?: string | null;

  rawPayload?: Record<string, any> | null;
}