import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { InvoiceTypes } from '../enums/invoice-types.enum';

export class CreateInvoiceDTO {
  @ApiProperty()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty()
  @ValidateIf(
    (self) => (self.plans && !self.items) || (!self.plans && self.items),
  )
  plans?: string[];

  @ApiProperty()
  @ValidateIf(
    (self) => (self.plans && !self.items) || (!self.plans && self.items),
  )
  items?: string[];

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  total?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  extraAmount?: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  dueDate?: Date;

  @IsNotEmpty()
  @IsEnum(InvoiceTypes)
  @ApiProperty({ enum: InvoiceTypes })
  type: InvoiceTypes;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isFirstPayment?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty()
  @IsNotEmpty()
  company_id: string;

  @ApiProperty()
  @IsOptional()
  collectedBy_id?: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  collected_at?: Date;
}
