import { Module } from '@nestjs/common';

import { OrderingRmqClientModule } from '../ordering-rmq-client.module';
import { CartOrderingGatewayController } from './cart-ordering-gateway.controller';
import { CartOrderingGatewayService } from './cart-ordering-gateway.service';

@Module({
  imports: [OrderingRmqClientModule],
  controllers: [CartOrderingGatewayController],
  providers: [CartOrderingGatewayService],
})
export class CartOrderingGatewayModule {}
