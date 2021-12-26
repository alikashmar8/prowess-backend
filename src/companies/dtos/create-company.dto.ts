import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber, IsString
} from 'class-validator';
import { AddressesLevel } from './../../addresses/enums/addresses.enum';

export class CreateCompanyDTO {
  @ApiProperty({ required: true, nullable: false })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: true, nullable: false })
  @IsNotEmpty()
  @IsNumber()
  balance: number;

  @ApiProperty({ required: true, nullable: false })
  @IsNotEmpty()
  @IsNumber()
  maxManagersNumber: number;

  @ApiProperty({ required: true, nullable: false })
  @IsNotEmpty()
  @IsNumber()
  maxSupervisorsNumber: number;

  @ApiProperty({ required: true, nullable: false })
  @IsNotEmpty()
  @IsNumber()
  maxCollectorsNumber: number;

  @ApiProperty({ required: true, nullable: false })
  @IsNotEmpty()
  @IsNumber()
  maxCustomersNumber: number;

  @IsNotEmpty()
  @IsEnum(AddressesLevel)
  @ApiProperty({ enum: AddressesLevel })
  maxLocationToEnter: AddressesLevel;

  @ApiProperty({ required: false, nullable: true })
  @IsNotEmpty()
  parentCompany_id: string;
}
