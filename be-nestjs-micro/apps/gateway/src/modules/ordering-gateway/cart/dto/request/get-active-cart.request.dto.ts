import { OrderChannel } from '@app/contracts/ordering/enums/order-channel.enum';
import { OrderSource } from '@app/contracts/ordering/enums/order-source.enum';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class GetActiveCartRequestDto {
  @IsOptional()
  @IsString({ message: 'userId phai la chuoi' })
  @Matches(/^c[a-z0-9]{24}$/, { message: 'userId khong hop le' })
  userId?: string;

  @IsEnum(OrderChannel, { message: 'Kenh dat hang khong hop le' })
  channel!: OrderChannel;

  @IsEnum(OrderSource, { message: 'Nguon dat hang khong hop le' })
  source!: OrderSource;

  @IsOptional()
  @IsUUID('4', { message: 'tableId khong hop le' })
  tableId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'tableSessionId khong hop le' })
  tableSessionId?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
  })
  @IsBoolean({ message: 'createIfMissing phai la boolean' })
  createIfMissing?: boolean;
}
