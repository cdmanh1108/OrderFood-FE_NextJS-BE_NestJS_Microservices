import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrderingPrismaModule } from '@app/database/ordering-prisma.module';
import { LoggerModule } from '@app/logger';
import { CartModule } from './modules/cart/cart.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.ordering-service',
    }),
    LoggerModule,
    OrderingPrismaModule,
    CartModule,
  ],
})
export class OrderingServiceModule {}
