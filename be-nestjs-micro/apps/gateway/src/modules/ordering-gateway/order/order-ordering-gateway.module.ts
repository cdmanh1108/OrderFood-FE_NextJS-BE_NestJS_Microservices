import { Module } from '@nestjs/common';
import { OrderOrderingGatewayController } from './order-ordering-gateway.controller';
import { OrderOrderingGatewayService } from './order-ordering-gateway.service';
import { OrderingRmqClientModule } from '../ordering-rmq-client.module';


@Module({
  imports: [OrderingRmqClientModule],
  controllers: [OrderOrderingGatewayController],
  providers: [OrderOrderingGatewayService],
})
export class OrderOrderingGatewayModule {}
