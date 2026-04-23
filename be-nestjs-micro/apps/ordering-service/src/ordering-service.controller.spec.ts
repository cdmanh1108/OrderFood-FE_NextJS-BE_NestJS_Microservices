import { Test, TestingModule } from '@nestjs/testing';
import { OrderingServiceController } from './ordering-service.controller';
import { OrderingServiceService } from './ordering-service.service';

describe('OrderingServiceController', () => {
  let orderingServiceController: OrderingServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [OrderingServiceController],
      providers: [OrderingServiceService],
    }).compile();

    orderingServiceController = app.get<OrderingServiceController>(
      OrderingServiceController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(orderingServiceController.getHello()).toBe('Hello World!');
    });
  });
});
