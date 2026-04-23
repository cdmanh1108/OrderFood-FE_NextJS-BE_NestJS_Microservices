import { NestFactory } from '@nestjs/core';
import { DineinServiceModule } from './dinein-service.module';

async function bootstrap() {
  const app = await NestFactory.create(DineinServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
