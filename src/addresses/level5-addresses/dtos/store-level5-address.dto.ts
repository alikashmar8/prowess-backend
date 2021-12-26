import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class StoreLevel5AddressDTO {
  @ApiProperty()
  @IsNotEmpty()
  name: string;
}
