import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RefundsService } from './refunds.service';
import { CreateRefundCommand } from '@app/contracts/payment/commands/create-refund.command';
import { GetRefundByIdCommand } from '@app/contracts/payment/commands/get-refund-by-id.command';
import { ListRefundsCommand } from '@app/contracts/payment/commands/list-refunds.command';
import { PAYMENT_PATTERNS } from '@app/messaging/constants/patterns.constant';

@Controller()
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @MessagePattern(PAYMENT_PATTERNS.CREATE_REFUND)
  createRefund(@Payload() command: CreateRefundCommand) {
    return this.refundsService.createRefund(command);
  }

  @MessagePattern(PAYMENT_PATTERNS.GET_REFUND_BY_ID)
  getRefundById(@Payload() command: GetRefundByIdCommand) {
    return this.refundsService.getRefundById(command);
  }

  @MessagePattern(PAYMENT_PATTERNS.GET_REFUNDS_BY_PAYMENT_ID)
  getRefundsByPaymentId(@Payload() command: { paymentId: string }) {
    return this.refundsService.getRefundsByPaymentId(command);
  }

  @MessagePattern(PAYMENT_PATTERNS.LIST_REFUNDS)
  listRefunds(@Payload() command: ListRefundsCommand) {
    return this.refundsService.listRefunds(command);
  }
}
