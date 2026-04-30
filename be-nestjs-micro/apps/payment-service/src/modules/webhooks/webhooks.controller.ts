import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WebhooksService } from './webhooks.service';
import { HandlePaymentWebhookCommand } from '@app/contracts/payment/commands/handle-payment-webhook.command';
import type { ConfirmWebhookUrlCommand } from '@app/contracts/payment/commands/confirm-webhook-url.command';
import { ListPaymentWebhookLogsCommand } from '@app/contracts/payment/commands/list-payment-webhook-logs.command';
import { PAYMENT_PATTERNS } from '@app/messaging/constants/patterns.constant';

@Controller()
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @MessagePattern(PAYMENT_PATTERNS.HANDLE_PAYMENT_WEBHOOK)
  handleWebhook(@Payload() command: HandlePaymentWebhookCommand) {
    return this.webhooksService.handleWebhook(command);
  }

  @MessagePattern(PAYMENT_PATTERNS.LIST_PAYMENT_WEBHOOK_LOGS)
  listWebhookLogs(@Payload() command: ListPaymentWebhookLogsCommand) {
    return this.webhooksService.listWebhookLogs(command);
  }

  @MessagePattern(PAYMENT_PATTERNS.CONFIRM_WEBHOOK_URL)
  confirmWebhookUrl(@Payload() command: ConfirmWebhookUrlCommand) {
    return this.webhooksService.confirmWebhookUrl(command);
  }
}
