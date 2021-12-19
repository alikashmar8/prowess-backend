import { Module } from '@nestjs/common';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
import { Level1AddressesModule } from './level1-addresses/level1-addresses.module';
import { Level2AddressesModule } from './level2-addresses/level2-addresses.module';
import { Level3AddressesModule } from './level3-addresses/level3-addresses.module';
import { Level4AddressesModule } from './level4-addresses/level4-addresses.module';
import { Level5AddressesModule } from './level5-addresses/level5-addresses.module';

@Module({
  controllers: [AddressesController],
  providers: [AddressesService],
  imports: [Level1AddressesModule, Level2AddressesModule, Level3AddressesModule, Level4AddressesModule, Level5AddressesModule]
})
export class AddressesModule {}
