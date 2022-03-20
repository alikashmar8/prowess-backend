import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty, IsNumber, IsOptional, IsString
} from 'class-validator';

export class CreateCustomerDTO {
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
  @IsOptional()
  address_id?: string;

  @ApiProperty()
  @IsOptional()
  plans: string[];

  @ApiProperty()
  @IsNotEmpty()
  company_id: string;

  @ApiProperty()
  @IsNotEmpty()
  collector_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  paymentDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  invoice_total: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  invoice_notes?: string;
}
