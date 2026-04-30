import { IsString } from 'class-validator';

export class PaymentWebhookParamsDto {
  @IsString()
  gateway: string;
}
