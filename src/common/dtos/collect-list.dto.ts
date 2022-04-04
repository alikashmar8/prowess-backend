import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class CollectListDTO{
    @ApiProperty()
    @IsNotEmpty()
    @IsArray()
    ids: string[];

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    collector_id: string;
}