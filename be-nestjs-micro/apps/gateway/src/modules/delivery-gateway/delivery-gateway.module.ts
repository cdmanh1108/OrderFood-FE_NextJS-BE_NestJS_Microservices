import { Module } from '@nestjs/common';
import { DeliveryGatewayController } from './delivery-gateway.controller';
import { DeliveryGatewayService } from './delivery-gateway.service';
import { DeliveryRmqClientModule } from './delivery-rmq-client.module';
import { OrderingRmqClientModule } from '../ordering-gateway/ordering-rmq-client.module';

@Module({
  imports: [DeliveryRmqClientModule, OrderingRmqClientModule],
  controllers: [DeliveryGatewayController],
  providers: [DeliveryGatewayService],
})
export class DeliveryGatewayModule {}
