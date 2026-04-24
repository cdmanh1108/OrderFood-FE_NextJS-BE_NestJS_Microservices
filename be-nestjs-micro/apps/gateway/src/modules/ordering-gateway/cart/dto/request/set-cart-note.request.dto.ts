import { IsOptional, IsString, IsUUID } from 'class-validator';

export class SetCartNoteRequestDto {
  @IsUUID('4', { message: 'cartId không hợp lệ' })
  cartId!: string;

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  note?: string;
}
