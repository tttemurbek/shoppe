import { Test, TestingModule } from '@nestjs/testing';
import { ShoppeBatchController } from './shoppe-batch.controller';
import { ShoppeBatchService } from './shoppe-batch.service';

describe('ShoppeBatchController', () => {
  let shoppeBatchController: ShoppeBatchController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ShoppeBatchController],
      providers: [ShoppeBatchService],
    }).compile();

    shoppeBatchController = app.get<ShoppeBatchController>(ShoppeBatchController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(shoppeBatchController.getHello()).toBe('Hello World!');
    });
  });
});
