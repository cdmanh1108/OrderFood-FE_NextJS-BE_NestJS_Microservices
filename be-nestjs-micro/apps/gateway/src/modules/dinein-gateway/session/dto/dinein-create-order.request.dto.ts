import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class DineInOrderItemDto {
  @IsString()
  menuItemId: string;

  @IsString()
  menuItemName: string;

  @IsOptional()
  @IsString()
  menuItemImageUrl?: string;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class DineInCreateOrderRequestDto {
  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DineInOrderItemDto)
  items: DineInOrderItemDto[];
}
