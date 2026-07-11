import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { __PASCAL_NAME__Repository } from "../../../domain/ports/__KEBAB_NAME__-repository.port";
import { __PASCAL_NAME__ } from "../../../domain/models/__KEBAB_NAME__.model";
import { __PASCAL_NAME__Entity } from "./__KEBAB_NAME__.entity";
import { __PASCAL_NAME__Mapper } from "./__KEBAB_NAME__.mapper";

@Injectable()
export class Postgres__PASCAL_NAME__Repository implements __PASCAL_NAME__Repository {
  constructor(
    @InjectRepository(__PASCAL_NAME__Entity)
    private readonly repository: Repository<__PASCAL_NAME__Entity>,
  ) {}

  async save(__CAMEL_NAME__: __PASCAL_NAME__): Promise<__PASCAL_NAME__> {
    const entity = __PASCAL_NAME__Mapper.toPersistence(__CAMEL_NAME__);
    const saved = await this.repository.save(entity);
    return __PASCAL_NAME__Mapper.toDomain(saved);
  }

  async findById(id: string): Promise<__PASCAL_NAME__ | null> {
    const entity = await this.repository.findOneBy({ id });
    return entity ? __PASCAL_NAME__Mapper.toDomain(entity) : null;
  }

  async findAll(): Promise<__PASCAL_NAME__[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => __PASCAL_NAME__Mapper.toDomain(entity));
  }
}
