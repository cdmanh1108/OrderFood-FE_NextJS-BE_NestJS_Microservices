import { Module } from '@nestjs/common';

import { PaymentsPaymentGatewayModule } from './payments/payments-payment-gateway.module';
import { RefundsPaymentGatewayModule } from './refunds/refunds-payment-gateway.module';
import { WebhooksPaymentGatewayModule } from './webhooks/webhooks-payment-gateway.module';

@Module({
  imports: [
    PaymentsPaymentGatewayModule,
    RefundsPaymentGatewayModule,
    WebhooksPaymentGatewayModule,
  ],
})
export class PaymentGatewayModule {}
