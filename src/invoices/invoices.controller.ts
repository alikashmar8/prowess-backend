import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsEmployeeGuard } from 'src/auth/guards/is-employee.guard';
import { OwnCompanyGuard } from 'src/auth/guards/own-company.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { IdsListDTO } from 'src/common/dtos/ids-list.dto';
import { getAddressesRelationsListWithUserKeyword } from 'src/common/utils/functions';
import { CompaniesService } from 'src/companies/companies.service';
import { UserRoles } from 'src/users/enums/user-roles.enum';
import { CreateInvoiceDTO } from './dtos/create-invoice.dto';
import { InvoicesService } from './invoices.service';

@ApiTags('Invoices')
@UseGuards(new IsEmployeeGuard())
@UsePipes(new ValidationPipe())
@Controller('invoices')
export class InvoicesController {
  constructor(
    private invoicesService: InvoicesService,
    private companiesService: CompaniesService,
  ) {}

  @UseGuards(new OwnCompanyGuard())
  @Post(':company_id')
  async store(
    @CurrentUser() user,
    @Param('company_id') company_id: string,
    @Body() body: CreateInvoiceDTO,
  ) {
    return await this.invoicesService.store(body);
  }

  @UseGuards(new OwnCompanyGuard())
  @Get(':company_id/unpaid')
  async getUnpaidInvoices(@CurrentUser() user) {
    return await this.invoicesService.findUnpaidInvoices(user.company_id);
  }

  @UseGuards(new OwnCompanyGuard())
  @Get(':company_id/this-month')
  async getThisMonthInvoices(@CurrentUser() user) {
    return await this.invoicesService.findThisMonthInvoices(user.company_id);
  }

  @UseGuards(new OwnCompanyGuard())
  @Get(':company_id/invoice/:id')
  async getById(
    @Param('id') id: string,
    @CurrentUser() user,
    @Param('company_id') companyId: string,
  ) {
    //  let relations: string[] = []
    const company = await this.companiesService.findByIdOrFail(companyId);
    let relations = getAddressesRelationsListWithUserKeyword(
      company.maxLocationLevel,
    );

    return await this.invoicesService.findById(id, [
      'plans',
      'items',
      'user',
      ...relations,
    ]);
  }

  @Roles(UserRoles.MANAGER, UserRoles.SUPERVISOR, UserRoles.COLLECTOR)
  @UseGuards(new OwnCompanyGuard(), RolesGuard)
  @Put(':company_id/forgive')
  async forgiveInvoices(
    @CurrentUser() user,
    @Param('company_id') company_id: string,
    @Body() body: IdsListDTO,
  ) {
    return await this.invoicesService.forgive(body);
  }

  @Roles(UserRoles.MANAGER, UserRoles.SUPERVISOR, UserRoles.COLLECTOR)
  @UseGuards(new OwnCompanyGuard(), RolesGuard)
  @Put(':company_id/collect')
  async collectInvoices(
    @CurrentUser() user,
    @Param('company_id') company_id: string,
    @Body() body: IdsListDTO,
  ) {
    return await this.invoicesService.collect(body);
  }
}
