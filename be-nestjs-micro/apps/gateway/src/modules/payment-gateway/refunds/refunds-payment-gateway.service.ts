import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { mapRpcErrorToHttpException } from '@app/common/utils/map-rpc-error-to-http.utils';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { PAYMENT_PATTERNS } from '@app/messaging/constants/patterns.constant';

import { CreateRefundCommand } from '@app/contracts/payment/commands/create-refund.command';
import { ListRefundsCommand } from '@app/contracts/payment/commands/list-refunds.command';
import { GetRefundByIdCommand } from '@app/contracts/payment/commands/get-refund-by-id.command';

import { RefundResult } from '@app/contracts/payment/results/refund.result';
import { ListRefundsResult } from '@app/contracts/payment/results/list-refunds.result';

import { CreateRefundRequestDto } from './dto/request/create-refund.request.dto';
import { ListRefundsQueryDto } from './dto/request/list-refunds.query.dto';

@Injectable()
export class RefundsPaymentGatewayService {
  constructor(
    @Inject(RMQ_SERVICES.PAYMENT) private readonly paymentClient: ClientProxy,
  ) {}

  async createRefund(dto: CreateRefundRequestDto): Promise<RefundResult> {
    const payload: CreateRefundCommand = dto;
    return firstValueFrom(
      this.paymentClient.send(PAYMENT_PATTERNS.CREATE_REFUND, payload).pipe(
        catchError((error) => throwError(() => mapRpcErrorToHttpException(error))),
      ),
    );
  }

  async listRefunds(query: ListRefundsQueryDto): Promise<ListRefundsResult> {
    const payload: ListRefundsCommand = query;
    return firstValueFrom(
      this.paymentClient.send(PAYMENT_PATTERNS.LIST_REFUNDS, payload).pipe(
        catchError((error) => throwError(() => mapRpcErrorToHttpException(error))),
      ),
    );
  }

  async getRefundById(id: string): Promise<RefundResult> {
    const payload: GetRefundByIdCommand = { id };
    return firstValueFrom(
      this.paymentClient.send(PAYMENT_PATTERNS.GET_REFUND_BY_ID, payload).pipe(
        catchError((error) => throwError(() => mapRpcErrorToHttpException(error))),
      ),
    );
  }
}
