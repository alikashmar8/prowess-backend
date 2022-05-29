import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import * as argon from 'argon2';
import { BCRYPT_SALT, CRYPTO_KEY, JWT_SECRET, CRYPTO_IV } from 'src/common/constants';
import { UserRoles } from 'src/users/enums/user-roles.enum';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { JWT_SUPER_ADMIN_EXPIRY_TIME } from './../common/constants';
import { CreateSuperAdminDTO } from './dtos/create-super-admin.dto';
import { LoginDTO } from './dtos/login.dto';
import { UpdatePasswordDTO } from './dtos/update-password-dto';
import { createCipheriv, createDecipheriv } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async login(data: LoginDTO) {
    let user = await this.usersService.findByUsernameOrFail(data.username, [
      'company',
    ]);

    // const decipher = createDecipheriv('aes-256-ctr', CRYPTO_KEY, CRYPTO_IV);
    // const decryptedText = Buffer.concat([
    //   decipher.update(user.password, 'hex'),
    //   decipher.final(),
    // ]);
    


    // const match = decryptedText.toString() === data.password;

    const match = await argon.verify(user.password, data.password);    
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

  async updatePassword(id: string, body: UpdatePasswordDTO) {
    let user = await this.usersService.findById(id);

    // const sc = simplecrypt({
    //   salt: BCRYPT_SALT,
    // });
    // const password = sc.decrypt(user.password);
    // const match = password == body.oldPassword;

    const match = await argon.verify(user.password, body.oldPassword);

    
    // const decipher = createDecipheriv('aes-256-ctr', CRYPTO_KEY, CRYPTO_IV);
    // const decryptedText = Buffer.concat([
    //   decipher.update(user.password, 'hex'),
    //   decipher.final(),
    // ]);
    


    // const match = decryptedText.toString() === body.oldPassword;

    if (!match) throw new BadRequestException('Old password incorrect!');

    if (body.newPassword !== body.confirmPassword)
      throw new BadRequestException(
        'New password and confirm password do not match!',
      );

    // user.password = sc.encrypt(body.newPassword);
    // user.password = await argon.hash(body.newPassword);
    // const cipher = createCipheriv('aes-256-ctr', CRYPTO_KEY, CRYPTO_IV);
    // const encryptedText = Buffer.concat([
    //   cipher.update(body.newPassword),
    //   cipher.final(),
    // ]);
    // user.password = encryptedText.toString('hex');
    user.password = await argon.hash(body.newPassword);
    return await this.usersRepository.save(user).catch((err) => {
      console.log(err);
      throw new BadRequestException('Error updating password');
    });
  }
}
