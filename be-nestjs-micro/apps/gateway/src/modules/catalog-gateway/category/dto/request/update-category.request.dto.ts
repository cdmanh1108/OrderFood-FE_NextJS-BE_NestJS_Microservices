import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateCategoryRequestDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MaxLength(120, { message: 'Name max length is 120' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  @MaxLength(120, { message: 'Slug max length is 120' })
  slug?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Image must be a string' })
  image?: string;

  @IsOptional()
  @IsInt({ message: 'sortOrder must be an integer' })
  @Min(0, { message: 'sortOrder must be >= 0' })
  sortOrder?: number;
}
