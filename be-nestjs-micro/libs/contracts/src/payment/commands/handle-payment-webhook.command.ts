export class HandlePaymentWebhookCommand {
  gateway: string;
  headers?: Record<string, any>;
  payload: Record<string, any>;
  signature?: string | null;
}
