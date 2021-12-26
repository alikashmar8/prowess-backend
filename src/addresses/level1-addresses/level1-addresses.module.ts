import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Level1Address } from './level1-address.entity';
import { Level1AddressesController } from './level1-addresses.controller';
import { Level1AddressesService } from './level1-addresses.service';

@Module({
  imports: [TypeOrmModule.forFeature([Level1Address, User])],
  controllers: [Level1AddressesController],
  providers: [Level1AddressesService, UsersService],
})
export class Level1AddressesModule {}
