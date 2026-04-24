import { Module } from '@nestjs/common';
import { CartOrderingGatewayModule } from './cart/cart-ordering-gateway.module';

@Module({
  imports: [CartOrderingGatewayModule],
})
export class OrderingGatewayModule {}
