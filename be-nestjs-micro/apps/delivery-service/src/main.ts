import { NestFactory } from '@nestjs/core';
import { DeliveryServiceModule } from './delivery-service.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { GlobalRpcExceptionFilter } from '@app/common/filters/global-rpc-exception.filter';
import { createRmqServerOptions } from '@app/messaging/config/rmq.config';
import { RMQ_QUEUES } from '@app/messaging/constants/queues.constant';
import { AppLoggerService } from '@app/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    DeliveryServiceModule,
    createRmqServerOptions(RMQ_QUEUES.DELIVERY),
  );
  const logger = app.get(AppLoggerService);

  app.useGlobalFilters(new GlobalRpcExceptionFilter());

  await app.listen();

  logger.logWithContext('Delivery service started', 'Bootstrap', {
    queue: RMQ_QUEUES.DELIVERY,
  });
}
void bootstrap();
