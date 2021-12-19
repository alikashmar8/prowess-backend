import { IsNotEmpty, IsOptional } from 'class-validator';

export class EditAddressDTO {
  @IsNotEmpty()
  id: string;
  
  @IsOptional()
  country?: string;

  @IsOptional()
  district?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  area?: string;

  @IsOptional()
  street?: string;

  @IsOptional()
  building?: string;

  @IsOptional()
  notes?: string;
}
