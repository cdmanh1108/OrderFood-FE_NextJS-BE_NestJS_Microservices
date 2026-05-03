import { Module } from '@nestjs/common';
import { SessionDineinGatewayController } from './session-dinein-gateway.controller';
import { SessionDineinGatewayService } from './session-dinein-gateway.service';
import { DineinRmqClientModule } from '../dinein-rmq-client.module';

@Module({
  imports: [DineinRmqClientModule],
  controllers: [SessionDineinGatewayController],
  providers: [SessionDineinGatewayService],
})
export class SessionDineinGatewayModule {}
