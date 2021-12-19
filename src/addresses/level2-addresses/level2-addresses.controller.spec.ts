import { Test, TestingModule } from '@nestjs/testing';
import { Level2AddressesController } from './level2-addresses.controller';

describe('Level2AddressesController', () => {
  let controller: Level2AddressesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Level2AddressesController],
    }).compile();

    controller = module.get<Level2AddressesController>(Level2AddressesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
