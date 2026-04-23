import { Controller, Get } from '@nestjs/common';
import { OrderingServiceService } from './ordering-service.service';

@Controller()
export class OrderingServiceController {
  constructor(
    private readonly orderingServiceService: OrderingServiceService,
  ) {}

  @Get()
  getHello(): string {
    return this.orderingServiceService.getHello();
  }
}
