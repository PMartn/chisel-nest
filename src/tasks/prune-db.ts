import * as path from "path";
import { Project, SyntaxKind } from "ts-morph";
import fsExtra from "fs-extra";

export async function prunePostgresDatabase(projectRoot: string) {
  console.log("✂️  Starting database pruning operation...");

  const { pathExists, readJson, writeJson, remove } = fsExtra;

  const pkgPath = path.join(projectRoot, "package.json");
  if (await pathExists(pkgPath)) {
    const pkg = await readJson(pkgPath);
    delete pkg.dependencies["@nestjs/typeorm"];
    delete pkg.dependencies["typeorm"];
    delete pkg.dependencies["pg"];
    await writeJson(pkgPath, pkg, { spaces: 2 });
    console.log("  └─ Removed database dependencies from package.json");
  }

  await remove(path.join(projectRoot, "src/database"));
  console.log("  └─ Deleted database folder");

  const project = new Project();

  const appModuleFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/app.module.ts"),
  );

  const dbImport = appModuleFile.getImportDeclaration(
    "./database/database.module",
  );
  if (dbImport) dbImport.remove();

  const appModuleClass = appModuleFile.getClassOrThrow("AppModule");
  const moduleDecorator = appModuleClass.getDecoratorOrThrow("Module");
  const decoratorArg = moduleDecorator
    .getArguments()[0]
    .asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
  const importsProperty = decoratorArg
    .getPropertyOrThrow("imports")
    .asKindOrThrow(SyntaxKind.PropertyAssignment);
  const importsArray = importsProperty.getInitializerIfKindOrThrow(
    SyntaxKind.ArrayLiteralExpression,
  );

  importsArray.getElements().forEach((element) => {
    const text = element.getText();
    if (text === "DatabaseModule") {
      importsArray.removeElement(element);
    }
  });

  const configModuleFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/config/config.module.ts"),
  );
  const databaseUrlProperty = configModuleFile
    .getDescendantsOfKind(SyntaxKind.PropertyAssignment)
    .find((p) => p.getName() === "DATABASE_URL");
  if (databaseUrlProperty) {
    databaseUrlProperty.remove();
  }

  const configServiceFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/config/app-config.service.ts"),
  );
  const configServiceClass =
    configServiceFile.getClassOrThrow("AppConfigService");
  const dbUrlGetter = configServiceClass.getGetAccessor("databaseUrl");
  if (dbUrlGetter) {
    dbUrlGetter.remove();
  }

  await project.save();
  console.log("  └─ AST modification complete. Core TS files scrubbed.");
}
