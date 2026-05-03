import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DineinPrismaModule } from '@app/database/dinein-prisma.module';
import { LoggerModule } from '@app/logger';
import { TableModule } from './modules/table/table.module';
import { ReservationModule } from './modules/reservation/reservation.module';
import { TableSessionModule } from './modules/session/table-session.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.dinein-service',
    }),
    LoggerModule,
    DineinPrismaModule,
    TableModule,
    ReservationModule,
    TableSessionModule,
  ],
})
export class DineinServiceModule {}
