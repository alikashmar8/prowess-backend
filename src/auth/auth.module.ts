import { User } from 'src/users/user.entity';
import { Module } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from 'src/companies/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Company])],
  providers: [AuthService, UsersService],
  controllers: [AuthController],
})
export class AuthModule {}
