import { ApiProperty } from '@nestjs/swagger';
import {
    IsDateString,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    Length
} from 'class-validator';
import { UserRoles } from '../enums/user-roles.enum';

export class CreateEmployeeDTO {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(6, 32)
  password: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty()
  @IsNotEmpty()
  company_id: string;
  
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(UserRoles)
  role: UserRoles;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  expiryDate: Date;
}
