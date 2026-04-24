import { FulfillmentStatus } from '@app/contracts/ordering/enums/fulfillment-status.enum';
import { OrderStatus } from '@app/contracts/ordering/enums/order-status.enum';
import { PaymentStatus } from '@app/contracts/ordering/enums/payment-status.enum';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class ListOrdersRequestDto {
  @IsOptional()
  @IsString({ message: 'userId phai la chuoi' })
  @Matches(/^c[a-z0-9]{24}$/, { message: 'userId khong hop le' })
  userId?: string;

  @IsOptional()
  @IsString({ message: 'keyword must be a string' })
  keyword?: string;

  @IsOptional()
  @IsEnum(OrderStatus, { message: 'status is invalid' })
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus, { message: 'paymentStatus is invalid' })
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsEnum(FulfillmentStatus, { message: 'fulfillmentStatus is invalid' })
  fulfillmentStatus?: FulfillmentStatus;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'page must be an integer' })
  @Min(1, { message: 'page must be >= 1' })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'limit must be an integer' })
  @Min(1, { message: 'limit must be >= 1' })
  @Max(100, { message: 'limit must be <= 100' })
  limit?: number = 10;
}
