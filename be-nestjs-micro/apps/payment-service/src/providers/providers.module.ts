import { Module } from '@nestjs/common';
import { PayosPaymentProvider } from './payos.provider';

@Module({
  providers: [PayosPaymentProvider],
  exports: [PayosPaymentProvider],
})
export class PaymentProvidersModule {}
