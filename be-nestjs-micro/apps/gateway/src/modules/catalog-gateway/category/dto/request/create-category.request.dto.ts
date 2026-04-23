import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCategoryRequestDto {
  @IsString({ message: 'Tên danh mục phải là chuỗi' })
  @MaxLength(120, { message: 'Tên danh mục tối đa 120 ký tự' })
  name!: string;

  @IsString({ message: 'Slug phải là chuỗi' })
  @MaxLength(120, { message: 'Slug tối đa 120 ký tự' })
  slug!: string;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Ảnh phải là chuỗi' })
  image?: string;

  @IsOptional()
  @IsInt({ message: 'Thứ tự sắp xếp phải là số nguyên' })
  @Min(0, { message: 'Thứ tự sắp xếp phải lớn hơn hoặc bằng 0' })
  sortOrder?: number;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái kích hoạt phải là boolean' })
  isActive?: boolean;
}
