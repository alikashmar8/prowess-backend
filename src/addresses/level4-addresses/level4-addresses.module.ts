import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from 'src/companies/company.entity';
import { Invoice } from 'src/invoices/invoice.entity';
import { Plan } from 'src/plans/plan.entity';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Level4Address } from './level4-address.entity';
import { Level4AddressesController } from './level4-addresses.controller';
import { Level4AddressesService } from './level4-addresses.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Level4Address, User, Company, Invoice, Plan]),
  ],
  controllers: [Level4AddressesController],
  providers: [Level4AddressesService, UsersService],
})
export class Level4AddressesModule {}
