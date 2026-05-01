import {
  Controller,
  // Get,
  Headers,
  Param,
  Post,
  // Query,
  Req,
  // UseGuards,
} from '@nestjs/common';
// import { JwtAuthGuard, RolesGuard, Roles } from '@app/auth';
import { WebhooksPaymentGatewayService } from './webhooks-payment-gateway.service';

// import { ListPaymentWebhookLogsQueryDto } from './dto/request/list-payment-webhook-logs.query.dto';
import { PaymentWebhookParamsDto } from './dto/request/payment-webhook.params.dto';
import { ConfirmWebhookUrlDto } from './dto/request/confirm-webhook-url.dto';
import { Body } from '@nestjs/common';
import type { Request } from 'express';

@Controller('payments/webhooks')
export class WebhooksPaymentGatewayController {
  constructor(
    private readonly webhooksService: WebhooksPaymentGatewayService,
  ) {}

  // @Get('logs')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('ADMIN', 'STAFF')
  // listWebhookLogs(@Query() query: ListPaymentWebhookLogsQueryDto) {
  //   return this.webhooksService.listWebhookLogs(query);
  // }

  @Post(':gateway')
  handleWebhook(
    @Param() params: PaymentWebhookParamsDto,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Req() req: Request<unknown, unknown, Record<string, unknown>>,
  ) {
    const signature =
      this.getHeaderValue(headers, 'x-signature') ||
      this.getHeaderValue(headers, 'stripe-signature') ||
      this.getHeaderValue(headers, 'x-payos-signature') ||
      this.getHeaderValue(headers, 'x-vnpay-signature');
    return this.webhooksService.handleWebhook(
      params.gateway,
      headers,
      req.body,
      signature,
    );
  }

  @Post(':gateway/confirm')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  confirmWebhookUrl(
    @Param() params: PaymentWebhookParamsDto,
    @Body() body: ConfirmWebhookUrlDto,
  ) {
    return this.webhooksService.confirmWebhookUrl(
      params.gateway,
      body.webhookUrl,
    );
  }

  private getHeaderValue(
    headers: Record<string, string | string[] | undefined>,
    key: string,
  ): string | undefined {
    const value = headers[key];
    return Array.isArray(value) ? value[0] : value;
  }
}
