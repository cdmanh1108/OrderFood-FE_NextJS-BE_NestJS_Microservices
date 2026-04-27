import { Module } from '@nestjs/common';
import { CartOrderingGatewayModule } from './cart/cart-ordering-gateway.module';
import { AddressOrderingGatewayModule } from './address/address-ordering-gateway.module';
import { OrderOrderingGatewayModule } from './order/order-ordering-gateway.module';

@Module({
  imports: [
    CartOrderingGatewayModule,
    AddressOrderingGatewayModule,
    OrderOrderingGatewayModule,
  ],
})
export class OrderingGatewayModule {}
