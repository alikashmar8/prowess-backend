import { IsNotEmpty, IsOptional } from 'class-validator';

export class StoreLevel2Address {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  parent_id?: string;
}
