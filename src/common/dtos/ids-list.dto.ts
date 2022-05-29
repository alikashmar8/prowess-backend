import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class IdsList {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  ids: string[];
}
