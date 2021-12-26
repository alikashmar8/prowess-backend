import { CreateUserDTO } from './dtos/create-user.dto';
import { UserRoles } from './enums/user-roles.enum';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
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

  async findSuperAdmin() {
    return await this.usersRepository.findOne({
      where: { isSuperAdmin: true },
    });
  }

  async store(data: CreateUserDTO) {
    let user = this.usersRepository.create(data);
    return await this.usersRepository.save(user).catch((err) => {
      console.log(err);
      throw new BadRequestException('Error creating user');
    });
  }

  async findByIdOrFail(id: string) {
    return await this.usersRepository
      .findOneOrFail({
        where: { id: id },
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
}
