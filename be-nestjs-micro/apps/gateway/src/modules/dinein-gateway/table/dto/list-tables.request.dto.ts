import { TableStatus } from '@app/contracts/dinein/enums/table-status.enum';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListTablesRequestDto {
  @IsOptional()
  @IsEnum(TableStatus, { message: 'Trạng thái bàn không hợp lệ' })
  status?: TableStatus;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 100;
}
