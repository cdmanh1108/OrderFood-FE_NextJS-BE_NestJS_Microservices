import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { MediaGatewayController } from './media-gateway.controller';
import { MediaGatewayService } from './media-gateway.service';
import { createRmqClientOptions } from '@app/messaging/config/rmq.config';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { RMQ_QUEUES } from '@app/messaging/constants/queues.constant';

@Module({
  imports: [
    ClientsModule.register([
      createRmqClientOptions(RMQ_SERVICES.MEDIA, RMQ_QUEUES.MEDIA),
    ]),
  ],
  controllers: [MediaGatewayController],
  providers: [MediaGatewayService],
  exports: [MediaGatewayService],
})
export class MediaGatewayModule {}
