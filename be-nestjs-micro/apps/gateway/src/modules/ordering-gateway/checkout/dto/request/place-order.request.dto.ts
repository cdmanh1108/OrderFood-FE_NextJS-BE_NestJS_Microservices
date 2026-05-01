import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '@app/contracts/payment/enums/payment-method.enum';

export class PlaceOrderItemRequestDto {
  @IsString()
  @IsNotEmpty()
  menuItemId!: string;

  @IsString()
  @IsNotEmpty()
  menuItemName!: string;

  @IsOptional()
  @IsString()
  menuItemImageUrl?: string;

  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class PlaceOrderShippingAddressRequestDto {
  @IsString()
  @IsNotEmpty()
  receiverName!: string;

  @IsString()
  @IsNotEmpty()
  receiverPhone!: string;

  @IsString()
  @IsNotEmpty()
  province!: string;

  @IsString()
  @IsNotEmpty()
  district!: string;

  @IsString()
  @IsNotEmpty()
  ward!: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  detail?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class PlaceOrderRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlaceOrderItemRequestDto)
  items!: PlaceOrderItemRequestDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PlaceOrderShippingAddressRequestDto)
  shippingAddress?: PlaceOrderShippingAddressRequestDto;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;

  @IsOptional()
  @IsString()
  promoCode?: string;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsOptional()
  @IsString()
  returnUrl?: string;

  @IsOptional()
  @IsString()
  cancelUrl?: string;
}
