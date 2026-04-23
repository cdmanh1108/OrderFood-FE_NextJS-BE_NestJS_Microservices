import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderingServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
