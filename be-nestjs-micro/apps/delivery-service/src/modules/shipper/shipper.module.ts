import { Module } from '@nestjs/common';
import { ShipperController } from './shipper.controller';
import { ShipperService } from './shipper.service';

@Module({
  controllers: [ShipperController],
  providers: [ShipperService],
  exports: [ShipperService],
})
export class ShipperModule {}
