import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class AddCartItemRequestDto {
  @IsUUID('4', { message: 'cartId không hợp lệ' })
  cartId!: string;

  @IsUUID('4', { message: 'menuItemId không hợp lệ' })
  menuItemId!: string;

  @IsString({ message: 'Tên món phải là chuỗi' })
  @MaxLength(150, { message: 'Tên món tối đa 150 ký tự' })
  menuItemName!: string;

  @IsOptional()
  @IsString({ message: 'Đường dẫn ảnh món phải là chuỗi' })
  @MaxLength(255, { message: 'Đường dẫn ảnh món tối đa 255 ký tự' })
  menuItemImageUrl?: string;

  @IsNumber({}, { message: 'Giá món phải là số' })
  @Min(0, { message: 'Giá món phải lớn hơn hoặc bằng 0' })
  unitPrice!: number;

  @IsOptional()
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng phải lớn hơn hoặc bằng 1' })
  quantity?: number;

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  note?: string;
}
