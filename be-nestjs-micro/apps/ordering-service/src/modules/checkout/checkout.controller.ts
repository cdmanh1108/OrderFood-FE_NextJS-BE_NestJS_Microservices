import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { CheckoutService } from './checkout.service';
import type { CalculateCheckoutCommand } from '@app/contracts/ordering/checkout/commands/calculate-checkout.command';
import type { PlaceOrderCommand } from '@app/contracts/ordering/checkout/commands/place-order.command';
import { ORDERING_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { handleRpcMessage } from '@app/messaging';

@Controller()
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @MessagePattern(ORDERING_PATTERNS.PREVIEW_CHECKOUT)
  async calculateCheckout(
    @Payload() command: CalculateCheckoutCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.checkoutService.calculateCheckout(command),
    );
  }

  @MessagePattern(ORDERING_PATTERNS.PLACE_ORDER)
  async placeOrder(
    @Payload() command: PlaceOrderCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.checkoutService.placeOrder(command),
    );
  }
}
