import { Test, TestingModule } from '@nestjs/testing';
import { Level4AddressesController } from './level4-addresses.controller';

describe('Level4AddressesController', () => {
  let controller: Level4AddressesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Level4AddressesController],
    }).compile();

    controller = module.get<Level4AddressesController>(Level4AddressesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
