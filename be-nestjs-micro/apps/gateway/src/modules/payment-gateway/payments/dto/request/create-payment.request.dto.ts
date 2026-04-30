import { PaymentMethod } from '@app/contracts/payment/enums/payment-method.enum';
import {
  IsEnum,
  IsISO8601,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreatePaymentRequestDto {
  @IsUUID()
  orderId: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  orderCode?: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsString()
  amount: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  returnUrl?: string;

  @IsOptional()
  @IsString()
  cancelUrl?: string;

  @IsOptional()
  @IsISO8601()
  expiresAt?: string;
}