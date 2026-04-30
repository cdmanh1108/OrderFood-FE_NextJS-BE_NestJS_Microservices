import { Module } from '@nestjs/common';
import { WebhooksPaymentGatewayController } from './webhooks-payment-gateway.controller';
import { WebhooksPaymentGatewayService } from './webhooks-payment-gateway.service';
import { PaymentRmqClientModule } from '../payment-rmq-client.module';

@Module({
  imports: [PaymentRmqClientModule],
  controllers: [WebhooksPaymentGatewayController],
  providers: [WebhooksPaymentGatewayService],
})
export class WebhooksPaymentGatewayModule {}
