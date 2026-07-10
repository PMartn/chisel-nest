import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
} from "@nestjs/common";
import { __PASCAL_NAME__Repository } from "../../domain/ports/__KEBAB_NAME__-repository.port";
import { __PASCAL_NAME__ } from "../../domain/models/__KEBAB_NAME__.model";

@Controller("__PLURAL_KEBAB__")
export class __PLURAL_PASCAL__Controller {
  constructor(private readonly repository: __PASCAL_NAME__Repository) {}

  @Post()
  async create(
    @Body() dto: { id: string; name: string },
  ): Promise<__PASCAL_NAME__> {
    const item = new __PASCAL_NAME__(dto.id, dto.name, new Date());
    return this.repository.save(item);
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<__PASCAL_NAME__> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException("__PASCAL_NAME__ not found");
    return item;
  }
}
