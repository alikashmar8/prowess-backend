import { Module } from '@nestjs/common';
import { Level3AddressesController } from './level3-addresses.controller';
import { Level3AddressesService } from './level3-addresses.service';

@Module({
  controllers: [Level3AddressesController],
  providers: [Level3AddressesService]
})
export class Level3AddressesModule {}
