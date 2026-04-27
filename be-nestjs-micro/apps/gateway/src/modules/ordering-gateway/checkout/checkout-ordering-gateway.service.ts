import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CalculateCheckoutRequestDto } from './dto/request/calculate-checkout.request.dto';
import { CheckoutPricingResult } from '@app/contracts/ordering/checkout/results/checkout-pricing.result';
import { CalculateCheckoutCommand } from '@app/contracts/ordering/checkout/commands/calculate-checkout.command';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';

@Injectable()
export class CheckoutOrderingGatewayService {
  constructor(
    @Inject(RMQ_SERVICES.ORDERING)
    private readonly orderingClient: ClientProxy,
  ) {}

  async calculate(
    userId: string,
    dto: CalculateCheckoutRequestDto,
  ): Promise<CheckoutPricingResult> {
    const command: CalculateCheckoutCommand = {
      userId,
      items: dto.items,
      shippingAddressId: dto.shippingAddressId,
      promoCode: dto.promoCode,
    };

    return lastValueFrom(
      this.orderingClient.send('calculate_checkout', command),
    );
  }
}
