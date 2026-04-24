import { IsOptional, IsString, IsUUID } from 'class-validator';

export class PlaceOrderRequestDto {
  @IsUUID('4', { message: 'cartId is invalid' })
  cartId!: string;

  @IsOptional()
  @IsUUID('4', { message: 'actorId is invalid' })
  actorId?: string;

  @IsOptional()
  @IsString({ message: 'note must be a string' })
  note?: string;
}
