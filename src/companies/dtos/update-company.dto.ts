import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';
import { AddressesLevel } from '../../addresses/enums/addresses.enum';

export class UpdateCompanyDTO {
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
  maxLocationLevel: AddressesLevel;

  @IsNotEmpty()
  addressLevel1Name: string;

  @IsOptional()
  addressLevel2Name: string;

  @IsOptional()
  addressLevel3Name: string;

  @IsOptional()
  addressLevel4Name: string;

  @IsOptional()
  addressLevel5Name: string;
}
