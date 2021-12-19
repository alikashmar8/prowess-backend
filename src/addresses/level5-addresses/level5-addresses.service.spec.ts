import { Test, TestingModule } from '@nestjs/testing';
import { Level5AddressesService } from './level5-addresses.service';

describe('Level5AddressesService', () => {
  let service: Level5AddressesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Level5AddressesService],
    }).compile();

    service = module.get<Level5AddressesService>(Level5AddressesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
