import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Level4Address } from './level4-address.entity';
import { Level4AddressesController } from './level4-addresses.controller';
import { Level4AddressesService } from './level4-addresses.service';

@Module({
  imports: [TypeOrmModule.forFeature([Level4Address, User])],
  controllers: [Level4AddressesController],
  providers: [Level4AddressesService, UsersService],
})
export class Level4AddressesModule {}
