import { Injectable } from '@nestjs/common';
import { OrderingPrismaService } from '@app/database/ordering-prisma.service';
import { CalculateCheckoutCommand } from '@app/contracts/ordering/checkout/commands/calculate-checkout.command';
import { CheckoutPricingResult } from '@app/contracts/ordering/checkout/results/checkout-pricing.result';

@Injectable()
export class CheckoutService {
  constructor(private readonly prisma: OrderingPrismaService) {}

  calculateCheckout(
    command: CalculateCheckoutCommand,
  ): Promise<CheckoutPricingResult> {
    // 1. Calculate items subtotal
    const itemsSubtotal = command.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    // 2. Shipping Fee Logic (Mock for now, can be improved later)
    // If shippingAddressId is provided, we could calculate based on distance
    // For now, let's set a flat fee of 15,000 VND if they select an address.
    // If no address is selected (Eat-in or pick-up), shipping is 0.
    let shippingFee = 0;
    if (command.shippingAddressId) {
      shippingFee = 15000;
    }

    // 3. Discount Logic
    // In the future, verify promoCode from DB.
    let discountTotal = 0;
    if (command.promoCode === 'FREESHIP') {
      discountTotal = shippingFee; // Free shipping
    } else if (command.promoCode === 'DISCOUNT10') {
      discountTotal = itemsSubtotal * 0.1; // 10% off
    }

    // 4. Other fees
    const serviceFee = 0;
    const taxTotal = 0;

    // 5. Grand Total
    const grandTotal =
      itemsSubtotal + shippingFee + serviceFee + taxTotal - discountTotal;

    return {
      itemsSubtotal,
      shippingFee,
      discountTotal,
      serviceFee,
      taxTotal,
      grandTotal: grandTotal > 0 ? grandTotal : 0,
      currency: 'VND',
    };
  }
}
