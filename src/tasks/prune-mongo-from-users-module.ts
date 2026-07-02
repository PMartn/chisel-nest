import * as path from "path";
import * as fs from "fs";
import { Project } from "ts-morph";
import {
  getDecoratorArgs,
  removeElementFromDecoratorArray,
  updateProviderUseClass,
} from "./utils/prune-helpers";

export async function pruneMongoFromUsersModule(projectRoot: string) {
  console.log("🧹 Pruning MongoDB infrastructure from Users module...");

  const project = new Project();
  const modulePath = path.join(projectRoot, "src/users/users.module.ts");
  const sourceFile = project.addSourceFileAtPath(modulePath);

  updateProviderUseClass(
    sourceFile,
    "UserRepositoryProvider",
    "PostgresUserRepository",
  );

  const moduleArgs = getDecoratorArgs(sourceFile, "UsersModule", "Module");
  removeElementFromDecoratorArray(moduleArgs, "imports", "MongooseModule");
  removeElementFromDecoratorArray(
    moduleArgs,
    "providers",
    "MongoUserRepository",
    true,
  );

  sourceFile.fixUnusedIdentifiers();
  await project.save();

  const mongoDir = path.join(
    projectRoot,
    "src/users/infrastructure/persistence/mongo",
  );
  if (fs.existsSync(mongoDir)) {
    fs.rmSync(mongoDir, { recursive: true, force: true });
    console.log("  └─ Deleted mongo persistence directory.");
  }

  console.log("  └─ UsersModule optimized exclusively for Postgres.");
}
