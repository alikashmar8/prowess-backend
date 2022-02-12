import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from 'src/companies/company.entity';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Level3Address } from './level3-address.entity';
import { Level3AddressesController } from './level3-addresses.controller';
import { Level3AddressesService } from './level3-addresses.service';

@Module({
  imports: [TypeOrmModule.forFeature([Level3Address, User, Company])],
  controllers: [Level3AddressesController],
  providers: [Level3AddressesService, UsersService],
})
export class Level3AddressesModule {}
