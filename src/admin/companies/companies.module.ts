import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from 'src/addresses/address.entity';
import { CompaniesService } from 'src/companies/companies.service';
import { Company } from 'src/companies/company.entity';
import { Invoice } from 'src/invoices/invoice.entity';
import { InvoicesService } from 'src/invoices/invoices.service';
import { Item } from 'src/items/item.entity';
import { Plan } from 'src/plans/plan.entity';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { AdminCompaniesController } from './companies.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, User, Plan, Address, Invoice, Item]),
  ],
  controllers: [AdminCompaniesController],
  providers: [CompaniesService, UsersService, InvoicesService],
})
export class AdminCompaniesModule {}
