import { IsOptional, IsUUID } from 'class-validator';

export class SetCartAddressRequestDto {
  @IsUUID('4', { message: 'cartId không hợp lệ' })
  cartId!: string;

  @IsOptional()
  @IsUUID('4', { message: 'addressId không hợp lệ' })
  addressId?: string;
}
