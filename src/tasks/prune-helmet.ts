import * as path from "path";
import { Project } from "ts-morph";
import {
  pruneDependencies,
  removeImportBySpecifier,
} from "./utils/utils";

export async function pruneHelmet(projectRoot: string) {
  console.log("✂️  Starting Helmet pruning operation...");

  await pruneDependencies(projectRoot, ["helmet"]);

  const project = new Project();
  const mainFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/main.ts"),
  );

  removeImportBySpecifier(mainFile, "helmet");

  const bootstrapFn = mainFile.getFunction("bootstrap");
  if (bootstrapFn) {
    const helmetStatement = bootstrapFn.getStatement((s) =>
      s.getText().includes("app.use(helmet"),
    );
    if (helmetStatement) {
      helmetStatement.remove();
    }
  }

  await project.save();
  console.log("  └─ TS source files scrubbed of Helmet references.");
}
