import { PaymentWebhookLogResult } from './payment-webhook-log.result';

export class ListPaymentWebhookLogsResult {
  items: PaymentWebhookLogResult[];
  page: number;
  limit: number;
  total: number;
}