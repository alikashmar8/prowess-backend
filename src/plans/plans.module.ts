import { Module } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { CompaniesService } from 'src/companies/companies.service';
import { Company } from 'src/companies/company.entity';
import { User } from 'src/users/user.entity';
import { Plan } from './plan.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Address } from 'src/addresses/address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Plan, User, Address])],
  providers: [PlansService, CompaniesService, UsersService],
  controllers: [PlansController],
})
export class PlansModule {}
