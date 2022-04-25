import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { IsEmployeeGuard } from 'src/auth/guards/is-employee.guard';
import { OwnCompanyGuard } from 'src/auth/guards/own-company.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { CollectListDTO } from 'src/common/dtos/collect-list.dto';
import { getAddressesRelationsListWithUserKeyword } from 'src/common/utils/functions';
import { CompaniesService } from 'src/companies/companies.service';
import { UserRoles } from 'src/users/enums/user-roles.enum';
import { User } from 'src/users/user.entity';
import { CreateInvoiceDTO } from './dtos/create-invoice.dto';
import { InvoiceTypes } from './enums/invoice-types.enum';
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

  @UseGuards(new AuthGuard())
  @Get('customer/:customer_id')
  async getCustomerInvoices(
    @CurrentUser() user,
    @Param('customer_id') customer_id: string,
    @Query('type') type: InvoiceTypes,
  ) {
    return await this.invoicesService.findCustomerInvoices(customer_id, type);
  }

  @UseGuards(new AuthGuard())
  @Get(':id/report/pdf')
  async getInvoicePdf(
    @Res() res: Response,
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return await this.invoicesService.getInvoicePdf(res, id, user);
  }

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
  async getUnpaidInvoices(
    @CurrentUser() user,
    @Param('company_id') company_id,
    @Query('search') search,
  ) {
    return await this.invoicesService.findUnpaidInvoices(
      user.company_id,
      search,
    );
  }

  @UseGuards(new OwnCompanyGuard())
  @Get(':company_id/month')
  async getThisMonthInvoices(
    @CurrentUser() user,
    @Param('company_id') company_id,
    @Query('search') search: string,
    @Query('searchMonth') date: Date,
  ) {
    if (!date) {
      date = new Date();
    } else {
      date = new Date(date);
    }
    return await this.invoicesService.findInvoicesByMonth(
      user.company_id,
      date,
      search,
    );
  }

  @UseGuards(new OwnCompanyGuard())
  @Get(':company_id/invoice/:id')
  async getById(
    @Param('id') id: string,
    @CurrentUser() user,
    @Param('company_id') companyId: string,
  ) {
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
    @Body() body: CollectListDTO,
  ) {
    return await this.invoicesService.forgive(body);
  }

  @Roles(UserRoles.MANAGER, UserRoles.SUPERVISOR, UserRoles.COLLECTOR)
  @UseGuards(new OwnCompanyGuard(), RolesGuard)
  @Put(':company_id/collect')
  async collectInvoices(
    @CurrentUser() user,
    @Param('company_id') company_id: string,
    @Body() body: CollectListDTO,
  ) {
    return await this.invoicesService.collect(body);
  }

  @Get('reports/pdf/unpaid')
  async generatePDFUnpaid(@CurrentUser() user: User, @Res() res) {
    return await this.invoicesService.generatePDFUnpaid(res, user.company_id);
  }

  @Get('reports/pdf/by-month')
  async generatePDFByMonth(
    @CurrentUser() user: User,
    @Res() res,
    @Query('date') date,
  ) {
    if (!date) {
      date = new Date();
    } else {
      date = new Date(date);
    }
    return await this.invoicesService.generatePDFByMonth(
      res,
      user.company_id,
      date,
    );
  }

  @Get('reports/excel/unpaid')
  async generateExcelUnpaid(@CurrentUser() user: User, @Res() res: Response) {
    return await this.invoicesService.generateExcel(res, user.company_id);
  }

  @Get('reports/excel/by-month')
  async generateExcelByMonth(
    @CurrentUser() user: User,
    @Res() res: Response,
    @Query('date') date: Date,
  ) {
    if (date) {
      date = new Date(date);
    } else {
      date = new Date();
    }
    return await this.invoicesService.generateExcelByMonth(
      res,
      user.company_id,
      date,
    );
  }
}
