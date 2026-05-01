export class HandlePaymentWebhookCommand {
  gateway: string;
  headers?: Record<string, string | string[] | undefined>;
  payload: Record<string, unknown>;
  signature?: string | null;
}


