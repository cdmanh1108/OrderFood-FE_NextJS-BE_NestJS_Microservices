import { Module } from '@nestjs/common';
import { DeliveryGatewayController } from './delivery-gateway.controller';
import { DeliveryGatewayService } from './delivery-gateway.service';
import { DeliveryRmqClientModule } from './delivery-rmq-client.module';

@Module({
  imports: [DeliveryRmqClientModule],
  controllers: [DeliveryGatewayController],
  providers: [DeliveryGatewayService],
})
export class DeliveryGatewayModule {}
