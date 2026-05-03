import { Module } from '@nestjs/common';
import { TableDineinGatewayModule } from './table/table-dinein-gateway.module';
import { ReservationDineinGatewayModule } from './reservation/reservation-dinein-gateway.module';
import { SessionDineinGatewayModule } from './session/session-dinein-gateway.module';

@Module({
  imports: [
    TableDineinGatewayModule,
    ReservationDineinGatewayModule,
    SessionDineinGatewayModule,
  ],
})
export class DineinGatewayModule {}
