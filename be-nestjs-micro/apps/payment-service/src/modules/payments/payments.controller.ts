import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentsService } from './payments.service';
import { CancelPaymentCommand } from '@app/contracts/payment/commands/cancel-payment.command';
import { ConfirmPaymentCommand } from '@app/contracts/payment/commands/confirm-payment.command';
import { CreatePaymentCommand } from '@app/contracts/payment/commands/create-payment.command';
import { ExpirePaymentCommand } from '@app/contracts/payment/commands/expire-payment.command';
import { GetPaymentByIdCommand } from '@app/contracts/payment/commands/get-payment-by-id.command';
import { GetPaymentByOrderIdCommand } from '@app/contracts/payment/commands/get-payment-by-order-id.command';
import { ListPaymentsCommand } from '@app/contracts/payment/commands/list-payments.command';
import { PAYMENT_PATTERNS } from '@app/messaging/constants/patterns.constant';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @MessagePattern(PAYMENT_PATTERNS.CREATE_PAYMENT)
  create(@Payload() command: CreatePaymentCommand) {
    return this.paymentsService.create(command);
  }

  @MessagePattern(PAYMENT_PATTERNS.GET_PAYMENT_BY_ID)
  findById(@Payload() command: GetPaymentByIdCommand) {
    return this.paymentsService.findById(command);
  }

  @MessagePattern(PAYMENT_PATTERNS.GET_PAYMENT_BY_ORDER_ID)
  findByOrderId(@Payload() command: GetPaymentByOrderIdCommand) {
    return this.paymentsService.findByOrderId(command);
  }

  @MessagePattern(PAYMENT_PATTERNS.LIST_PAYMENTS)
  list(@Payload() command: ListPaymentsCommand) {
    return this.paymentsService.list(command);
  }

  @MessagePattern(PAYMENT_PATTERNS.CONFIRM_PAYMENT)
  confirm(@Payload() command: ConfirmPaymentCommand) {
    return this.paymentsService.confirm(command);
  }

  @MessagePattern(PAYMENT_PATTERNS.MARK_PAYMENT_SUCCEEDED)
  markSucceeded(@Payload() command: ConfirmPaymentCommand) {
    return this.paymentsService.markSucceeded(command);
  }

  @MessagePattern(PAYMENT_PATTERNS.MARK_PAYMENT_FAILED)
  markFailed(@Payload() command: CancelPaymentCommand) {
    return this.paymentsService.markFailed(command);
  }

  @MessagePattern(PAYMENT_PATTERNS.CANCEL_PAYMENT)
  cancel(@Payload() command: CancelPaymentCommand) {
    return this.paymentsService.cancel(command);
  }

  @MessagePattern(PAYMENT_PATTERNS.EXPIRE_PAYMENT)
  expire(@Payload() command: ExpirePaymentCommand) {
    return this.paymentsService.expire(command);
  }
}