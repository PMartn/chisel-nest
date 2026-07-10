import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { __PASCAL_NAME__Repository } from "./domain/ports/__KEBAB_NAME__-repository.port";
import {
  __PASCAL_NAME__Doc,
  __PASCAL_NAME__Schema,
} from "./infrastructure/persistence/mongo/__KEBAB_NAME__.schema";
import { Mongo__PASCAL_NAME__Repository } from "./infrastructure/persistence/mongo/mongo-__KEBAB_NAME__.repository";
import { __PLURAL_PASCAL__Controller } from "./infrastructure/http/__PLURAL_KEBAB__.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: __PASCAL_NAME__Doc.name, schema: __PASCAL_NAME__Schema },
    ]),
  ],
  controllers: [__PLURAL_PASCAL__Controller],
  providers: [
    Mongo__PASCAL_NAME__Repository,
    {
      provide: __PASCAL_NAME__Repository,
      useClass: Mongo__PASCAL_NAME__Repository,
    },
  ],
  exports: [__PASCAL_NAME__Repository],
})
export class __PLURAL_PASCAL__Module {}
