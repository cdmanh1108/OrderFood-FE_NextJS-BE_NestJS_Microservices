import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { mapRpcErrorToHttpException } from '@app/common/utils/map-rpc-error-to-http.utils';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { PAYMENT_PATTERNS } from '@app/messaging/constants/patterns.constant';

import { HandlePaymentWebhookCommand } from '@app/contracts/payment/commands/handle-payment-webhook.command';
import { ConfirmWebhookUrlCommand } from '@app/contracts/payment/commands/confirm-webhook-url.command';
import { HandlePaymentWebhookResult } from '@app/contracts/payment/results/handle-payment-webhook.result';
import { ListPaymentWebhookLogsCommand } from '@app/contracts/payment/commands/list-payment-webhook-logs.command';
import { ListPaymentWebhookLogsResult } from '@app/contracts/payment/results/list-payment-webhook-logs.result';

import { ListPaymentWebhookLogsQueryDto } from './dto/request/list-payment-webhook-logs.query.dto';

@Injectable()
export class WebhooksPaymentGatewayService {
  constructor(
    @Inject(RMQ_SERVICES.PAYMENT) private readonly paymentClient: ClientProxy,
  ) {}

  async listWebhookLogs(query: ListPaymentWebhookLogsQueryDto): Promise<ListPaymentWebhookLogsResult> {
    const payload: ListPaymentWebhookLogsCommand = query;
    return firstValueFrom(
      this.paymentClient.send(PAYMENT_PATTERNS.LIST_PAYMENT_WEBHOOK_LOGS, payload).pipe(
        catchError((error) => throwError(() => mapRpcErrorToHttpException(error))),
      ),
    );
  }

  async handleWebhook(gateway: string, headers: any, payload: any, signature?: string): Promise<HandlePaymentWebhookResult> {
    const command: HandlePaymentWebhookCommand = {
      gateway,
      headers,
      payload,
      signature,
    };
    return firstValueFrom(
      this.paymentClient.send(PAYMENT_PATTERNS.HANDLE_PAYMENT_WEBHOOK, command).pipe(
        catchError((error) => throwError(() => mapRpcErrorToHttpException(error))),
      ),
    );
  }

  async confirmWebhookUrl(gateway: string, webhookUrl: string) {
    const command: ConfirmWebhookUrlCommand = {
      gateway,
      webhookUrl,
    };
    return firstValueFrom(
      this.paymentClient.send(PAYMENT_PATTERNS.CONFIRM_WEBHOOK_URL, command).pipe(
        catchError((error) => throwError(() => mapRpcErrorToHttpException(error))),
      ),
    );
  }
}
