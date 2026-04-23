import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { GlobalRpcExceptionFilter } from '@app/common/filters/global-rpc-exception.filter';
import { createRmqServerOptions } from '@app/messaging/config/rmq.config';
import { RMQ_QUEUES } from '@app/messaging/constants/queues.constant';
import { MediaModule } from './media-service.module';
import { AppLoggerService } from '@app/logger';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MediaModule,
    createRmqServerOptions(RMQ_QUEUES.MEDIA),
  );
  const logger = app.get(AppLoggerService);

  app.useGlobalFilters(new GlobalRpcExceptionFilter());

  await app.listen();

  logger.logWithContext('Media service started', 'Bootstrap', {
    queue: 'media_queue',
  });
}
void bootstrap();
