import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompaniesService } from 'src/companies/companies.service';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { CreateItemDTO } from './dtos/create-item.dto';
import { Item } from './item.entity';

@Injectable()
export class ItemsService {
  async updateStatus(id: string, body: any, user: User) {
    if (!body.hasOwnProperty('isActive')) {
      throw new BadRequestException('Status not provided');
    }
    const item = await this.itemsRepository.findOneOrFail(id).catch(() => {
      throw new BadRequestException('Item not found');
    });
    if (item.company_id != user.company_id) {
      throw new ForbiddenException('You are not allowed to update this item');
    }
    return await this.itemsRepository
      .update(id, { isActive: body.isActive })
      .catch((err) => {
        throw new BadRequestException(err);
      });
  }
  constructor(
    @InjectRepository(Item) private itemsRepository: Repository<Item>,
    private companiesService: CompaniesService,
  ) {}

  async findByCompanyId(companyId: string, isActive: boolean) {
    const company = await this.companiesService.findByIdOrFail(companyId);
    if (isActive) {
      return await this.itemsRepository.find({
        where: { isActive: true, company_id: company.id },
      });
    } else {
      return await this.itemsRepository.find({
        where: { company_id: company.id },
      });
    }
  }
  async store(body: CreateItemDTO) {
    return await this.itemsRepository.save(body).catch((err) => {
      throw new BadRequestException(err);
    });
  }

  async update(id: string, body: CreateItemDTO, user: User) {
    if (user.company_id != body.company_id) {
      throw new ForbiddenException('You are not allowed to update this item');
    }
    const item = await this.itemsRepository.findOneOrFail(id).catch(() => {
      throw new BadRequestException('Item not found');
    });
    if (item.company_id != body.company_id) {
      throw new ForbiddenException('You are not allowed to update this item');
    }
    return await this.itemsRepository.update(id, body).catch((err) => {
      throw new BadRequestException(err);
    });
  }
}
