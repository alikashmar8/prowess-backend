import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateLevel2AddressDTO {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  parent_id?: string;
}
