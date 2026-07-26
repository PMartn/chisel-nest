import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class Create__PASCAL_NAME__RequestDto {
  @ApiProperty({ description: "The name of the __CAMEL_NAME__" })
  @IsString()
  @IsNotEmpty()
  name!: string;
}
