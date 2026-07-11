import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
} from "@nestjs/common";
import { __PASCAL_NAME__ServicePort } from "../../application/ports/__KEBAB_NAME__-service.port";
import { __PASCAL_NAME__NotFoundError } from "../../domain/errors/__KEBAB_NAME__-not-found.error";
import { Create__PASCAL_NAME__RequestDto } from "./dto/create-__KEBAB_NAME__.request.dto";
import { __PASCAL_NAME__ResponseDto } from "./dto/__KEBAB_NAME__.response.dto";

@Controller("__PLURAL_KEBAB__")
export class __PLURAL_PASCAL__Controller {
  constructor(private readonly service: __PASCAL_NAME__ServicePort) {}

  @Post()
  async create(
    @Body() dto: Create__PASCAL_NAME__RequestDto,
  ): Promise<__PASCAL_NAME__ResponseDto> {
    const __CAMEL_NAME__ = await this.service.create({ name: dto.name });
    return __PASCAL_NAME__ResponseDto.fromDomain(__CAMEL_NAME__);
  }

  @Get()
  async findAll(): Promise<__PASCAL_NAME__ResponseDto[]> {
    const items = await this.service.findAll();
    return items.map((item) => __PASCAL_NAME__ResponseDto.fromDomain(item));
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<__PASCAL_NAME__ResponseDto> {
    try {
      const __CAMEL_NAME__ = await this.service.findById(id);
      return __PASCAL_NAME__ResponseDto.fromDomain(__CAMEL_NAME__);
    } catch (error) {
      if (error instanceof __PASCAL_NAME__NotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
