import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from 'src/addresses/address.entity';
import { CompaniesService } from 'src/companies/companies.service';
import { Company } from 'src/companies/company.entity';
import { Invoice } from 'src/invoices/invoice.entity';
import { InvoicesService } from 'src/invoices/invoices.service';
import { Plan } from 'src/plans/plan.entity';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Item } from './item.entity';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, Item, User, Address, Plan, Invoice]),
  ],
  providers: [ItemsService, CompaniesService, UsersService, InvoicesService],
  controllers: [ItemsController],
})
export class ItemsModule {}
