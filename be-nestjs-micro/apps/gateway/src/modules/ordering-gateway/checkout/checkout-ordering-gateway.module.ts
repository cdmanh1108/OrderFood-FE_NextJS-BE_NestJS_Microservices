import { Module } from '@nestjs/common';
import { CheckoutOrderingGatewayController } from './checkout-ordering-gateway.controller';
import { CheckoutOrderingGatewayService } from './checkout-ordering-gateway.service';
import { OrderingRmqClientModule } from '../ordering-rmq-client.module';

@Module({
  imports: [OrderingRmqClientModule],
  controllers: [CheckoutOrderingGatewayController],
  providers: [CheckoutOrderingGatewayService],
})
export class CheckoutOrderingGatewayModule {}
