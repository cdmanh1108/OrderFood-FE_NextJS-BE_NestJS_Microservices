import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateTableRequestDto {
  @IsNotEmpty({ message: 'Số bàn không được để trống' })
  @IsString()
  number: string;

  @IsNotEmpty({ message: 'Số chỗ ngồi không được để trống' })
  @IsNumber()
  @Min(1, { message: 'Số chỗ ngồi phải >= 1' })
  seats: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  qrCode?: string;
}
