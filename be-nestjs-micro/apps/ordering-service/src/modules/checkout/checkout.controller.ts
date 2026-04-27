import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { CheckoutService } from './checkout.service';
import { CalculateCheckoutCommand } from '@app/contracts/ordering/checkout/commands/calculate-checkout.command';
import { handleRpcMessage } from '@app/messaging';

@Controller()
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @EventPattern('calculate_checkout')
  async calculateCheckout(
    @Payload() command: CalculateCheckoutCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.checkoutService.calculateCheckout(command),
    );
  }
}
