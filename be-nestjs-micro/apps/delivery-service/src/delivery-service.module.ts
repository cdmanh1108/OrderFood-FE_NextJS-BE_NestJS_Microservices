import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DeliveryPrismaModule } from '@app/database/delivery-prisma.module';
import { LoggerModule } from '@app/logger';
import { ShipperModule } from './modules/shipper/shipper.module';
import { TaskModule } from './modules/task/task.module';
import { LocationModule } from './modules/location/location.module';
import { ProofModule } from './modules/proof/proof.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.delivery-service',
    }),
    LoggerModule,
    DeliveryPrismaModule,
    ShipperModule,
    TaskModule,
    LocationModule,
    ProofModule,
  ],
})
export class DeliveryServiceModule {}
