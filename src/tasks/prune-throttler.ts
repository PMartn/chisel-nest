import * as path from "path";
import { Project } from "ts-morph";
import {
  pruneDependencies,
  removeImportBySpecifier,
  removeNestModuleImport,
} from "./utils/utils";

export async function pruneThrottler(projectRoot: string) {
  console.log("✂️  Starting Throttler pruning operation...");

  await pruneDependencies(projectRoot, ["@nestjs/throttler"]);

  const project = new Project();
  const appModuleFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/app.module.ts"),
  );

  removeImportBySpecifier(appModuleFile, "@nestjs/throttler");
  removeNestModuleImport(appModuleFile, "AppModule", "ThrottlerModule");

  await project.save();
  console.log("  └─ TS source files scrubbed of Throttler references.");
}
