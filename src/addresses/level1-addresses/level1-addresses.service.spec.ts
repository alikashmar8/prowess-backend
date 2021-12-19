import { Test, TestingModule } from '@nestjs/testing';
import { Level1AddressesService } from './level1-addresses.service';

describe('Level1AddressesService', () => {
  let service: Level1AddressesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Level1AddressesService],
    }).compile();

    service = module.get<Level1AddressesService>(Level1AddressesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
