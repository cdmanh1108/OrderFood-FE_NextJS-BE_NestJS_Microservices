import { Global, Module } from '@nestjs/common';
import { PaymentPrismaService } from './payment-prisma.service';

@Global()
@Module({
  providers: [PaymentPrismaService],
  exports: [PaymentPrismaService],
})
export class PaymentPrismaModule {}
