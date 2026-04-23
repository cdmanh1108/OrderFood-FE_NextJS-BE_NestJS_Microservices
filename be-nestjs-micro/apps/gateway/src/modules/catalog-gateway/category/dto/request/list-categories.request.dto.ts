import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class ListCategoriesRequestDto {
  @IsOptional()
  @IsString({ message: 'Từ khóa phải là chuỗi' })
  keyword?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
  })
  @IsBoolean({ message: 'isActive phải là boolean' })
  isActive?: boolean;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'page phải là số nguyên' })
  @Min(1, { message: 'page phải >= 1' })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'limit phải là số nguyên' })
  @Min(1, { message: 'limit phải >= 1' })
  @Max(100, { message: 'limit phải <= 100' })
  limit?: number = 10;

  @IsOptional()
  @IsIn(['createdAt', 'name', 'sortOrder'], {
    message: 'sortBy không hợp lệ',
  })
  sortBy?: 'createdAt' | 'name' | 'sortOrder' = 'sortOrder';

  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: 'sortOrder không hợp lệ',
  })
  sortOrder?: 'asc' | 'desc' = 'asc';
}
