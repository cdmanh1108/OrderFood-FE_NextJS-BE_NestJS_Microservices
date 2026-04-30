import { WebhookProcessStatus } from '../enums/webhook-process-status.enum';

export class ListPaymentWebhookLogsCommand {
  page?: number;
  limit?: number;

  paymentId?: string;
  gateway?: string;
  eventType?: string;
  eventId?: string;
  status?: WebhookProcessStatus;
}