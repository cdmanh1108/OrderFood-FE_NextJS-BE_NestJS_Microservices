import { Module } from '@nestjs/common';
import { AuthGatewayController } from './auth-gateway.controller';
import { AuthGatewayService } from './auth-gateway.service';
import { MessagingClientsModule } from '@app/messaging/messaging-clients.module';
import { RMQ_QUEUES } from '@app/messaging/constants/queues.constant';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { AuthModule } from '@app/auth';

@Module({
  imports: [
    AuthModule,
    MessagingClientsModule.register([
      {
        name: RMQ_SERVICES.IAM,
        queue: RMQ_QUEUES.IAM,
      },
    ]),
  ],
  controllers: [AuthGatewayController],
  providers: [AuthGatewayService],
})
export class AuthGatewayModule {}
