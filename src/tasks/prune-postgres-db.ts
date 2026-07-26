import * as path from "path";
import { Project } from "ts-morph";
import fsExtra from "fs-extra";
import {
  pruneDependencies,
  pruneScripts,
  pruneEnvKeys,
  pruneDockerCompose,
  removeImportBySpecifier,
  removeNestModuleImport,
  removePropertyAssignmentsByNames,
} from "./utils/utils";

export async function prunePostgresDatabase(projectRoot: string) {
  console.log("✂️  Starting isolated Postgres database pruning operation...");

  const envKeys = [
    "POSTGRES_URL",
    "POSTGRES_HOST",
    "POSTGRES_PORT",
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "POSTGRES_DB",
  ];

  await pruneDependencies(projectRoot, [
    "@nestjs/typeorm",
    "typeorm",
    "pg",
    "dotenv",
  ]);
  await pruneScripts(projectRoot, [
    "typeorm",
    "migration:generate",
    "migration:run",
    "migration:revert",
    "migration:create",
  ]);
  await pruneEnvKeys(projectRoot, envKeys);
  await pruneDockerCompose(projectRoot, {
    services: ["postgres"],
    volumes: ["pgdata"],
  });

  await fsExtra.remove(
    path.join(projectRoot, "src/database/postgres.module.ts"),
  );
  await fsExtra.remove(path.join(projectRoot, "src/database/data-source.ts"));
  await fsExtra.remove(path.join(projectRoot, "src/database/migrations"));
  console.log("  └─ Deleted postgres.module.ts, data-source.ts and migrations/");

  const project = new Project();

  const appModuleFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/app.module.ts"),
  );
  removeImportBySpecifier(appModuleFile, "./database/postgres.module");
  removeNestModuleImport(appModuleFile, "AppModule", "PostgresModule");

  const configModuleFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/config/config.module.ts"),
  );
  removePropertyAssignmentsByNames(configModuleFile, [
    "POSTGRES_URL",
    "POSTGRES_HOST",
    "POSTGRES_PORT",
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "POSTGRES_DB",
  ]);

  await project.save();
  console.log("  └─ TS source files scrubbed of Postgres references.");
}
