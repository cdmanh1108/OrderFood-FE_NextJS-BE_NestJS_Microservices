import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateReservationRequestDto {
  @IsNotEmpty()
  @IsUUID()
  tableId: string;

  @IsNotEmpty()
  @IsString()
  guestName: string;

  @IsNotEmpty()
  @IsString()
  guestPhone: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  partySize: number;

  @IsNotEmpty()
  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsString()
  note?: string;
}
