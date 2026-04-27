import { FulfillmentStatus } from '@app/contracts/ordering/enums/fulfillment-status.enum';
import { OrderStatus } from '@app/contracts/ordering/enums/order-status.enum';
import { PaymentStatus } from '@app/contracts/ordering/enums/payment-status.enum';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class UpdateOrderStatusRequestDto {
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'status is invalid' })
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus, { message: 'paymentStatus is invalid' })
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsEnum(FulfillmentStatus, { message: 'fulfillmentStatus is invalid' })
  fulfillmentStatus?: FulfillmentStatus;
}
