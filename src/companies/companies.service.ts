import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from 'src/addresses/address.entity';
import { AdminCreateCompanyDTO } from 'src/admin/companies/dtos/admin-create-company.dto';
import { removeSpecialCharacters } from 'src/common/utils/functions';
import { Plan } from 'src/plans/plan.entity';
import { CreateCustomerDTO } from 'src/users/dtos/create-customer.dto';
import { EditCustomerDTO } from 'src/users/dtos/edit-customer.dto';
import { UserRoles } from 'src/users/enums/user-roles.enum';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { In, Not, Repository } from 'typeorm';
import { Company } from './company.entity';
import { CreateCompanyDTO } from './dtos/create-company.dto';
import { UpdateCompanyDTO } from './dtos/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company) private companiesRepository: Repository<Company>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Plan) private plansRepository: Repository<Plan>,
    @InjectRepository(Address) private addressesRepository: Repository<Address>,
    private usersService: UsersService,
  ) {}
  async getAll() {
    return await this.companiesRepository.find();
  }

  async store(data: CreateCompanyDTO) {
    // const superAdmin = await this.usersService.findSuperAdmin();
    // data.createdBy_id = superAdmin.id;
    // data.parentCompany_id = null;
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
    return await this.usersRepository.save(customer);
  }

  async updateCustomer(id: string, data: EditCustomerDTO) {
    try {
      let res = await this.usersRepository.update(id, {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        address_id: data.address_id,
      }).catch((err) => {
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
}
