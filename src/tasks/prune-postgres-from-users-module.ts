import * as path from "path";
import * as fs from "fs";
import { Project } from "ts-morph";
import {
  updateProviderUseClass,
  getDecoratorArgs,
  removeElementFromDecoratorArray,
} from "./utils/prune-helpers";

export async function prunePostgresFromUsersModule(projectRoot: string) {
  console.log("🧹 Pruning PostgreSQL infrastructure from Users module...");

  const project = new Project();
  const modulePath = path.join(projectRoot, "src/users/users.module.ts");
  const sourceFile = project.addSourceFileAtPath(modulePath);

  updateProviderUseClass(
    sourceFile,
    "UserRepositoryProvider",
    "MongoUserRepository",
  );

  const moduleArgs = getDecoratorArgs(sourceFile, "UsersModule", "Module");
  removeElementFromDecoratorArray(moduleArgs, "imports", "TypeOrmModule");
  removeElementFromDecoratorArray(
    moduleArgs,
    "providers",
    "PostgresUserRepository",
    true,
  );

  sourceFile.fixUnusedIdentifiers();
  await project.save();

  const postgresDir = path.join(
    projectRoot,
    "src/users/infrastructure/persistence/postgres",
  );
  if (fs.existsSync(postgresDir)) {
    fs.rmSync(postgresDir, { recursive: true, force: true });
    console.log("  └─ Deleted postgres persistence directory.");
  }

  console.log("  └─ UsersModule optimized exclusively for MongoDB.");
}
