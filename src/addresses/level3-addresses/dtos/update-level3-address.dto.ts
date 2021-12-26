import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateLevel3AddressDTO {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  parent_id?: string;
}
