import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put, UseGuards, UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SuperAdminGuard } from 'src/auth/guards/super-admin.guard';
import { CompaniesService } from 'src/companies/companies.service';
import { AdminCreateCompanyDTO } from './dtos/admin-create-company.dto';
import { AdminUpdateCompanyDTO } from './dtos/admin-update-company.dto';

@ApiTags('admin/companies')
@UseGuards(new SuperAdminGuard())
@Controller('admin/companies')
export class AdminCompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Get('')
  async getAll() {
    return await this.companiesService.getAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.companiesService.findById(id, [
      'createdBy',
      'parentCompany',
      'users',
      'items',
      'subCompanies',
    ]);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  async update(@Body() data: AdminUpdateCompanyDTO, @Param('id') id: string) {
    return await this.companiesService.update(id, data);
  }

  @Post('')
  @UsePipes(new ValidationPipe())
  async store(@Body() data: AdminCreateCompanyDTO) {
    return await this.companiesService.adminStore(data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.companiesService.adminDelete(id);
  }
}
