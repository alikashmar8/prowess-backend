import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompaniesService } from 'src/companies/companies.service';
import { Repository } from 'typeorm';
import { CreatePlanDTO } from './dtos/create-plan.dto';
import { Plan } from './plan.entity';

@Injectable()
export class PlansService {
  constructor(
    private companiesService: CompaniesService,
    @InjectRepository(Plan) private plansRepository: Repository<Plan>,
  ) {}
  async findByCompanyId(companyId: string, isActive?: boolean) {
    const company = await this.companiesService.findByIdOrFail(companyId);
    if (isActive) {
      return await this.plansRepository.find({
        where: { isActive: true, company_id: company.id },
      });
    } else {
      return await this.plansRepository.find({
        where: { company_id: company.id },
      });
    }
  }

  async store(body: CreatePlanDTO) {
    return await this.plansRepository.save(body).catch((err) => {
      throw new BadRequestException(err);
    });
  }
}
