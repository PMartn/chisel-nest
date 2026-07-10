import { __PASCAL_NAME__ } from "../models/__KEBAB_NAME__.model";

export abstract class __PASCAL_NAME__Repository {
  abstract save(__CAMEL_NAME__: __PASCAL_NAME__): Promise<__PASCAL_NAME__>;
  abstract findById(id: string): Promise<__PASCAL_NAME__ | null>;
}
