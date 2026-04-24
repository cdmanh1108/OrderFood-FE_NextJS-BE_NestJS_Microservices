import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class PreviewCheckoutRequestDto {
  @IsUUID('4', { message: 'cartId is invalid' })
  cartId!: string;

  @IsOptional()
  @IsNumber({}, { message: 'discountTotal must be a number' })
  @Min(0, { message: 'discountTotal must be >= 0' })
  discountTotal?: number;

  @IsOptional()
  @IsNumber({}, { message: 'shippingFee must be a number' })
  @Min(0, { message: 'shippingFee must be >= 0' })
  shippingFee?: number;

  @IsOptional()
  @IsNumber({}, { message: 'serviceFee must be a number' })
  @Min(0, { message: 'serviceFee must be >= 0' })
  serviceFee?: number;

  @IsOptional()
  @IsNumber({}, { message: 'taxTotal must be a number' })
  @Min(0, { message: 'taxTotal must be >= 0' })
  taxTotal?: number;
}
