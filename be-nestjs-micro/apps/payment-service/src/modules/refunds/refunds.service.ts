import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentPrismaService } from '@app/database/payment-prisma.service';
import { CreateRefundCommand } from '@app/contracts/payment/commands/create-refund.command';
import { GetRefundByIdCommand } from '@app/contracts/payment/commands/get-refund-by-id.command';
import { ListRefundsCommand } from '@app/contracts/payment/commands/list-refunds.command';
import { Prisma, PaymentStatus, RefundStatus } from 'generated/payment';
import { mapRefundToResult } from './mappers/refund.mapper';

@Injectable()
export class RefundsService {
  constructor(private readonly prisma: PaymentPrismaService) {}

  async createRefund(command: CreateRefundCommand) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: command.paymentId },
      include: { refunds: true },
    });

    if (!payment) {
      throw new NotFoundException('Không tìm thấy thanh toán');
    }

    if (
      payment.status !== PaymentStatus.SUCCEEDED &&
      payment.status !== PaymentStatus.PARTIALLY_REFUNDED
    ) {
      throw new BadRequestException('Chỉ có thể hoàn tiền cho thanh toán đã thành công');
    }

    const amount = new Prisma.Decimal(command.amount);

    if (amount.lte(0)) {
      throw new BadRequestException('Số tiền hoàn lại phải lớn hơn 0');
    }

    const refundedTotal = payment.refunds
      .filter((refund) => refund.status === RefundStatus.SUCCEEDED)
      .reduce((sum, refund) => sum.add(refund.amount), new Prisma.Decimal(0));

    if (refundedTotal.add(amount).gt(payment.amount)) {
      throw new BadRequestException('Số tiền hoàn lại vượt quá số tiền đã thanh toán');
    }

    const refund = await this.prisma.refund.create({
      data: {
        paymentId: payment.id,
        amount,
        currency: command.currency ?? payment.currency,
        status: RefundStatus.PENDING,
        reason: command.reason ?? null,
        gateway: payment.gateway,
        requestedBy: command.requestedBy ?? null,
        requestPayload: command.metadata ?? undefined,
      },
    });

    return mapRefundToResult(refund);
  }

  async getRefundById(command: GetRefundByIdCommand) {
    const refund = await this.prisma.refund.findUnique({
      where: { id: command.id },
    });

    if (!refund) {
      throw new NotFoundException('Không tìm thấy yêu cầu hoàn tiền');
    }

    return mapRefundToResult(refund);
  }

  async getRefundsByPaymentId(command: { paymentId: string }) {
    const items = await this.prisma.refund.findMany({
      where: { paymentId: command.paymentId },
      orderBy: { createdAt: 'desc' },
    });

    return items.map(mapRefundToResult);
  }

  async listRefunds(command: ListRefundsCommand) {
    const page = command.page && command.page > 0 ? command.page : 1;
    const limit = command.limit && command.limit > 0 ? command.limit : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.RefundWhereInput = {
      paymentId: command.paymentId,
      status: command.status as RefundStatus,
      gateway: command.gateway,
      requestedBy: command.requestedBy,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.refund.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.refund.count({ where }),
    ]);

    return {
      items: items.map(mapRefundToResult),
      page,
      limit,
      total,
    };
  }
}
