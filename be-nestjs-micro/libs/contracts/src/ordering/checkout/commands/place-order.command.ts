import { PaymentMethod } from '../../../payment/enums/payment-method.enum';

export interface PlaceOrderItemCommand {
  menuItemId: string;
  menuItemName: string;
  menuItemImageUrl?: string;
  unitPrice: number;
  quantity: number;
  note?: string;
}

export interface PlaceOrderShippingAddressCommand {
  receiverName: string;
  receiverPhone: string;
  province: string;
  district: string;
  ward: string;
  street?: string;
  detail?: string;
  latitude?: number;
  longitude?: number;
}

export interface PlaceOrderCommand {
  userId: string;
  items: PlaceOrderItemCommand[];
  shippingAddress?: PlaceOrderShippingAddressCommand;
  note?: string;
  promoCode?: string;

  paymentMethod: PaymentMethod;
  returnUrl?: string;
  cancelUrl?: string;
}
