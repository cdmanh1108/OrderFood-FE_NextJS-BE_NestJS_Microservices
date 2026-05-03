import { Global, Module } from '@nestjs/common';
import { DineinPrismaService } from './dinein-prisma.service';

@Global()
@Module({
  providers: [DineinPrismaService],
  exports: [DineinPrismaService],
})
export class DineinPrismaModule {}
