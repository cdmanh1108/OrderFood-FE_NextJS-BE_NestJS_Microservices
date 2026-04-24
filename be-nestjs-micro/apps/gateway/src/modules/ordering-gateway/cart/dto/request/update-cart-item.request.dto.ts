import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class UpdateCartItemRequestDto {
  @IsUUID('4', { message: 'cartId không hợp lệ' })
  cartId!: string;

  @IsUUID('4', { message: 'itemId không hợp lệ' })
  itemId!: string;

  @IsOptional()
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng phải lớn hơn hoặc bằng 1' })
  quantity?: number;

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  note?: string;
}
