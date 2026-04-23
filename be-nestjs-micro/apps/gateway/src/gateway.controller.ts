import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class GatewayController {
  @Get()
  health() {
    return {
      status: 'ok',
      service: 'gateway',
    };
  }
}
