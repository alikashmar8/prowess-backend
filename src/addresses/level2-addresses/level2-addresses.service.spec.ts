import { Test, TestingModule } from '@nestjs/testing';
import { Level2AddressesService } from './level2-addresses.service';

describe('Level2AddressesService', () => {
  let service: Level2AddressesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Level2AddressesService],
    }).compile();

    service = module.get<Level2AddressesService>(Level2AddressesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
