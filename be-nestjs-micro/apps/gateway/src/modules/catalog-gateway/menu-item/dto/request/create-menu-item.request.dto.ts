import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMenuItemRequestDto {
  @IsString({ message: 'Name must be a string' })
  @MaxLength(150, { message: 'Name max length is 150' })
  name!: string;

  @IsString({ message: 'Slug must be a string' })
  @MaxLength(150, { message: 'Slug max length is 150' })
  slug!: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price must be >= 0' })
  price!: number;

  @IsOptional()
  @IsString({ message: 'Image must be a string' })
  image?: string;

  @IsOptional()
  @IsString({ message: 'SKU must be a string' })
  @MaxLength(50, { message: 'SKU max length is 50' })
  sku?: string;

  @IsOptional()
  @IsInt({ message: 'sortOrder must be an integer' })
  @Min(0, { message: 'sortOrder must be >= 0' })
  sortOrder?: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be boolean' })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'isAvailable must be boolean' })
  isAvailable?: boolean;

  @IsUUID('4', { message: 'categoryId is invalid' })
  categoryId!: string;
}
