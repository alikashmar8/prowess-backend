import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { Match } from 'src/common/decorators/match.decorator';

export class CreateSuperAdminDTO {
  @ApiProperty({ nullable: false, required: true })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ nullable: false, required: true })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ nullable: false, required: true })
  @IsNotEmpty()
  phoneNumber: string;

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
}
