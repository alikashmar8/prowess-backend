import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { AddressesEnum } from 'src/addresses/enums/addresses.enum';

export class AdminCreateCompanyDTO {
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
  @IsEnum(AddressesEnum)
  @ApiProperty({ enum: AddressesEnum })
  maxLocationToEnter: AddressesEnum;

  @ApiProperty({ required: false, nullable: true })
  @IsNotEmpty()
  createdBy_id: string;
}
