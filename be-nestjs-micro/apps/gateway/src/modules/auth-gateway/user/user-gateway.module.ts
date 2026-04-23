import { Module } from '@nestjs/common';
import { MessagingClientsModule } from '@app/messaging/messaging-clients.module';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { RMQ_QUEUES } from '@app/messaging/constants/queues.constant';
import { JwtService } from '@app/auth';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { UserGatewayController } from './user-gateway.controller';
import { UserGatewayService } from './user-gateway.service';

@Module({
  imports: [
    MessagingClientsModule.register([
      {
        name: RMQ_SERVICES.IAM,
        queue: RMQ_QUEUES.IAM,
      },
    ]),
  ],
  controllers: [UserGatewayController],
  providers: [UserGatewayService, JwtService, JwtAuthGuard],
})
export class UserGatewayModule {}
