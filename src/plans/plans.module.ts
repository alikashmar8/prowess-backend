import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from 'src/addresses/address.entity';
import { CompaniesService } from 'src/companies/companies.service';
import { Company } from 'src/companies/company.entity';
import { Invoice } from 'src/invoices/invoice.entity';
import { InvoicesService } from 'src/invoices/invoices.service';
import { Item } from 'src/items/item.entity';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Plan } from './plan.entity';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, Plan, User, Address, Invoice, Item]),
  ],
  providers: [PlansService, CompaniesService, UsersService, InvoicesService],
  controllers: [PlansController],
})
export class PlansModule {}
