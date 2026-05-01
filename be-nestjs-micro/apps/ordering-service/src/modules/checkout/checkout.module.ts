import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { OrderModule } from '../order/order.module';
import { MessagingClientsModule } from '@app/messaging/messaging-clients.module';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { RMQ_QUEUES } from '@app/messaging/constants/queues.constant';

@Module({
  imports: [
    OrderModule,
    MessagingClientsModule.register([
      { name: RMQ_SERVICES.CATALOG, queue: RMQ_QUEUES.CATALOG },
      { name: RMQ_SERVICES.PAYMENT, queue: RMQ_QUEUES.PAYMENT },
    ]),
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
