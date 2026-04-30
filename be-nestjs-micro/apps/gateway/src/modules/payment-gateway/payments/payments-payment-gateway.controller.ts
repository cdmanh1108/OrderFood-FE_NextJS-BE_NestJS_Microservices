import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, Roles } from '@app/auth';
import { PaymentsPaymentGatewayService } from './payments-payment-gateway.service';

import { ListPaymentsQueryDto } from './dto/request/list-payments.query.dto';
import { CreatePaymentRequestDto } from './dto/request/create-payment.request.dto';
import { ConfirmPaymentRequestDto } from './dto/request/confirm-payment.request.dto';
import { CancelPaymentRequestDto } from './dto/request/cancel-payment.request.dto';
import { PaymentOrderIdParamsDto } from './dto/request/payment-order-id.params.dto';
import { PaymentIdParamsDto } from './dto/request/payment-id.params.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsPaymentGatewayController {
  constructor(private readonly paymentsService: PaymentsPaymentGatewayService) {}

  @Get()
  @Roles('ADMIN', 'STAFF')
  listPayments(@Query() query: ListPaymentsQueryDto) {
    return this.paymentsService.listPayments(query);
  }

  @Post()
  createPayment(@Body() dto: CreatePaymentRequestDto) {
    return this.paymentsService.createPayment(dto);
  }

  @Get('order/:orderId')
  getPaymentByOrderId(@Param() params: PaymentOrderIdParamsDto) {
    return this.paymentsService.getPaymentByOrderId(params.orderId);
  }

  @Get(':id')
  getPaymentById(@Param() params: PaymentIdParamsDto) {
    return this.paymentsService.getPaymentById(params.id);
  }

  @Post(':id/confirm')
  @Roles('ADMIN', 'STAFF')
  confirmPayment(
    @Param() params: PaymentIdParamsDto,
    @Body() dto: ConfirmPaymentRequestDto,
  ) {
    return this.paymentsService.confirmPayment(params.id, dto);
  }

  @Post(':id/cancel')
  cancelPayment(
    @Param() params: PaymentIdParamsDto,
    @Body() dto: CancelPaymentRequestDto,
  ) {
    return this.paymentsService.cancelPayment(params.id, dto);
  }

  @Post(':id/expire')
  @Roles('ADMIN', 'STAFF')
  expirePayment(@Param() params: PaymentIdParamsDto) {
    return this.paymentsService.expirePayment(params.id);
  }
}
