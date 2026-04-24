import { IsUUID } from 'class-validator';

export class RemoveCartItemRequestDto {
  @IsUUID('4', { message: 'cartId không hợp lệ' })
  cartId!: string;

  @IsUUID('4', { message: 'itemId không hợp lệ' })
  itemId!: string;
}
