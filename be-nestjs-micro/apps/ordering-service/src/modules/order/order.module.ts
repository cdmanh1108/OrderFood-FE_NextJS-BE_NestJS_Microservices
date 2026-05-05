import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { MessagingClientsModule } from '@app/messaging/messaging-clients.module';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { RMQ_QUEUES } from '@app/messaging/constants/queues.constant';

@Module({
  imports: [
    MessagingClientsModule.register([
      {
        name: RMQ_SERVICES.DELIVERY,
        queue: RMQ_QUEUES.DELIVERY,
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
