import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AddressesLevel } from 'src/addresses/enums/addresses.enum';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { IsEmployeeGuard } from 'src/auth/guards/is-employee.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { getAddressesRelationsList } from 'src/common/utils/functions';
import { CreateCustomerDTO } from 'src/users/dtos/create-customer.dto';
import { CreateEmployeeDTO } from 'src/users/dtos/create-employee.dto';
import { UserRoles } from 'src/users/enums/user-roles.enum';
import { OwnCompanyGuard } from './../auth/guards/own-company.guard';
import { EditCustomerDTO } from './../users/dtos/edit-customer.dto';
import { CompaniesService } from './companies.service';
import { CreateCompanyDTO } from './dtos/create-company.dto';
import { UpdateCompanyDTO } from './dtos/update-company.dto';

@ApiTags('companies')
@Controller('companies')
@UsePipes(new ValidationPipe())
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @UseGuards(new IsEmployeeGuard())
  @Get('current_company')
  async getCurrentCompany(@CurrentUser() user) {
    return await this.companiesService.findByEmployeeId(user.id);
  }

  @UseGuards(new OwnCompanyGuard())
  @Get(':company_id')
  async getById(@Param('company_id') id: string) {
    return await this.companiesService.findById(id, [
      'parentCompany',
      'users',
      'items',
      'subCompanies',
    ]);
  }

  @UseGuards(new OwnCompanyGuard())
  @UsePipes(new ValidationPipe())
  @Put(':company_id')
  async update(
    @Param('company_id') id: string,
    @Body() data: UpdateCompanyDTO,
  ) {
    return await this.companiesService.update(id, data);
  }

  @UseGuards(new OwnCompanyGuard(), new AdminGuard())
  @Post(':company_id/employees')
  async storeEmployee(
    @Param('company_id') id: string,
    @Body() data: CreateEmployeeDTO,
  ) {
    return await this.companiesService.storeEmployee(data);
  }

  @UseGuards(new OwnCompanyGuard(), new AdminGuard())
  @Put(':company_id/employees/:employee_id/renew')
  async renew(
    @Param('company_id') company_id: string,
    @Param('employee_id') employee_id: string
  ) {
    return await this.companiesService.renewEmployee(employee_id);
  }

  @UseGuards(new OwnCompanyGuard(), new AdminGuard())
  @Delete(':company_id/employees/:employee_id')
  async deleteEmployee(
    @Param('company_id') company_id: string,
    @Param('employee_id') employee_id: string
  ) {
    return await this.companiesService.deleteEmployee(employee_id);
  }

  @UseGuards(new OwnCompanyGuard(), new AdminGuard())
  @Get(':company_id/employees')
  async getCompanyEmployees(
    @Param('company_id') id: string,
    @Query('role') role: UserRoles,
  ) {
    return await this.companiesService.getCompanyEmployees(id, role);
  }

  @UseGuards(new OwnCompanyGuard())
  @Get(':company_id/customers')
  async getCompanyCustomers(
    @Param('company_id') id: string,
    @CurrentUser() user,
    @Query() query,
  ) {
    let company =  await this.companiesService.findByIdOrFail(user.company_id);
    let relations = getAddressesRelationsList(company.maxLocationLevel)
    return await this.companiesService.getCompanyCustomers(id, user, query, relations);
  }

  @Roles(
    UserRoles.ADMIN,
    UserRoles.MANAGER,
    UserRoles.SUPERVISOR,
    UserRoles.COLLECTOR,
  )
  @UseGuards(new OwnCompanyGuard(), RolesGuard)
  @Get(':company_id/customers/:customer_id')
  async getCustomerById(
    @Param('company_id') company_id: string,
    @Param('customer_id') customer_id: string,
  ) {
    const company = await this.companiesService.findByIdOrFail(company_id);

    let relations = ['invoices', 'collector', 'plans', 'company', 'invoices.user'];
    switch (company.maxLocationLevel) {
      case AddressesLevel.LEVEL5:
        relations = [
          ...relations,
          ...[
            'address',
            'address.parent',
            'address.parent.parent',
            'address.parent.parent.parent',
            'address.parent.parent.parent.parent',
          ],
        ];
        break;
      case AddressesLevel.LEVEL4:
        relations = [
          ...relations,
          ...[
            'address',
            'address.parent',
            'address.parent.parent',
            'address.parent.parent.parent',
          ],
        ];
        break;
      case AddressesLevel.LEVEL3:
        relations = [
          ...relations,
          ...['address', 'address.parent', 'address.parent.parent'],
        ];
        break;
      case AddressesLevel.LEVEL2:
        relations = [...relations, ...['address', 'address.parent']];
        break;
      case AddressesLevel.LEVEL1:
        relations = [...relations, ...['address']];
        break;
    }
    return await this.companiesService.getCustomerByIdOrFail(
      customer_id,
      relations,
    );
  }

  @Roles(UserRoles.ADMIN, UserRoles.MANAGER, UserRoles.SUPERVISOR)
  @UseGuards(new OwnCompanyGuard(), RolesGuard)
  @UsePipes(new ValidationPipe())
  @Put(':company_id/customers/:customer_id')
  async updateCustomer(
    @Param('company_id') company_id: string,
    @Param('customer_id') customer_id: string,
    @Body() body: EditCustomerDTO,
  ) {
    return await this.companiesService.updateCustomer(customer_id, body);
  }

  @Post(':company_id/customers')
  @Roles(UserRoles.ADMIN, UserRoles.MANAGER, UserRoles.SUPERVISOR)
  @UseGuards(RolesGuard, new OwnCompanyGuard())
  async storeCustomer(
    @Body() body: CreateCustomerDTO,
    @Param('company_id') id: string,
    @CurrentUser() user,
  ) {
    return await this.companiesService.storeCustomer(body);
  }

  @UseGuards(new AdminGuard())
  @UsePipes(new ValidationPipe())
  @Post('')
  async store(@Body() body: CreateCompanyDTO) {
    return await this.companiesService.store(body);
  }
}
