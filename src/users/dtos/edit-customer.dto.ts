import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty, IsOptional
} from 'class-validator';

export class EditCustomerDTO {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty()
  @IsNotEmpty()
  address_id?: string;

  @ApiProperty()
  @IsNotEmpty()
  collector_id?: string;

  @ApiProperty()
  @IsOptional()
  plans: string[];
}
