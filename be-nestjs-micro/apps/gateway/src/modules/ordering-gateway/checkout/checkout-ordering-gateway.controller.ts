import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@app/auth';
import { CheckoutOrderingGatewayService } from './checkout-ordering-gateway.service';
import { CalculateCheckoutRequestDto } from './dto/request/calculate-checkout.request.dto';
import type { RequestWithUser } from '@app/auth';
import { ERRORS } from '@app/common/constants/error-code.constant';

@UseGuards(JwtAuthGuard)
@Controller('ordering/checkout')
export class CheckoutOrderingGatewayController {
  constructor(
    private readonly checkoutService: CheckoutOrderingGatewayService,
  ) {}

  private getUserId(request: RequestWithUser): string {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException({
        code: ERRORS.UNAUTHORIZED.code,
        message: ERRORS.UNAUTHORIZED.message,
      });
    }
    return userId;
  }

  @Post('calculate')
  async calculate(
    @Req() request: RequestWithUser,
    @Body() dto: CalculateCheckoutRequestDto,
  ) {
    return this.checkoutService.calculate(this.getUserId(request), dto);
  }
}
