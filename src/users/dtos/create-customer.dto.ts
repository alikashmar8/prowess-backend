import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsNotEmptyObject, IsOptional, ValidateNested } from "class-validator";
import { CreateAddressDTO } from "src/addresses/dtos/create-address.dto";

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
    address_id?: string

    @ApiProperty()
    @IsOptional()
    plans: string[];

    @ApiProperty()
    @IsNotEmpty()
    company_id: string;

    @ApiProperty()
    @IsNotEmpty()
    collector_id: string;
  }
  