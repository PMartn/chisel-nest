import * as path from "path";
import { Project } from "ts-morph";
import fsExtra from "fs-extra";
import {
  pruneDependencies,
  pruneEnvKeys,
  pruneDockerCompose,
  removeImportBySpecifier,
  removeNestModuleImport,
  removePropertyAssignmentsByNames,
  removeClassGetter,
} from "./utils/prune-helpers";

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

  await pruneDependencies(projectRoot, ["@nestjs/typeorm", "typeorm", "pg"]);
  await pruneEnvKeys(projectRoot, envKeys);
  await pruneDockerCompose(projectRoot, {
    services: ["postgres"],
    volumes: ["pgdata"],
  });

  await fsExtra.remove(
    path.join(projectRoot, "src/database/postgres.module.ts"),
  );
  console.log("  └─ Deleted postgres.module.ts");

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

  const configServiceFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/config/app-config.service.ts"),
  );
  removeClassGetter(configServiceFile, "AppConfigService", "postgresUrl");

  await project.save();
  console.log("  └─ TS source files scrubbed of Postgres references.");
}
