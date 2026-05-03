import { Module } from '@nestjs/common';
import { TableDineinGatewayController } from './table-dinein-gateway.controller';
import { TableDineinGatewayService } from './table-dinein-gateway.service';
import { DineinRmqClientModule } from '../dinein-rmq-client.module';

@Module({
  imports: [DineinRmqClientModule],
  controllers: [TableDineinGatewayController],
  providers: [TableDineinGatewayService],
})
export class TableDineinGatewayModule {}
