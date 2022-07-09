import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminCreateCompanyDTO } from 'src/admin/companies/dtos/admin-create-company.dto';
import {
  COLLECTOR_RENEW_AMOUNT,
  MANAGER_RENEW_AMOUNT,
  SUPERVISOR_RENEW_AMOUNT,
} from 'src/common/constants';
import {
  getPlansTotal,
  removeSpecialCharacters,
} from 'src/common/utils/functions';
import { InvoiceTypes } from 'src/invoices/enums/invoice-types.enum';
import { InvoicesService } from 'src/invoices/invoices.service';
import { Plan } from 'src/plans/plan.entity';
import { CreateCustomerDTO } from 'src/users/dtos/create-customer.dto';
import { CreateEmployeeDTO } from 'src/users/dtos/create-employee.dto';
import { EditCustomerDTO } from 'src/users/dtos/edit-customer.dto';
import { UserRoles } from 'src/users/enums/user-roles.enum';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Brackets, ILike, In, Not, Repository } from 'typeorm';
import { Invoice } from './../invoices/invoice.entity';
import { Company } from './company.entity';
import { CreateCompanyDTO } from './dtos/create-company.dto';
import { UpdateCompanyDTO } from './dtos/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company) private companiesRepository: Repository<Company>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Plan) private plansRepository: Repository<Plan>,
    @InjectRepository(Invoice) private invoicesRepository: Repository<Invoice>,
    private usersService: UsersService,
    private invoicesService: InvoicesService,
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
    queryParam?: any,
    relations?: string[],
  ): Promise<{ data: any; count: number }> {
    const take: number = queryParam?.take || 10;
    const skip: number = queryParam?.skip || 0;
    const search: string = queryParam?.search || '';
    const level5Add: string = queryParam?.level5Address || '';
    const level4Add: string = queryParam?.level4Address || '';
    const level3Add: string = queryParam?.level3Address || '';
    const level2Add: string = queryParam?.level2Address || '';
    const level1Add: string = queryParam?.level1Address || '';

    let result = [];
    let total = 0;

    let query: any = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.address', 'address')
      .leftJoinAndSelect('address.parent', 'level2')
      .leftJoinAndSelect('level2.parent', 'level3')
      .leftJoinAndSelect('level3.parent', 'level4')
      .leftJoinAndSelect('level4.parent', 'level5')
      .where(`user.company_id = ${company_id}`)
      .andWhere(`user.role = 'CUSTOMER'`);
    if (level1Add) {
      query = await query.andWhere(`address.id = ${level1Add}`);
    } else if (level2Add) {
      query = await query
        .innerJoinAndSelect('address.parent', 'level2')
        .andWhere(`level2.id = ${level2Add}`);
    } else if (level3Add) {
      query = await query
        .innerJoinAndSelect('address.parent', 'level2')
        .innerJoinAndSelect('level2.parent', 'level3')
        .andWhere(`level3.id = ${level3Add}`);
    } else if (level4Add) {
      query = await query
        .innerJoinAndSelect('address.parent', 'level2')
        .innerJoinAndSelect('level2.parent', 'level3')
        .innerJoinAndSelect('level3.parent', 'level4')
        .andWhere(`level4.id = ${level4Add}`);
    } else if (level5Add) {
      query = await query
        .innerJoinAndSelect('address.parent', 'level2')
        .innerJoinAndSelect('level2.parent', 'level3')
        .innerJoinAndSelect('level3.parent', 'level4')
        .innerJoinAndSelect('level5.parent', 'level5')
        .andWhere(`level5.id = ${level5Add}`);
    }

    if (search) {
      query = await query.andWhere(
        new Brackets((qb) => {
          qb.where('user.name like :name', { name: `%${search}%` })
            .orWhere('user.username like :username', {
              username: `%${search}%`,
            })
            .orWhere('user.phoneNumber like :phoneNumber', {
              phoneNumber: `%${search}%`,
            })
            .orWhere('user.email like :email', { email: `%${search}%` })
            .orWhere('user.id like :id', { id: `%${search}%` })
            .orWhere('user.paymentDate like :date', { date: `%${search}%` });
        }),
      );
    }
    // let whereJson = {
    //   company_id: company_id,
    //   role: UserRoles.CUSTOMER,
    // };
    // if (level1Add) {
    //   whereJson['address_id'] = level1Add;
    // } else if (level2Add) {
    //   whereJson;
    // }
    // let where = [
    //   {
    //     name: ILike('%' + search + '%'),
    //     ...whereJson,
    //   },
    //   {
    //     phoneNumber: ILike('%' + search + '%'),
    //     ...whereJson,
    //   },
    //   {
    //     email: ILike('%' + search + '%'),
    //     ...whereJson,
    //   },
    //   {
    //     username: ILike('%' + search + '%'),
    //     ...whereJson,
    //   },
    //   {
    //     id: ILike('%' + search + '%'),
    //     ...whereJson,
    //   },
    //   {
    //     paymentDate: ILike('%' + search + '%'),
    //     ...whereJson,
    //   },
    // ];
    switch (user.role) {
      case UserRoles.SUPERVISOR:
      case UserRoles.COLLECTOR:
        query = await query.andWhere(`collector_id = ${user.id}`);
        break;
    }

    query = await query.skip(skip).take(take).getManyAndCount();
    return {
      data: query[0],
      count: query[1],
    };
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

  async storeCustomer(data: CreateCustomerDTO, creator: User) {
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

    await this.invoicesRepository.save({
      user_id: customer.id,
      extraAmount: 0,
      isFirstPayment: true,
      isPaid: true,
      collectedBy_id: creator.id,
      collected_at: new Date(),
      notes: data.invoice_notes,
      total: data.invoice_total,
      type: InvoiceTypes.PLANS_INVOICE,
      dueDate: new Date(),
      plans: plans,
    });
    await this.invoicesRepository.save({
      isFirstPayment: false,
      isPaid: false,
      dueDate: new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        customer.paymentDate.getDate(),
      ),
      plans: plans,
      total: getPlansTotal(plans),
      type: InvoiceTypes.PLANS_INVOICE,
      user: customer,
      note: 'Monthly Auto Generated Invoice',
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

      return await this.usersService.findByIdOrFail(id);
      // const plans = await this.plansRepository.find({
      //   where: {
      //     id: In(data.plans),
      //   },
      // });
      // customer.plans = plans;
      // return await this.usersRepository.save(customer);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  async getCustomerByIdOrFail(customer_id: string, relations?: string[]) {
    let user: any = await this.usersService.getCustomerByIdOrFail(
      customer_id,
      relations,
    );
    user.unpaidInvoices = await this.invoicesService.getCustomerUnpaidInvoices(
      user.id,
    );
    return user;
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
    employee.isActive = true;
    return await this.usersRepository.save(employee);
  }
}
