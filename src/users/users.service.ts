import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  COLLECTOR_RENEW_AMOUNT,
  MANAGER_RENEW_AMOUNT,
  SUPERVISOR_RENEW_AMOUNT
} from 'src/common/constants';
import { Company } from 'src/companies/company.entity';
import { InvoiceTypes } from 'src/invoices/enums/invoice-types.enum';
import { Invoice } from 'src/invoices/invoice.entity';
import { Plan } from 'src/plans/plan.entity';
import { User } from 'src/users/user.entity';
import { In, Repository } from 'typeorm';
import { CreateEmployeeDTO } from './dtos/create-employee.dto';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UpdateUserPlansDTO } from './dtos/update-user-plans.dto';
import { UserRoles } from './enums/user-roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Company) private companiesRepository: Repository<Company>,
    @InjectRepository(Invoice) private invoicesRepository: Repository<Invoice>,
    @InjectRepository(Plan) private plansRepository: Repository<Plan>,
  ) {}

  async findByUsernameOrFail(username: string, relations?: string[]) {
    return await this.usersRepository
      .findOneOrFail({
        where: { username: username },
        relations: relations,
      })
      .catch((err) => {
        throw new BadRequestException('User not found!');
      });
  }

  async findByUsername(username: string, relations?: string[]) {
    return await this.usersRepository.findOne({
      where: { username: username },
      relations: relations,
    });
  }

  async findSuperAdmin() {
    return await this.usersRepository.findOne({
      where: { isSuperAdmin: true },
    });
  }

  async store(data: CreateUserDTO) {
    const exist = await this.findByUsername(data.username);
    if (exist) throw new BadRequestException('Username already in use');
    let user = this.usersRepository.create(data);
    return await this.usersRepository.save(user).catch((err) => {
      console.log(err);
      throw new BadRequestException('Error creating user');
    });
  }

  async findByIdOrFail(id: string, relations?: string[]) {
    return await this.usersRepository
      .findOneOrFail({
        where: { id: id },
        relations: relations,
      })
      .catch((err) => {
        throw new BadRequestException('User not found!');
      });
  }

  async updateUser(id: string, data: { isActive?: boolean }) {
    try {
      return await this.usersRepository.update(id, data);
    } catch (err) {
      console.log(err);
      throw new BadRequestException('Error updating user!');
    }
  }

  async getCustomerByIdOrFail(id: string, relations?: string[]) {
    let user = await this.usersRepository
      .findOneOrFail(
        { id, role: UserRoles.CUSTOMER },
        {
          relations: relations,
        },
      )
      .catch((err) => {
        throw new BadRequestException('Customer not found');
      });

    let invoices = await this.invoicesRepository.find({
      where: {
        user_id: user.id,
        type: InvoiceTypes.PLANS_INVOICE,
      },
      order: {
        dueDate: 'DESC',
      },
      relations: ['collectedBy'],
      take: 12,
    });
    user.invoices = invoices;

    return user;
  }

  async findUserByIdOrFail(id: string, relations?: string[]) {
    return await this.usersRepository
      .findOneOrFail({
        where: { id: id },
        relations: relations,
      })
      .catch((err) => {
        throw new BadRequestException('User not found!');
      });
  }

  async storeEmployee(data: CreateEmployeeDTO) {
    const role = data.role;
    const company = await this.companiesRepository
      .findOneOrFail(data.company_id)
      .catch((err) => {
        throw new BadRequestException('Company not found!');
      });
    let amountToDeduct = 0;

    switch (role) {
      case UserRoles.ADMIN:
      case UserRoles.CUSTOMER:
        throw new BadRequestException('Invalid role passed');
      case UserRoles.MANAGER:
        const currentManagers: User[] = await this.usersRepository.find({
          where: {
            company_id: data.company_id,
            role: UserRoles.MANAGER,
          },
        });
        const currentManagersCount: number = currentManagers.length;
        if (company.maxManagersNumber <= currentManagersCount)
          throw new BadRequestException(
            'Maximum number of managers is reached, contact administrator to increase limit',
          );
        amountToDeduct = MANAGER_RENEW_AMOUNT;

        break;
      case UserRoles.SUPERVISOR:
        const currentSupervisors: User[] = await this.usersRepository.find({
          where: {
            company_id: data.company_id,
            role: UserRoles.SUPERVISOR,
          },
        });
        const currentSupervisorsCount: number = currentSupervisors.length;
        if (company.maxSupervisorsNumber <= currentSupervisorsCount)
          throw new BadRequestException(
            'Maximum number of supervisors is reached, contact administrator to increase limit',
          );
        amountToDeduct = SUPERVISOR_RENEW_AMOUNT;

        break;
      case UserRoles.COLLECTOR:
        const currentCollectors: User[] = await this.usersRepository.find({
          where: {
            company_id: data.company_id,
            role: UserRoles.COLLECTOR,
          },
        });
        const currentCollectorsCount: number = currentCollectors.length;
        if (company.maxCollectorsNumber <= currentCollectorsCount)
          throw new BadRequestException(
            'Maximum number of collectors is reached, contact administrator to increase limit',
          );
        amountToDeduct = COLLECTOR_RENEW_AMOUNT;

        break;
    }
    if (
      Number(amountToDeduct) > Number(company.balance) ||
      Number(amountToDeduct) <= 0
    )
      throw new BadRequestException('Insufficient funds!');

    const newBalance =
      Number(company.balance) - Number(amountToDeduct);

    await this.companiesRepository.update(company.id, {
      balance: newBalance,
    });

    if (company.createdBy_id) {
      //company is created by super admin
      let superAdmin = await this.findSuperAdmin();
      superAdmin.balance = Number(superAdmin.balance) + Number(amountToDeduct);
      await this.usersRepository.save(superAdmin);
    } else {
      //company is related to a parent company

      let parentCompany = await this.companiesRepository
      .findOneOrFail(company.parentCompany_id)
      .catch((err) => {
        throw new BadRequestException('Company not found!');
      });
      parentCompany.balance =
        Number(parentCompany.balance) + Number(amountToDeduct);
      await this.companiesRepository.save(parentCompany);
    }
    const employee = this.usersRepository.create(data);
    return await this.usersRepository.save(employee).catch((err) => {
      console.error(err);
      throw new BadRequestException('Error Creating Employee');
    });
  }

  async findPaymentOnThisDay() {
    const today = new Date().getDate();
    return await this.usersRepository
      .createQueryBuilder('user')
      .where(`Day(user.dueDate) = :today`, {
        today: today,
      })
      .andWhere('user.role = :role', { role: UserRoles.CUSTOMER })
      .andWhere('user.isActive = :condition', { condition: true })
      .getMany();
  }

  async deleteEmployee(id: string) {
    try {
      return await this.usersRepository.delete(id);
    } catch (err) {
      console.log(err);
      throw new BadRequestException('Error deleting employee');
    }
  }

  async findExpiredActiveUsers() {
    const today = new Date();
    today.setUTCHours(23, 59, 59, 999);

    let users = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.expiryDate < :today', { today: today })
      .andWhere('user.isActive = :condition', { condition: true })
      .getMany();

    return users;
  }

  async updateUsersStatus(ids: string[], isActive: boolean) {
    return await this.usersRepository.update(
      {
        id: In(ids),
      },
      { isActive: isActive },
    );
  }

  findAllActiveCustomers() {
    return this.usersRepository.find({
      where: {
        role: UserRoles.CUSTOMER,
        isActive: true,
      },
    });
  }

  async findById(id: string, relations?: string[]): Promise<User> {
    return await this.usersRepository
      .findOneOrFail(id, { relations })
      .catch(() => {
        throw new BadRequestException('User not found!');
      });
  }

  async updateUserPlans(
    id: string,
    data: UpdateUserPlansDTO,
    currentUser: User,
  ): Promise<any> {
    const user = await this.findByIdOrFail(id);
    const plans = await this.plansRepository.find({
      where: {
        id: In(data.ids),
      },
    });
    await this.invoicesRepository.save({
      user_id: id,
      type: InvoiceTypes.PLANS_INVOICE,
      dueDate: new Date(),
      collectedBy: currentUser,
      plans,
      collected_at: new Date(),
      isFirstPayment: true,
      isPaid: true,
      notes: data.invoice_note,
      total: data.invoice_total,
    });
    user.plans = plans;
    return await this.usersRepository.save(user);
  }
}
