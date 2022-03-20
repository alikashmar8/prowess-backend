import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Length
} from 'class-validator';
import { Match } from 'src/common/decorators/match.decorator';
import { UserRoles } from '../enums/user-roles.enum';

export class CreateUserDTO {
  @ApiProperty({ nullable: false, required: true })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ nullable: false, required: true, minLength: 3, maxLength: 16 })
  @IsNotEmpty()
  @Length(3, 16)
  username: string;

  @ApiProperty({ nullable: false, required: true })
  @IsNotEmpty()
  @Length(6)
  password: string;

  @ApiProperty({ nullable: false, required: true, minLength: 6 })
  @Length(6)
  @IsNotEmpty()
  @Match('password', {
    message: 'Password and password confirmation does not match!',
  })
  password_confirmation: string;

  @IsNotEmpty()
  @IsEnum(UserRoles)
  @ApiProperty({ enum: UserRoles })
  role: UserRoles;

  @IsNotEmpty()
  @ApiProperty({ required: true, nullable: false })
  company_id: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsDateString()
  paymentDate?: Date;
}
