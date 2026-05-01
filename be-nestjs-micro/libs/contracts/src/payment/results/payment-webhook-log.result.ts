import { WebhookProcessStatus } from '../enums/webhook-process-status.enum';

export class PaymentWebhookLogResult {
  id: string;

  paymentId?: string | null;

  gateway: string;
  eventType?: string | null;
  eventId?: string | null;

  status: WebhookProcessStatus;

  headers?: Record<string, unknown> | null;
  payload: Record<string, unknown>;
  signature?: string | null;

  processedAt?: Date | null;
  errorMessage?: string | null;

  createdAt: Date;
  updatedAt: Date;
}

