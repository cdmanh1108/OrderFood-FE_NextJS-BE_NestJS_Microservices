import { Module } from '@nestjs/common';

import { OrderingRmqClientModule } from '../ordering-rmq-client.module';
import { AddressOrderingGatewayController } from './address-ordering-gateway.controller';
import { AddressOrderingGatewayService } from './address-ordering-gateway.service';

@Module({
  imports: [OrderingRmqClientModule],
  controllers: [AddressOrderingGatewayController],
  providers: [AddressOrderingGatewayService],
})
export class AddressOrderingGatewayModule {}
