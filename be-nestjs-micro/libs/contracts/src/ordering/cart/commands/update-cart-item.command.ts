export interface UpdateCartItemCommand {
  cartId: string;
  itemId: string;
  quantity?: number;
  note?: string;
}
