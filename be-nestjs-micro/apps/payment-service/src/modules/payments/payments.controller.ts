import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { PaymentsService } from './payments.service';
import { CancelPaymentCommand } from '@app/contracts/payment/commands/cancel-payment.command';
import { ConfirmPaymentCommand } from '@app/contracts/payment/commands/confirm-payment.command';
import { CreatePaymentCommand } from '@app/contracts/payment/commands/create-payment.command';
import { ExpirePaymentCommand } from '@app/contracts/payment/commands/expire-payment.command';
import { GetPaymentByIdCommand } from '@app/contracts/payment/commands/get-payment-by-id.command';
import { GetPaymentByOrderIdCommand } from '@app/contracts/payment/commands/get-payment-by-order-id.command';
import { ListPaymentsCommand } from '@app/contracts/payment/commands/list-payments.command';
import { PAYMENT_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { handleRpcMessage } from '@app/messaging';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @MessagePattern(PAYMENT_PATTERNS.CREATE_PAYMENT)
  create(@Payload() command: CreatePaymentCommand, @Ctx() context: RmqContext) {
    return handleRpcMessage(context, () =>
      this.paymentsService.create(command),
    );
  }

  @MessagePattern(PAYMENT_PATTERNS.GET_PAYMENT_BY_ID)
  findById(
    @Payload() command: GetPaymentByIdCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.paymentsService.findById(command),
    );
  }

  @MessagePattern(PAYMENT_PATTERNS.GET_PAYMENT_BY_ORDER_ID)
  findByOrderId(
    @Payload() command: GetPaymentByOrderIdCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.paymentsService.findByOrderId(command),
    );
  }

  @MessagePattern(PAYMENT_PATTERNS.LIST_PAYMENTS)
  list(@Payload() command: ListPaymentsCommand, @Ctx() context: RmqContext) {
    return handleRpcMessage(context, () => this.paymentsService.list(command));
  }

  @MessagePattern(PAYMENT_PATTERNS.CONFIRM_PAYMENT)
  confirm(
    @Payload() command: ConfirmPaymentCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.paymentsService.confirm(command),
    );
  }

  @MessagePattern(PAYMENT_PATTERNS.MARK_PAYMENT_SUCCEEDED)
  markSucceeded(
    @Payload() command: ConfirmPaymentCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.paymentsService.markSucceeded(command),
    );
  }

  @MessagePattern(PAYMENT_PATTERNS.MARK_PAYMENT_FAILED)
  markFailed(
    @Payload() command: CancelPaymentCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.paymentsService.markFailed(command),
    );
  }

  @MessagePattern(PAYMENT_PATTERNS.CANCEL_PAYMENT)
  cancel(@Payload() command: CancelPaymentCommand, @Ctx() context: RmqContext) {
    return handleRpcMessage(context, () =>
      this.paymentsService.cancel(command),
    );
  }

  @MessagePattern(PAYMENT_PATTERNS.EXPIRE_PAYMENT)
  expire(@Payload() command: ExpirePaymentCommand, @Ctx() context: RmqContext) {
    return handleRpcMessage(context, () =>
      this.paymentsService.expire(command),
    );
  }
}
