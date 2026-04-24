import { Global, Module } from '@nestjs/common';
import { OrderingPrismaService } from './ordering-prisma.service';

@Global()
@Module({
  providers: [OrderingPrismaService],
  exports: [OrderingPrismaService],
})
export class OrderingPrismaModule {}
