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

export async function pruneDatabase(projectRoot: string) {
  console.log(
    "✂️  Starting complete database wipe operation (None selected)...",
  );

  await pruneDependencies(projectRoot, [
    "@nestjs/typeorm",
    "typeorm",
    "pg",
    "@nestjs/mongoose",
    "mongoose",
  ]);

  const envKeys = [
    "POSTGRES_HOST",
    "POSTGRES_PORT",
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "POSTGRES_DB",
    "MONGO_ROOT_USER",
    "MONGO_ROOT_PASSWORD",
    "MONGO_DB",
    "MONGO_HOST",
    "MONGO_PORT",
  ];

  await pruneEnvKeys(projectRoot, envKeys);

  await pruneDockerCompose(projectRoot, {
    services: ["postgres", "mongodb"],
    volumes: ["pgdata", "mongodata"],
  });

  await fsExtra.remove(path.join(projectRoot, "src/database"));
  console.log("  └─ Deleted src/database folder entirely");

  const project = new Project();

  const appModuleFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/app.module.ts"),
  );
  removeImportBySpecifier(appModuleFile, "./database/postgres.module");
  removeImportBySpecifier(appModuleFile, "./database/mongo.module");
  removeNestModuleImport(appModuleFile, "AppModule", "PostgresModule");
  removeNestModuleImport(appModuleFile, "AppModule", "MongoModule");

  const configModuleFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/config/config.module.ts"),
  );
  removePropertyAssignmentsByNames(configModuleFile, envKeys);

  const configServiceFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/config/app-config.service.ts"),
  );
  removeClassGetter(configServiceFile, "AppConfigService", "postgresUrl");
  removeClassGetter(configServiceFile, "AppConfigService", "mongoUri");

  await project.save();
  console.log("  └─ TS source files completely scrubbed.");
}
