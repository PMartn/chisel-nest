import { __PASCAL_NAME__ } from "../../domain/models/__KEBAB_NAME__.model";
import { Create__PASCAL_NAME__Command } from "../dto/create-__KEBAB_NAME__.command";

export abstract class __PASCAL_NAME__ServicePort {
  abstract create(
    command: Create__PASCAL_NAME__Command,
  ): Promise<__PASCAL_NAME__>;
  abstract findById(id: string): Promise<__PASCAL_NAME__>;
  abstract findAll(): Promise<__PASCAL_NAME__[]>;
}
