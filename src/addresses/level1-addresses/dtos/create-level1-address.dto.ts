import { IsNotEmpty, IsOptional } from 'class-validator';

export class StoreLevel1Address {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  parent_id?: string;
}
