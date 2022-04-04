import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from 'src/addresses/address.entity';
import { InvoicesService } from 'src/invoices/invoices.service';
import { Plan } from 'src/plans/plan.entity';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Invoice } from './../invoices/invoice.entity';
import { Item } from './../items/item.entity';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { Company } from './company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, User, Plan, Address, Invoice, Item]),
  ],
  providers: [CompaniesService, UsersService, InvoicesService],
  controllers: [CompaniesController],
})
export class CompaniesModule {}
