export interface RemoveCartItemResult {
  cartId: string;
  itemId: string;
  removed: boolean;
  remainingItems: number;
}
