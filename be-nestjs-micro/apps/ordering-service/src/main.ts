import { NestFactory } from '@nestjs/core';
import { OrderingServiceModule } from './ordering-service.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { GlobalRpcExceptionFilter } from '@app/common/filters/global-rpc-exception.filter';
import { createRmqServerOptions } from '@app/messaging/config/rmq.config';
import { RMQ_QUEUES } from '@app/messaging/constants/queues.constant';
import { AppLoggerService } from '@app/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    OrderingServiceModule,
    createRmqServerOptions(RMQ_QUEUES.ORDERING),
  );
  const logger = app.get(AppLoggerService);

  app.useGlobalFilters(new GlobalRpcExceptionFilter());

  await app.listen();

  logger.logWithContext('Ordering service started', 'Bootstrap', {
    queue: 'ordering_queue',
  });
}
void bootstrap();
