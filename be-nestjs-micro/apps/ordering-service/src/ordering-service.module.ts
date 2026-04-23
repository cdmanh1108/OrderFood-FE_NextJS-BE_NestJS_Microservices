import { Module } from '@nestjs/common';
import { OrderingServiceController } from './ordering-service.controller';
import { OrderingServiceService } from './ordering-service.service';

@Module({
  imports: [],
  controllers: [OrderingServiceController],
  providers: [OrderingServiceService],
})
export class OrderingServiceModule {}
