import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompaniesService } from 'src/companies/companies.service';
import { Repository } from 'typeorm';
import { CreateItemDTO } from './dtos/create-item.dto';
import { Item } from './item.entity';

@Injectable()
export class ItemsService {
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
}
