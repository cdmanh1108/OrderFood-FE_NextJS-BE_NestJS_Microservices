import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class RecordLocationDto {
  @IsNotEmpty()
  @IsNumber()
  lat: number;

  @IsNotEmpty()
  @IsNumber()
  lng: number;

  @IsOptional()
  @IsNumber()
  accuracy?: number;
}
