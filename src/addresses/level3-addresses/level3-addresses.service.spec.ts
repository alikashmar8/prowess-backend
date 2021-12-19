import { Test, TestingModule } from '@nestjs/testing';
import { Level3AddressesService } from './level3-addresses.service';

describe('Level3AddressesService', () => {
  let service: Level3AddressesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Level3AddressesService],
    }).compile();

    service = module.get<Level3AddressesService>(Level3AddressesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
