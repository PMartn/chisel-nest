import * as path from "path";
import * as fs from "fs";
import { Project } from "ts-morph";
import { removeImportBySpecifier, removeNestModuleImport } from "./utils/utils";

/**
 * Removes the entire Users module when no database is selected. A persistence-backed
 * module cannot function without a database, so it is unregistered from AppModule and
 * its source directory is deleted.
 */
export async function pruneUsersModule(projectRoot: string) {
  console.log("🧹 Removing Users module (no database selected)...");

  const project = new Project();
  const appModulePath = path.join(projectRoot, "src/app.module.ts");
  const sourceFile = project.addSourceFileAtPath(appModulePath);

  removeImportBySpecifier(sourceFile, "./users/users.module");
  removeNestModuleImport(sourceFile, "AppModule", "UsersModule");

  await project.save();

  const usersDir = path.join(projectRoot, "src/users");
  if (fs.existsSync(usersDir)) {
    fs.rmSync(usersDir, { recursive: true, force: true });
    console.log("  └─ Deleted users module directory.");
  }

  console.log("  └─ UsersModule removed from the application.");
}
