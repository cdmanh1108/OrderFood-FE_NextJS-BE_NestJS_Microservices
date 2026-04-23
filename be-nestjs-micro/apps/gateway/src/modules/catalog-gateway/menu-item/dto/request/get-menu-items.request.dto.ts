import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class GetMenuItemsRequestDto {
  @IsOptional()
  @IsString({ message: 'keyword must be a string' })
  keyword?: string;

  @IsOptional()
  @IsUUID('4', { message: 'categoryId is invalid' })
  categoryId?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'limit must be an integer' })
  @Min(1, { message: 'limit must be >= 1' })
  @Max(200, { message: 'limit must be <= 200' })
  limit?: number = 100;
}
