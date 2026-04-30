export class HandlePaymentWebhookResponseDto {
  success: boolean;
  ignored?: boolean;
  paymentId?: string | null;
  status?: string | null;
  message?: string | null;
}