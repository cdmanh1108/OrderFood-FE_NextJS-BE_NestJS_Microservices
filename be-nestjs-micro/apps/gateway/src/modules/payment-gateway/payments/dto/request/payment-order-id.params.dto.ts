import { IsUUID } from 'class-validator';

export class PaymentOrderIdParamsDto {
  @IsUUID()
  orderId: string;
}