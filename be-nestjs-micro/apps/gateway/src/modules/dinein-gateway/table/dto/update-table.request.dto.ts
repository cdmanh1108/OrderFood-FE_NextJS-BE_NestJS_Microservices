import { TableStatus } from '@app/contracts/dinein/enums/table-status.enum';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateTableRequestDto {
  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Số chỗ ngồi phải >= 1' })
  seats?: number;

  @IsOptional()
  @IsEnum(TableStatus, { message: 'Trạng thái bàn không hợp lệ' })
  status?: TableStatus;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  qrCode?: string;
}
