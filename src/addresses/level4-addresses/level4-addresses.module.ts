import { Module } from '@nestjs/common';
import { Level4AddressesController } from './level4-addresses.controller';
import { Level4AddressesService } from './level4-addresses.service';

@Module({
  controllers: [Level4AddressesController],
  providers: [Level4AddressesService]
})
export class Level4AddressesModule {}
