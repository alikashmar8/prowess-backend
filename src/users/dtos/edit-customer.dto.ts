import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsNotEmptyObject, IsOptional, ValidateNested } from "class-validator";
import { CreateAddressDTO } from "src/addresses/dtos/create-address.dto";
import { EditAddressDTO } from "src/addresses/dtos/create-address.dto copy";

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
    @IsNotEmptyObject()
    @ValidateNested()
    @Type(() => EditAddressDTO)
    address: EditAddressDTO;

    @ApiProperty()
    @IsOptional()
    plans: string[];
  }
  