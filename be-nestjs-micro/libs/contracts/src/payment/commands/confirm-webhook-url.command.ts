import { PaymentMethod } from '../enums/payment-method.enum';

export interface ConfirmWebhookUrlCommand {
  gateway: PaymentMethod | string;
  webhookUrl: string;
}
