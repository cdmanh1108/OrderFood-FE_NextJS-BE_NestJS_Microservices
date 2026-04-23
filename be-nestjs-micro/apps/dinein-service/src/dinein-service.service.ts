import { Injectable } from '@nestjs/common';

@Injectable()
export class DineinServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
