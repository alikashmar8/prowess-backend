import { Test, TestingModule } from '@nestjs/testing';
import { Level1AddressesController } from './level1-addresses.controller';

describe('Level1AddressesController', () => {
  let controller: Level1AddressesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Level1AddressesController],
    }).compile();

    controller = module.get<Level1AddressesController>(Level1AddressesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
