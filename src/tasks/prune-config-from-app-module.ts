import { removeImportBySpecifier } from "./utils/prune-helpers";
import { Project } from "ts-morph";
import * as path from "path";

export async function pruneConfigFromAppModule(projectRoot: string) {
  console.log("✂️  Starting Config Imports pruning operation...");
  const project = new Project();
  const appModuleFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/app.module.ts"),
  );

  removeImportBySpecifier(appModuleFile, "./config/app-config.service");
  removeImportBySpecifier(appModuleFile, "@nestjs/config/dist/config.module");

  await project.save();
  console.log("  └─ Unused configuration imports cleared from app.module.ts");
}
