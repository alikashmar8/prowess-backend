import { Test, TestingModule } from '@nestjs/testing';
import { Level4AddressesService } from './level4-addresses.service';

describe('Level4AddressesService', () => {
  let service: Level4AddressesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Level4AddressesService],
    }).compile();

    service = module.get<Level4AddressesService>(Level4AddressesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
