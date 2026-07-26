import { ApiProperty } from "@nestjs/swagger";
import { __PASCAL_NAME__ } from "../../../domain/models/__KEBAB_NAME__.model";

export class __PASCAL_NAME__ResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  createdAt!: Date;

  static fromDomain(__CAMEL_NAME__: __PASCAL_NAME__): __PASCAL_NAME__ResponseDto {
    const dto = new __PASCAL_NAME__ResponseDto();
    dto.id = __CAMEL_NAME__.id;
    dto.name = __CAMEL_NAME__.name;
    dto.createdAt = __CAMEL_NAME__.createdAt;
    return dto;
  }
}
