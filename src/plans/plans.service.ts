import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompaniesService } from 'src/companies/companies.service';
import { UserRoles } from 'src/users/enums/user-roles.enum';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { CreatePlanDTO } from './dtos/create-plan.dto';
import { Plan } from './plan.entity';

@Injectable()
export class PlansService {
  constructor(
    private companiesService: CompaniesService,
    @InjectRepository(Plan) private plansRepository: Repository<Plan>,
  ) {}
  async findById(id: string, relations?: string[]): Promise<Plan> {
    return await this.plansRepository
      .findOneOrFail(id, { relations })
      .catch((err) => {
        throw new BadRequestException('Plan Not Found', err);
      });
  }
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

  async updateStatus(id: string, isActive: boolean, user: User) {
    let plan = await this.findById(id, ['users']);
    if (plan.company_id !== user.company_id) {
      throw new BadRequestException('You are not allowed to update this plan');
    }
    if (!isActive && plan.users.length > 0) {
      throw new BadRequestException(
        'You cannot deactivate a plan with users',
      );
    }
    plan.isActive = isActive;
    return await this.plansRepository.save(plan).catch((err) => {
      throw new BadRequestException(err);
    });
  }

  async update(id: string, body: CreatePlanDTO, user: User) {
    let plan = await this.findById(id);
    if (plan.company_id != user.company_id) {
      throw new BadRequestException(
        "You don't have the permission to update this plan",
      );
    }
    if (user.role != UserRoles.ADMIN) {
      if (user.role != UserRoles.MANAGER) {
        throw new BadRequestException(
          'You are not allowed to update this plan',
        );
      }
    }

    return await this.plansRepository
      .update(id, {
        name: body.name,
        price: body.price,
        isActive: body.isActive,
      })
      .catch((err) => {
        throw new BadRequestException(err);
      });
  }
}
