import { Test, TestingModule } from '@nestjs/testing';
import { Level5AddressesController } from './level5-addresses.controller';

describe('Level5AddressesController', () => {
  let controller: Level5AddressesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Level5AddressesController],
    }).compile();

    controller = module.get<Level5AddressesController>(Level5AddressesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
