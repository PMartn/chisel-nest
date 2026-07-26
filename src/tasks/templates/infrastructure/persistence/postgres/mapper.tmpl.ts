import { __PASCAL_NAME__ } from "../../../domain/models/__KEBAB_NAME__.model";
import { __PASCAL_NAME__Entity } from "./__KEBAB_NAME__.entity";

export class __PASCAL_NAME__Mapper {
  static toDomain(entity: __PASCAL_NAME__Entity): __PASCAL_NAME__ {
    return new __PASCAL_NAME__(entity.id, entity.name, entity.createdAt);
  }

  static toPersistence(domain: __PASCAL_NAME__): __PASCAL_NAME__Entity {
    const entity = new __PASCAL_NAME__Entity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.createdAt = domain.createdAt;
    return entity;
  }
}
