import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class ListMenuItemsRequestDto {
  @IsOptional()
  @IsString({ message: 'keyword must be a string' })
  keyword?: string;

  @IsOptional()
  @IsUUID('4', { message: 'categoryId is invalid' })
  categoryId?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
  })
  @IsBoolean({ message: 'isActive must be boolean' })
  isActive?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
  })
  @IsBoolean({ message: 'isAvailable must be boolean' })
  isAvailable?: boolean;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'page must be an integer' })
  @Min(1, { message: 'page must be >= 1' })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'limit must be an integer' })
  @Min(1, { message: 'limit must be >= 1' })
  @Max(100, { message: 'limit must be <= 100' })
  limit?: number = 10;

  @IsOptional()
  @IsIn(['createdAt', 'name', 'price', 'sortOrder'], {
    message: 'sortBy is invalid',
  })
  sortBy?: 'createdAt' | 'name' | 'price' | 'sortOrder' = 'sortOrder';

  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: 'sortOrder is invalid',
  })
  sortOrder?: 'asc' | 'desc' = 'asc';
}
