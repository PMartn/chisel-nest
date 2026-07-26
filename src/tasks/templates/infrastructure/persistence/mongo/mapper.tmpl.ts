import { __PASCAL_NAME__ } from "../../../domain/models/__KEBAB_NAME__.model";
import { __PASCAL_NAME__Doc } from "./__KEBAB_NAME__.schema";

export class __PASCAL_NAME__Mapper {
  static toDomain(doc: __PASCAL_NAME__Doc): __PASCAL_NAME__ {
    return new __PASCAL_NAME__(doc.id, doc.name, doc.createdAt);
  }

  static toPersistence(domain: __PASCAL_NAME__): __PASCAL_NAME__Doc {
    const doc = new __PASCAL_NAME__Doc();
    doc.id = domain.id;
    doc.name = domain.name;
    doc.createdAt = domain.createdAt;
    return doc;
  }
}
