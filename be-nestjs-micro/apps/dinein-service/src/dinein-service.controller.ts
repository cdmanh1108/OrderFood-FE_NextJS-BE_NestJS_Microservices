import { Controller, Get } from '@nestjs/common';
import { DineinServiceService } from './dinein-service.service';

@Controller()
export class DineinServiceController {
  constructor(private readonly dineinServiceService: DineinServiceService) {}

  @Get()
  getHello(): string {
    return this.dineinServiceService.getHello();
  }
}
