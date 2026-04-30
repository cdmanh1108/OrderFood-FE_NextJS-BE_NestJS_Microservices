import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { mapRpcErrorToHttpException } from '@app/common/utils/map-rpc-error-to-http.utils';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { PAYMENT_PATTERNS } from '@app/messaging/constants/patterns.constant';

import { ListPaymentsQueryDto } from './dto/request/list-payments.query.dto';
import { CreatePaymentRequestDto } from './dto/request/create-payment.request.dto';
import { ConfirmPaymentRequestDto } from './dto/request/confirm-payment.request.dto';
import { CancelPaymentRequestDto } from './dto/request/cancel-payment.request.dto';

import { CreatePaymentCommand } from '@app/contracts/payment/commands/create-payment.command';
import { ListPaymentsCommand } from '@app/contracts/payment/commands/list-payments.command';
import { GetPaymentByIdCommand } from '@app/contracts/payment/commands/get-payment-by-id.command';
import { GetPaymentByOrderIdCommand } from '@app/contracts/payment/commands/get-payment-by-order-id.command';
import { ConfirmPaymentCommand } from '@app/contracts/payment/commands/confirm-payment.command';
import { CancelPaymentCommand } from '@app/contracts/payment/commands/cancel-payment.command';
import { ExpirePaymentCommand } from '@app/contracts/payment/commands/expire-payment.command';

import { PaymentResult } from '@app/contracts/payment/results/payment.result';
import { ListPaymentsResult } from '@app/contracts/payment/results/list-payments.result';

@Injectable()
export class PaymentsPaymentGatewayService {
  constructor(
    @Inject(RMQ_SERVICES.PAYMENT) private readonly paymentClient: ClientProxy,
  ) {}

  async listPayments(query: ListPaymentsQueryDto): Promise<ListPaymentsResult> {
    return firstValueFrom(
      this.paymentClient.send(PAYMENT_PATTERNS.LIST_PAYMENTS, query as ListPaymentsCommand).pipe(
        catchError((error) => throwError(() => mapRpcErrorToHttpException(error))),
      ),
    );
  }

  async createPayment(dto: CreatePaymentRequestDto): Promise<PaymentResult> {
    return firstValueFrom(
      this.paymentClient.send(PAYMENT_PATTERNS.CREATE_PAYMENT, dto as CreatePaymentCommand).pipe(
        catchError((error) => throwError(() => mapRpcErrorToHttpException(error))),
      ),
    );
  }

  async getPaymentById(id: string): Promise<PaymentResult> {
    return firstValueFrom(
      this.paymentClient.send(PAYMENT_PATTERNS.GET_PAYMENT_BY_ID, { id } as GetPaymentByIdCommand).pipe(
        catchError((error) => throwError(() => mapRpcErrorToHttpException(error))),
      ),
    );
  }

  async getPaymentByOrderId(orderId: string): Promise<PaymentResult> {
    return firstValueFrom(
      this.paymentClient.send(PAYMENT_PATTERNS.GET_PAYMENT_BY_ORDER_ID, { orderId } as GetPaymentByOrderIdCommand).pipe(
        catchError((error) => throwError(() => mapRpcErrorToHttpException(error))),
      ),
    );
  }

  async confirmPayment(id: string, dto: ConfirmPaymentRequestDto): Promise<PaymentResult> {
    return firstValueFrom(
      this.paymentClient.send(PAYMENT_PATTERNS.CONFIRM_PAYMENT, { id, ...dto } as ConfirmPaymentCommand).pipe(
        catchError((error) => throwError(() => mapRpcErrorToHttpException(error))),
      ),
    );
  }

  async cancelPayment(id: string, dto: CancelPaymentRequestDto): Promise<PaymentResult> {
    return firstValueFrom(
      this.paymentClient.send(PAYMENT_PATTERNS.CANCEL_PAYMENT, { id, ...dto } as CancelPaymentCommand).pipe(
        catchError((error) => throwError(() => mapRpcErrorToHttpException(error))),
      ),
    );
  }

  async expirePayment(id: string): Promise<PaymentResult> {
    return firstValueFrom(
      this.paymentClient.send(PAYMENT_PATTERNS.EXPIRE_PAYMENT, { id } as ExpirePaymentCommand).pipe(
        catchError((error) => throwError(() => mapRpcErrorToHttpException(error))),
      ),
    );
  }
}
