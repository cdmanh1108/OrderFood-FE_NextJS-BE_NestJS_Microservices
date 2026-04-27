import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { OrderChannel } from '@app/contracts/ordering/enums/order-channel.enum';
import { OrderSource } from '@app/contracts/ordering/enums/order-source.enum';

export class OrderItemDto {
  @ApiProperty()
  @IsString()
  menuItemId: string;

  @ApiProperty()
  @IsString()
  menuItemName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  menuItemImageUrl?: string;

  @ApiProperty()
  @IsNumber()
  unitPrice: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

export class OrderShippingAddressDto {
  @ApiProperty()
  @IsString()
  receiverName: string;

  @ApiProperty()
  @IsString()
  receiverPhone: string;

  @ApiProperty()
  @IsString()
  province: string;

  @ApiProperty()
  @IsString()
  district: string;

  @ApiProperty()
  @IsString()
  ward: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  detail?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class CreateOrderRequestDto {
  @ApiProperty({ enum: OrderChannel })
  @IsEnum(OrderChannel)
  channel: OrderChannel;

  @ApiProperty({ enum: OrderSource })
  @IsEnum(OrderSource)
  source: OrderSource;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tableId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tableSessionId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ required: false, type: OrderShippingAddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => OrderShippingAddressDto)
  shippingAddress?: OrderShippingAddressDto;
}
