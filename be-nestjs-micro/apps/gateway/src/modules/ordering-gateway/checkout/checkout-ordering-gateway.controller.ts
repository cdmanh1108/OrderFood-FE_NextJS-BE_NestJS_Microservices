import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@app/auth';
import { CheckoutOrderingGatewayService } from './checkout-ordering-gateway.service';
import { CalculateCheckoutRequestDto } from './dto/request/calculate-checkout.request.dto';
import { PlaceOrderRequestDto } from './dto/request/place-order.request.dto';
import type { RequestWithUser } from '@app/auth';
import { getUserIdOrThrow } from '../../../common/utils/get-user-id.util';

@UseGuards(JwtAuthGuard)
@Controller('ordering/checkout')
export class CheckoutOrderingGatewayController {
  constructor(
    private readonly checkoutService: CheckoutOrderingGatewayService,
  ) {}

  @Post('calculate')
  async calculate(
    @Req() request: RequestWithUser,
    @Body() dto: CalculateCheckoutRequestDto,
  ) {
    return this.checkoutService.calculate(getUserIdOrThrow(request), dto);
  }

  @Post()
  async checkout(
    @Req() request: RequestWithUser,
    @Body() dto: PlaceOrderRequestDto,
  ) {
    return this.checkoutService.checkout(getUserIdOrThrow(request), dto);
  }
}
