import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { mapRpcErrorToHttpException } from '@app/common/utils/map-rpc-error-to-http.utils';
import { CalculateCheckoutRequestDto } from './dto/request/calculate-checkout.request.dto';
import { PlaceOrderRequestDto } from './dto/request/place-order.request.dto';
import { CheckoutPricingResult } from '@app/contracts/ordering/checkout/results/checkout-pricing.result';
import { CalculateCheckoutCommand } from '@app/contracts/ordering/checkout/commands/calculate-checkout.command';
import { PlaceOrderCommand } from '@app/contracts/ordering/checkout/commands/place-order.command';
import { PlaceOrderResult } from '@app/contracts/ordering/checkout/results/place-order.result';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { ORDERING_PATTERNS } from '@app/messaging/constants/patterns.constant';

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

    return firstValueFrom(
      this.orderingClient
        .send<
          CheckoutPricingResult,
          CalculateCheckoutCommand
        >(ORDERING_PATTERNS.PREVIEW_CHECKOUT, command)
        .pipe(
          catchError((error) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async checkout(
    userId: string,
    dto: PlaceOrderRequestDto,
  ): Promise<PlaceOrderResult> {
    const command: PlaceOrderCommand = {
      userId,
      items: dto.items,
      shippingAddress: dto.shippingAddress,
      note: dto.note,
      promoCode: dto.promoCode,
      paymentMethod: dto.paymentMethod,
      returnUrl: dto.returnUrl,
      cancelUrl: dto.cancelUrl,
    };

    return firstValueFrom(
      this.orderingClient
        .send<
          PlaceOrderResult,
          PlaceOrderCommand
        >(ORDERING_PATTERNS.PLACE_ORDER, command)
        .pipe(
          catchError((error) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }
}
