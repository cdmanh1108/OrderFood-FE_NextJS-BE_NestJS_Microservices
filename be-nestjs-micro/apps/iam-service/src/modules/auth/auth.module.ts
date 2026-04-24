import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@app/auth';
import { AuthController } from './auth.controller';
import { RedisModule } from 'libs/redis/src';
import { EmailVerificationService } from './services/email-verification.service';
import { MessagingClientsModule } from '@app/messaging/messaging-clients.module';
import { RMQ_QUEUES } from '@app/messaging/constants/queues.constant';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';

@Module({
  imports: [
    RedisModule,
    MessagingClientsModule.register([
      {
        name: RMQ_SERVICES.NOTIFICATION,
        queue: RMQ_QUEUES.NOTIFICATION,
      },
    ]),
  ],
  providers: [AuthService, JwtService, EmailVerificationService],
  controllers: [AuthController],
})
export class AuthModule {}
