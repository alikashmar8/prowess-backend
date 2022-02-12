import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesService } from 'src/companies/companies.service';
import { Company } from 'src/companies/company.entity';
import { Item } from 'src/items/item.entity';
import { Plan } from 'src/plans/plan.entity';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Invoice } from './invoice.entity';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, User, Company, Plan, Item])],
  controllers: [InvoicesController],
  providers: [InvoicesService, CompaniesService, UsersService],
})
export class InvoicesModule {}
