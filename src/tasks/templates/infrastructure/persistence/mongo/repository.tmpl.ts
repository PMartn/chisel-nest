import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { __PASCAL_NAME__Repository } from "../../../domain/ports/__KEBAB_NAME__-repository.port";
import { __PASCAL_NAME__ } from "../../../domain/models/__KEBAB_NAME__.model";
import {
  __PASCAL_NAME__Doc,
  __PASCAL_NAME__Document,
} from "./__KEBAB_NAME__.schema";
import { __PASCAL_NAME__Mapper } from "./__KEBAB_NAME__.mapper";

@Injectable()
export class Mongo__PASCAL_NAME__Repository implements __PASCAL_NAME__Repository {
  constructor(
    @InjectModel(__PASCAL_NAME__Doc.name)
    private readonly model: Model<__PASCAL_NAME__Document>,
  ) {}

  async save(__CAMEL_NAME__: __PASCAL_NAME__): Promise<__PASCAL_NAME__> {
    const persistenceModel =
      __PASCAL_NAME__Mapper.toPersistence(__CAMEL_NAME__);
    const savedDoc = await this.model.findOneAndUpdate(
      { id: __CAMEL_NAME__.id },
      persistenceModel,
      { upsert: true, new: true },
    );
    return __PASCAL_NAME__Mapper.toDomain(savedDoc);
  }

  async findById(id: string): Promise<__PASCAL_NAME__ | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? __PASCAL_NAME__Mapper.toDomain(doc) : null;
  }
}
