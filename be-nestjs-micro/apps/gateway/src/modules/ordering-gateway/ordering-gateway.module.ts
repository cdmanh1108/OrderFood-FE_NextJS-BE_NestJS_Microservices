import { Module } from '@nestjs/common';
import { CartOrderingGatewayModule } from './cart/cart-ordering-gateway.module';
import { AddressOrderingGatewayModule } from './address/address-ordering-gateway.module';

@Module({
  imports: [CartOrderingGatewayModule, AddressOrderingGatewayModule],
})
export class OrderingGatewayModule {}
