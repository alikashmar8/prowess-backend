import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from 'src/companies/company.entity';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { CreateEmployeeDTO } from './dtos/create-employee.dto';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UserRoles } from './enums/user-roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Company) private companiesRepository: Repository<Company>,
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
    return await this.usersRepository
      .findOneOrFail(
        { id, role: UserRoles.CUSTOMER },
        {
          relations: relations,
        },
      )
      .catch((err) => {
        throw new BadRequestException('Customer not found');
      });
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
        break;
    }
    const employee = this.usersRepository.create(data);
    return await this.usersRepository.save(employee).catch((err) => {
      console.error(err);
      throw new BadRequestException('Error Creating Employee');
    });
  }

  async findCreatedThisDay() {
    const today = new Date().getDate();
    return await this.usersRepository
      .createQueryBuilder('user')
      .where(`Day(user.created_at) = :today`, {
        today: today,
      })
      .andWhere('user.role = :role', { role: UserRoles.CUSTOMER })
      .andWhere('user.isActive = :condition', { condition: true })
      .getMany();
  }
}