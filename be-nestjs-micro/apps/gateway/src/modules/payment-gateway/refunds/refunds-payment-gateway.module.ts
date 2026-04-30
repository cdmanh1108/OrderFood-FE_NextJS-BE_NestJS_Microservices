import { Module } from '@nestjs/common';
import { RefundsPaymentGatewayController } from './refunds-payment-gateway.controller';
import { RefundsPaymentGatewayService } from './refunds-payment-gateway.service';
import { PaymentRmqClientModule } from '../payment-rmq-client.module';

@Module({
  imports: [PaymentRmqClientModule],
  controllers: [RefundsPaymentGatewayController],
  providers: [RefundsPaymentGatewayService],
})
export class RefundsPaymentGatewayModule {}
