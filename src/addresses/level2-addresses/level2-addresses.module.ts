import { Module } from '@nestjs/common';
import { Level2AddressesController } from './level2-addresses.controller';
import { Level2AddressesService } from './level2-addresses.service';

@Module({
  controllers: [Level2AddressesController],
  providers: [Level2AddressesService]
})
export class Level2AddressesModule {}
