import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CheckoutItemRequestDto {
  @IsString()
  @IsNotEmpty()
  menuItemId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class CalculateCheckoutRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemRequestDto)
  items!: CheckoutItemRequestDto[];

  @IsString()
  @IsOptional()
  shippingAddressId?: string;

  @IsString()
  @IsOptional()
  promoCode?: string;
}
