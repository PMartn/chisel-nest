import { Injectable } from "@nestjs/common";
import { __PASCAL_NAME__ServicePort } from "./ports/__KEBAB_NAME__-service.port";
import { __PASCAL_NAME__Repository } from "../domain/ports/__KEBAB_NAME__-repository.port";
import { __PASCAL_NAME__ } from "../domain/models/__KEBAB_NAME__.model";
import { Create__PASCAL_NAME__Command } from "./dto/create-__KEBAB_NAME__.command";
import { __PASCAL_NAME__NotFoundError } from "../domain/errors/__KEBAB_NAME__-not-found.error";

@Injectable()
export class __PASCAL_NAME__Service implements __PASCAL_NAME__ServicePort {
  constructor(private readonly repository: __PASCAL_NAME__Repository) {}

  async create(
    command: Create__PASCAL_NAME__Command,
  ): Promise<__PASCAL_NAME__> {
    const __CAMEL_NAME__ = __PASCAL_NAME__.create({ name: command.name });
    return this.repository.save(__CAMEL_NAME__);
  }

  async findById(id: string): Promise<__PASCAL_NAME__> {
    const __CAMEL_NAME__ = await this.repository.findById(id);
    if (!__CAMEL_NAME__) {
      throw new __PASCAL_NAME__NotFoundError(id);
    }
    return __CAMEL_NAME__;
  }

  async findAll(): Promise<__PASCAL_NAME__[]> {
    return this.repository.findAll();
  }
}
