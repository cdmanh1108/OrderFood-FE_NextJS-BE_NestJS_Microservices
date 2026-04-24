import { Module } from '@nestjs/common';
import { EmailModule } from './modules/email/email.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@app/logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.notification-service',
    }),
    LoggerModule,
    EmailModule,
  ],
  controllers: [],
  providers: [],
})
export class NotificationServiceModule {}
