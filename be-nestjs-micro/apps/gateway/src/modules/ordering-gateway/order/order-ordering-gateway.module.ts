import { Module } from '@nestjs/common';
import { OrderOrderingGatewayController } from './order-ordering-gateway.controller';
import { OrderOrderingGatewayService } from './order-ordering-gateway.service';
import { OrderingRmqClientModule } from '../ordering-rmq-client.module';
import { DineinRmqClientModule } from '../../dinein-gateway/dinein-rmq-client.module';

@Module({
  imports: [OrderingRmqClientModule, DineinRmqClientModule],
  controllers: [OrderOrderingGatewayController],
  providers: [OrderOrderingGatewayService],
})
export class OrderOrderingGatewayModule {}
