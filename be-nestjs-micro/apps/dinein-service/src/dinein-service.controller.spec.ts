import { Test, TestingModule } from '@nestjs/testing';
import { DineinServiceController } from './dinein-service.controller';
import { DineinServiceService } from './dinein-service.service';

describe('DineinServiceController', () => {
  let dineinServiceController: DineinServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [DineinServiceController],
      providers: [DineinServiceService],
    }).compile();

    dineinServiceController = app.get<DineinServiceController>(
      DineinServiceController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(dineinServiceController.getHello()).toBe('Hello World!');
    });
  });
});
