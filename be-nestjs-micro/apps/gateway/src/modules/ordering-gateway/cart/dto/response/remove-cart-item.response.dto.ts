export class RemoveCartItemResponseDto {
  cartId!: string;
  itemId!: string;
  removed!: boolean;
  remainingItems!: number;
}
