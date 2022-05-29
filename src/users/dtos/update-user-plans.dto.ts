import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdateUserPlansDTO {
  @ApiProperty()
  @IsNotEmpty()
  ids: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  invoice_total: number;

  @ApiProperty()
  @IsOptional()
  invoice_note?: string;
}
