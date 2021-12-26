import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateLevel1AddressDTO {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  parent_id?: string;
}
