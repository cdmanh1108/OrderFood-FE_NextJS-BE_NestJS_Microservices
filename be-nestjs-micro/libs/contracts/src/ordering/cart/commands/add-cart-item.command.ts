export interface AddCartItemCommand {
  cartId: string;
  menuItemId: string;
  menuItemName: string;
  menuItemImageUrl?: string;
  unitPrice: number;
  quantity?: number;
  note?: string;
}
