import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from 'src/companies/company.entity';
import { Invoice } from 'src/invoices/invoice.entity';
import { Plan } from 'src/plans/plan.entity';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Level2Address } from './level2-address.entity';
import { Level2AddressesController } from './level2-addresses.controller';
import { Level2AddressesService } from './level2-addresses.service';

@Module({
  imports: [TypeOrmModule.forFeature([Level2Address, User, Company, Invoice, Plan])],
  controllers: [Level2AddressesController],
  providers: [Level2AddressesService, UsersService],
})
export class Level2AddressesModule {}
