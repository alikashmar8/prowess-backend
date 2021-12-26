import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Level2Address } from './level2-address.entity';
import { Level2AddressesController } from './level2-addresses.controller';
import { Level2AddressesService } from './level2-addresses.service';

@Module({
  imports: [TypeOrmModule.forFeature([Level2Address, User])],
  controllers: [Level2AddressesController],
  providers: [Level2AddressesService, UsersService],
})
export class Level2AddressesModule {}
