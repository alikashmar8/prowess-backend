import { Test, TestingModule } from '@nestjs/testing';
import { AdminCompaniesController } from './companies.controller';

describe('CompaniesController', () => {
  let controller: AdminCompaniesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminCompaniesController],
    }).compile();

    controller = module.get<AdminCompaniesController>(AdminCompaniesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
