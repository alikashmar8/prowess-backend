import { IsNotEmpty, IsOptional } from 'class-validator';

export class StoreLevel3Address {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  parent_id?: string;
}
