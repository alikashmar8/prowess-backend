import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from 'src/addresses/address.entity';
import { CompaniesService } from 'src/companies/companies.service';
import { Company } from 'src/companies/company.entity';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Plan } from './plan.entity';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Plan, User, Address])],
  providers: [PlansService, CompaniesService, UsersService],
  controllers: [PlansController],
})
export class PlansModule {}
