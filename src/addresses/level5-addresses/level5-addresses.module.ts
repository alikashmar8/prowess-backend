import { Module } from '@nestjs/common';
import { Level5AddressesController } from './level5-addresses.controller';
import { Level5AddressesService } from './level5-addresses.service';

@Module({
  controllers: [Level5AddressesController],
  providers: [Level5AddressesService]
})
export class Level5AddressesModule {}
