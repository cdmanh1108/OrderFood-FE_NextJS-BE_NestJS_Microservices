export interface UpdateCartItemCommand {
  userId: string;
  cartId: string;
  itemId: string;
  quantity?: number;
  note?: string;
}
