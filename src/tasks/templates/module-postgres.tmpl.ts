import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { __PASCAL_NAME__Repository } from "./domain/ports/__KEBAB_NAME__-repository.port";
import { __PASCAL_NAME__ServicePort } from "./application/ports/__KEBAB_NAME__-service.port";
import { __PASCAL_NAME__Service } from "./application/__KEBAB_NAME__.service";
import { __PASCAL_NAME__Entity } from "./infrastructure/persistence/postgres/__KEBAB_NAME__.entity";
import { Postgres__PASCAL_NAME__Repository } from "./infrastructure/persistence/postgres/postgres-__KEBAB_NAME__.repository";
import { __PLURAL_PASCAL__Controller } from "./infrastructure/http/__PLURAL_KEBAB__.controller";

@Module({
  imports: [TypeOrmModule.forFeature([__PASCAL_NAME__Entity])],
  controllers: [__PLURAL_PASCAL__Controller],
  providers: [
    Postgres__PASCAL_NAME__Repository,
    {
      provide: __PASCAL_NAME__Repository,
      useClass: Postgres__PASCAL_NAME__Repository,
    },
    {
      provide: __PASCAL_NAME__ServicePort,
      useClass: __PASCAL_NAME__Service,
    },
  ],
  exports: [__PASCAL_NAME__ServicePort],
})
export class __PLURAL_PASCAL__Module {}
