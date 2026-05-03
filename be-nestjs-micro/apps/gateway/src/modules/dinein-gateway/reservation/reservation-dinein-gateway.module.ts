import { Module } from '@nestjs/common';
import { ReservationDineinGatewayController } from './reservation-dinein-gateway.controller';
import { ReservationDineinGatewayService } from './reservation-dinein-gateway.service';
import { DineinRmqClientModule } from '../dinein-rmq-client.module';

@Module({
  imports: [DineinRmqClientModule],
  controllers: [ReservationDineinGatewayController],
  providers: [ReservationDineinGatewayService],
})
export class ReservationDineinGatewayModule {}
