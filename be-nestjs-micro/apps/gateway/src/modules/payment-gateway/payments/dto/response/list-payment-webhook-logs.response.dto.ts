import { PaymentWebhookLogResponseDto } from './payment-webhook-log.response.dto';

export class ListPaymentWebhookLogsResponseDto {
  items: PaymentWebhookLogResponseDto[];
  page: number;
  limit: number;
  total: number;
}