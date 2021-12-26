import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateLevel5AddressDTO {
  @ApiProperty()
  @IsNotEmpty()
  name: string;
}
