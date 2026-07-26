import * as path from "path";
import { Project } from "ts-morph";
import fsExtra from "fs-extra";
import {
  pruneDependencies,
  pruneEnvKeys,
  pruneDockerCompose,
  removeImportBySpecifier,
  removeNestModuleImport,
  removeClassGetter,
  removePropertyAssignmentsByNames,
} from "./utils/utils";

export async function pruneMongoDatabase(projectRoot: string) {
  console.log("✂️  Starting isolated MongoDB pruning operation...");

  const envKeys = [
    "MONGO_ROOT_USER",
    "MONGO_ROOT_PASSWORD",
    "MONGO_DB",
    "MONGO_HOST",
    "MONGO_PORT",
  ];

  await pruneDependencies(projectRoot, ["@nestjs/mongoose", "mongoose"]);
  await pruneEnvKeys(projectRoot, envKeys);
  await pruneDockerCompose(projectRoot, {
    services: ["mongodb"],
    volumes: ["mongodata"],
  });
  await fsExtra.remove(path.join(projectRoot, "src/database/mongo.module.ts"));

  const project = new Project();

  const appModuleFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/app.module.ts"),
  );
  removeImportBySpecifier(appModuleFile, "./database/mongo.module");
  removeNestModuleImport(appModuleFile, "AppModule", "MongoModule");

  const configModuleFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/config/config.module.ts"),
  );
  removePropertyAssignmentsByNames(configModuleFile, envKeys);

  const configServiceFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/config/app-config.service.ts"),
  );
  removeClassGetter(configServiceFile, "AppConfigService", "mongoUri");

  await project.save();
  console.log("  └─ TS source files scrubbed of MongoDB references.");
}
