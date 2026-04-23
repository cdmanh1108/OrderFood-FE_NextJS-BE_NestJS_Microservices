import { Module } from '@nestjs/common';
import { DineinServiceController } from './dinein-service.controller';
import { DineinServiceService } from './dinein-service.service';

@Module({
  imports: [],
  controllers: [DineinServiceController],
  providers: [DineinServiceService],
})
export class DineinServiceModule {}
