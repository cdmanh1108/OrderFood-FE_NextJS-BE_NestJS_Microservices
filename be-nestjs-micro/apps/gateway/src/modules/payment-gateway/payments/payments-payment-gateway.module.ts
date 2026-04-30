import { Module } from '@nestjs/common';
import { PaymentsPaymentGatewayController } from './payments-payment-gateway.controller';
import { PaymentsPaymentGatewayService } from './payments-payment-gateway.service';
import { PaymentRmqClientModule } from '../payment-rmq-client.module';

@Module({
  imports: [PaymentRmqClientModule],
  controllers: [PaymentsPaymentGatewayController],
  providers: [PaymentsPaymentGatewayService],
})
export class PaymentsPaymentGatewayModule {}
