import { ReservationStatus } from '@app/contracts/dinein/enums/reservation-status.enum';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class ListReservationsRequestDto {
  @IsOptional()
  @IsUUID()
  tableId?: string;

  @IsOptional()
  @IsEnum(ReservationStatus, { message: 'Trạng thái đặt bàn không hợp lệ' })
  status?: ReservationStatus;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
