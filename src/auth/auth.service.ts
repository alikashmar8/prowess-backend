import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from 'src/common/constants';
import { UserRoles } from 'src/users/enums/user-roles.enum';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import {
  JWT_SUPER_ADMIN_EXPIRY_TIME,
  JWT_USERS_EXPIRY_TIME,
} from './../common/constants';
import { CreateSuperAdminDTO } from './dtos/create-super-admin.dto';
import { LoginDTO } from './dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}
  async login(data: LoginDTO) {
    let user = await this.usersService.findByUsernameOrFail(data.username);

    const match = await bcrypt.compare(data.password, user.password);
    if (!match) throw new BadRequestException('Password incorrect!');

    if (user.isSuperAdmin) {
      const access_token = jwt.sign({ user }, JWT_SECRET, {
        expiresIn: JWT_SUPER_ADMIN_EXPIRY_TIME,
      });
      return {
        access_token,
        user,
      };
    }

    if (user.expiryDate) {
      //expiry date exists
      if (user.expiryDate.getTime() < new Date().getTime())
        //account expired
        throw new BadRequestException(
          'Your account has expired. Please contact the administrator',
        );

      //else account did not expire
      let diff = user.expiryDate.getTime() - new Date().getTime();
      var daysToExpire = Math.floor(diff / 1000 / 60 / 60 / 24);
      daysToExpire++;

      const access_token = jwt.sign({ user }, JWT_SECRET, {
        expiresIn: `${daysToExpire}d`,
      });
      return {
        access_token,
        user,
      };
    } else {
      //No expiry date exists
      const access_token = jwt.sign({ user }, JWT_SECRET, {
        expiresIn: JWT_SUPER_ADMIN_EXPIRY_TIME,
      });
      return {
        access_token,
        user,
      };
    }
  }

  async createSuperAdmin(data: CreateSuperAdminDTO) {
    const superAdmin = await this.usersService.findSuperAdmin();
    if (superAdmin)
      throw new BadRequestException('Super admin already exists!');

    const user = await this.usersRepository.create({
      ...data,
      isSuperAdmin: true,
      role: UserRoles.ADMIN,
    });
    return await this.usersRepository.save(user).catch((err) => {
      console.log(err);
      throw new BadRequestException('Error creating super admin');
    });
  }
}
