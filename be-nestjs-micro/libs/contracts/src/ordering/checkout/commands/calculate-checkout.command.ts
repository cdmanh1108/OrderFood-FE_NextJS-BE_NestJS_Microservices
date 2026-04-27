export class CheckoutItemDto {
  menuItemId!: string;
  quantity!: number;
  unitPrice!: number;
}

export class CalculateCheckoutCommand {
  userId!: string;
  items!: CheckoutItemDto[];
  shippingAddressId?: string;
  promoCode?: string;
}
