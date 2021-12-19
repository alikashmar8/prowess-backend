import { Module } from '@nestjs/common';
import { Level1AddressesController } from './level1-addresses.controller';
import { Level1AddressesService } from './level1-addresses.service';

@Module({
  controllers: [Level1AddressesController],
  providers: [Level1AddressesService]
})
export class Level1AddressesModule {}
