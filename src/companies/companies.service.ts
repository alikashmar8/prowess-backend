import { Invoice } from './../invoices/invoice.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from 'src/addresses/address.entity';
import { AdminCreateCompanyDTO } from 'src/admin/companies/dtos/admin-create-company.dto';
import {
  COLLECTOR_RENEW_AMOUNT,
  MANAGER_RENEW_AMOUNT,
  SUPERVISOR_RENEW_AMOUNT,
} from 'src/common/constants';
import { removeSpecialCharacters } from 'src/common/utils/functions';
import { Plan } from 'src/plans/plan.entity';
import { CreateCustomerDTO } from 'src/users/dtos/create-customer.dto';
import { CreateEmployeeDTO } from 'src/users/dtos/create-employee.dto';
import { EditCustomerDTO } from 'src/users/dtos/edit-customer.dto';
import { UserRoles } from 'src/users/enums/user-roles.enum';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { In, Not, Repository } from 'typeorm';
import { Company } from './company.entity';
import { CreateCompanyDTO } from './dtos/create-company.dto';
import { UpdateCompanyDTO } from './dtos/update-company.dto';
import { InvoiceTypes } from 'src/invoices/enums/invoice-types.enum';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company) private companiesRepository: Repository<Company>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Plan) private plansRepository: Repository<Plan>,
    @InjectRepository(Invoice) private invoicesRepository: Repository<Invoice>,
    private usersService: UsersService,
  ) {}
  async getAll() {
    return await this.companiesRepository.find();
  }

  async store(data: CreateCompanyDTO) {
    const company = await this.companiesRepository.save(data).catch((err) => {
      console.log(err);
      throw new BadRequestException('Error saving company');
    });
    let username = removeSpecialCharacters(company.name);
    const exist = await this.usersService.findByUsername(username);
    if (exist) username = username + '' + Date.now();
    await this.usersService.store({
      name: 'admin',
      username: username,
      password: '12345678',
      password_confirmation: '12345678',
      role: UserRoles.ADMIN,
      company_id: company.id,
    });
    return company;
  }

  async adminStore(data: AdminCreateCompanyDTO) {
    const superAdmin = await this.usersService.findSuperAdmin();
    data.createdBy_id = superAdmin.id;
    const company = await this.companiesRepository.save(data).catch((err) => {
      console.log(err);
      throw new BadRequestException('Error saving company');
    });
    await this.usersService.store({
      name: 'admin',
      username: removeSpecialCharacters(company.name),
      password: '12345678',
      password_confirmation: '12345678',
      role: UserRoles.ADMIN,
      company_id: company.id,
    });
    return company;
  }

  async findById(id: string, relations: string[]) {
    return await this.companiesRepository.findOne(id, { relations: relations });
  }

  async findByIdOrFail(id: string, relations?: string[]) {
    return await this.companiesRepository
      .findOneOrFail(id, { relations: relations })
      .catch(() => {
        throw new BadRequestException('Company not found');
      });
  }

  update(id: string, data: UpdateCompanyDTO) {
    return this.companiesRepository.update(id, data);
  }

  async adminDelete(id: string) {
    return await this.companiesRepository.delete(id);
  }

  async getCompanyEmployees(company_id: string, role?: UserRoles) {
    let employees = [];
    if (role) {
      employees = await this.usersRepository.find({
        where: {
          company_id: company_id,
          role: role,
        },
      });
    } else {
      employees = await this.usersRepository.find({
        where: {
          company_id: company_id,
          role: Not(UserRoles.CUSTOMER),
        },
      });
    }
    return employees;
  }

  async getCompanyCustomers(
    company_id: string,
    user: User,
    query: any,
    relations?: string[],
  ) {
    const take: number = query.take || 10;
    const skip: number = query.skip || 0;
    let result = [];
    let total = 0;

    switch (user.role) {
      case UserRoles.ADMIN || UserRoles.MANAGER:
        [result, total] = await this.usersRepository.findAndCount({
          where: {
            company_id: company_id,
            role: UserRoles.CUSTOMER,
          },
          relations: relations,
          take: take,
          skip: skip,
        });
        return {
          data: result,
          count: total,
        };
      case UserRoles.SUPERVISOR || UserRoles.COLLECTOR:
        [result, total] = await this.usersRepository.findAndCount({
          where: {
            company_id: company_id,
            role: UserRoles.CUSTOMER,
            collector_id: user.id,
          },
          relations: relations,
          take: take,
          skip: skip,
        });
        return {
          data: result,
          count: total,
        };
    }
  }

  async findByEmployeeId(user_id: string) {
    const user = await this.usersService.findByIdOrFail(user_id);

    if (!user.isEmployee)
      throw new BadRequestException(
        'You should be employee to perform this action',
      );

    if (!user.company_id)
      throw new BadRequestException('Cannot find your company!');

    return await this.companiesRepository.findOneOrFail(user.company_id);
  }

  async storeCustomer(data: CreateCustomerDTO) {
    const company = await this.findByIdOrFail(data.company_id);
    const currentCustomersCount = await this.usersRepository
      .createQueryBuilder('user')
      .where('company_id = :company_id', { company_id: data.company_id })
      .andWhere('role = :role', { role: UserRoles.CUSTOMER })
      .getCount();
    if (company.maxCustomersNumber <= currentCustomersCount)
      throw new BadRequestException(
        'Number of customers exceeded the limit, to increase limit please contact the administrator',
      );
      
    if (
      new Date(data.paymentDate) < new Date(new Date().setHours(0, 0, 0, 0))
    ) {
      throw new BadRequestException('Payment date cannot be in the past');
    }
    let customer = this.usersRepository.create({ ...data, plans: [] });
    customer = await this.usersRepository.save(customer).catch((err) => {
      console.error(err);
      throw new BadRequestException('Error creating customer');
    });
    const plans = await this.plansRepository.find({
      where: {
        id: In(data.plans),
      },
    });
    customer.plans = plans;

    //TODO: create invoice
    await this.invoicesRepository.save({
      user_id: customer.id,
      extraAmount: 0,
      isFirstPayment: true,
      isPaid: true,
      notes: data.invoice_notes,
      total: data.invoice_total,
      type: InvoiceTypes.PLANS_INVOICE,
    });
    return await this.usersRepository.save(customer);
  }

  async updateCustomer(id: string, data: EditCustomerDTO) {
    try {
      let res = await this.usersRepository
        .update(id, {
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
          address_id: data.address_id,
          collector_id: data.collector_id,
          paymentDate: data.paymentDate,
        })
        .catch((err) => {
          console.error(err);
          throw new BadRequestException('Error updating customer');
        });

      let customer = await this.usersService.findByIdOrFail(id);
      const plans = await this.plansRepository.find({
        where: {
          id: In(data.plans),
        },
      });
      customer.plans = plans;
      return await this.usersRepository.save(customer);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  async getCustomerByIdOrFail(customer_id: string, relations?: string[]) {
    return await this.usersService.getCustomerByIdOrFail(
      customer_id,
      relations,
    );
  }

  async storeEmployee(data: CreateEmployeeDTO) {
    return await this.usersService.storeEmployee(data);
  }

  async deleteEmployee(employee_id: string) {
    return await this.usersService.deleteEmployee(employee_id);
  }

  async renewEmployee(employee_id: string) {
    let employee = await this.usersService.findByIdOrFail(employee_id, [
      'company',
    ]);
    if (!employee.isEmployee)
      throw new BadRequestException('User is not an employee!');
    let amountToDeduct = 0;
    switch (employee.role) {
      case UserRoles.MANAGER:
        amountToDeduct = MANAGER_RENEW_AMOUNT;
        break;
      case UserRoles.SUPERVISOR:
        amountToDeduct = SUPERVISOR_RENEW_AMOUNT;
        break;
      case UserRoles.COLLECTOR:
        amountToDeduct = COLLECTOR_RENEW_AMOUNT;
        break;
    }

    if (
      Number(amountToDeduct) > Number(employee.company.balance) ||
      Number(amountToDeduct) <= 0
    )
      throw new BadRequestException('Insufficient funds!');

    if (employee.isExpired) {
      const nextMonth = new Date(
        new Date().setMonth(new Date().getMonth() + 1),
      );
      employee.expiryDate = nextMonth;
    } else {
      employee.expiryDate = new Date(
        employee.expiryDate.setMonth(employee.expiryDate.getMonth() + 1),
      );
    }

    const newBalance =
      Number(employee.company.balance) - Number(amountToDeduct);

    await this.companiesRepository.update(employee.company_id, {
      balance: newBalance,
    });

    if (employee.company.createdBy_id) {
      //company is created by super admin
      let superAdmin = await this.usersService.findSuperAdmin();
      superAdmin.balance = Number(superAdmin.balance) + Number(amountToDeduct);
      await this.usersRepository.save(superAdmin);
    } else {
      //company is related to a parent company
      let parentCompany = await this.findByIdOrFail(
        employee.company.parentCompany_id,
      );
      parentCompany.balance =
        Number(parentCompany.balance) + Number(amountToDeduct);
      await this.companiesRepository.save(parentCompany);
    }
    return await this.usersRepository.save(employee);
  }
}
