import { IsUUID } from 'class-validator';

export class ClearCartRequestDto {
  @IsUUID('4', { message: 'cartId không hợp lệ' })
  cartId!: string;
}
