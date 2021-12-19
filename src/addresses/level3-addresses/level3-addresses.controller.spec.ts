import { Test, TestingModule } from '@nestjs/testing';
import { Level3AddressesController } from './level3-addresses.controller';

describe('Level3AddressesController', () => {
  let controller: Level3AddressesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Level3AddressesController],
    }).compile();

    controller = module.get<Level3AddressesController>(Level3AddressesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
