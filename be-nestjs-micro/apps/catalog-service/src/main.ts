import { NestFactory } from '@nestjs/core';
import { CatalogServiceModule } from './catalog-service.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { GlobalRpcExceptionFilter } from '@app/common/filters/global-rpc-exception.filter';
import { createRmqServerOptions } from '@app/messaging/config/rmq.config';
import { RMQ_QUEUES } from '@app/messaging/constants/queues.constant';
import { AppLoggerService } from '@app/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CatalogServiceModule,
    createRmqServerOptions(RMQ_QUEUES.CATALOG),
  );
  const logger = app.get(AppLoggerService);

  app.useGlobalFilters(new GlobalRpcExceptionFilter());

  await app.listen();

  logger.logWithContext('Catalog service started', 'Bootstrap', {
    queue: 'catalog_queue',
  });
}
void bootstrap();
