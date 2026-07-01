import * as path from "path";
import { Project } from "ts-morph";
import fsExtra from "fs-extra";
import {
  pruneDependencies,
  pruneEnvKeys,
  pruneDockerCompose,
  removeImportBySpecifier,
  removeNestModuleImport,
  removePropertyAssignmentByName,
  removeClassGetter,
} from "./utils/prune-helpers";

export async function pruneMongoDatabase(projectRoot: string) {
  console.log("✂️  Starting isolated MongoDB pruning operation...");

  await pruneDependencies(projectRoot, ["@nestjs/mongoose", "mongoose"]);
  await pruneEnvKeys(projectRoot, ["MONGO_URI"]);
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
  removePropertyAssignmentByName(configModuleFile, "MONGO_URI");

  const configServiceFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/config/app-config.service.ts"),
  );
  removeClassGetter(configServiceFile, "AppConfigService", "mongoUri");

  await project.save();
  console.log("  └─ TS source files scrubbed of MongoDB references.");
}
