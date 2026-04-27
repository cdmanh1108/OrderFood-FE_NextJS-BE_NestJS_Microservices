import { Module } from '@nestjs/common';
import { AuthModule } from '@app/auth';
import { OrderingRmqClientModule } from '../ordering-rmq-client.module';
import { AddressOrderingGatewayController } from './address-ordering-gateway.controller';
import { AddressOrderingGatewayService } from './address-ordering-gateway.service';

@Module({
  imports: [AuthModule, OrderingRmqClientModule],
  controllers: [AddressOrderingGatewayController],
  providers: [AddressOrderingGatewayService],
})
export class AddressOrderingGatewayModule {}
