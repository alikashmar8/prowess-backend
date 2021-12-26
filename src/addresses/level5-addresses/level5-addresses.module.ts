import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Level5Address } from './level5-address.entity';
import { Level5AddressesController } from './level5-addresses.controller';
import { Level5AddressesService } from './level5-addresses.service';

@Module({
  imports: [TypeOrmModule.forFeature([Level5Address, User])],
  controllers: [Level5AddressesController],
  providers: [Level5AddressesService, UsersService],
})
export class Level5AddressesModule {}
