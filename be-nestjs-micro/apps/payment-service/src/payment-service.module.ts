import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@app/logger';
import { PaymentPrismaModule } from '@app/database/payment-prismas.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { RefundsModule } from './modules/refunds/refunds.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

@Module({
  imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.payment-service',
      }),
      LoggerModule,
      PaymentPrismaModule,
      PaymentsModule,
      RefundsModule,
      WebhooksModule
    ],
})
export class PaymentServiceModule {}
