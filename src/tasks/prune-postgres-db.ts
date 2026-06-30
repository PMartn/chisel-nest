import * as path from "path";
import { Project, SyntaxKind } from "ts-morph";
import fsExtra from "fs-extra";
import * as YAML from "yaml";

export async function prunePostgresDatabase(projectRoot: string) {
  console.log("✂️  Starting isolated Postgres database pruning operation...");

  const { pathExists, readJson, writeJson, remove, readFile, writeFile } =
    fsExtra;

  // 1. Remove Postgres-specific dependencies from package.json
  const pkgPath = path.join(projectRoot, "package.json");
  if (await pathExists(pkgPath)) {
    const pkg = await readJson(pkgPath);
    delete pkg.dependencies["@nestjs/typeorm"];
    delete pkg.dependencies["typeorm"];
    delete pkg.dependencies["pg"];
    await writeJson(pkgPath, pkg, { spaces: 2 });
    console.log("  └─ Removed Postgres dependencies from package.json");
  }

  // 2. Remove only the Postgres-specific directory/module file
  // (Assuming your skeleton splits files into src/database/postgres.module.ts)
  await remove(path.join(projectRoot, "src/database/postgres.module.ts"));
  console.log("  └─ Deleted postgres.module.ts");

  // 3. Surgical AST Adjustments
  const project = new Project();

  // --- Clean app.module.ts ---
  const appModuleFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/app.module.ts"),
  );
  const dbImport = appModuleFile.getImportDeclaration(
    "./database/postgres.module",
  );
  if (dbImport) dbImport.remove();

  const appModuleClass = appModuleFile.getClassOrThrow("AppModule");
  const moduleDecorator = appModuleClass.getDecoratorOrThrow("Module");
  // @ts-ignore
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
    if (element.getText() === "PostgresModule") {
      importsArray.removeElement(element);
    }
  });

  // --- Clean config.module.ts (Remove POSTGRES_URL validation line) ---
  const configModuleFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/config/config.module.ts"),
  );
  const postgresUrlProperty = configModuleFile
    .getDescendantsOfKind(SyntaxKind.PropertyAssignment)
    .find((p) => p.getName() === "POSTGRES_URL");
  if (postgresUrlProperty) {
    postgresUrlProperty.remove();
  }

  // --- Clean app-config.service.ts (Remove postgresUrl getter) ---
  const configServiceFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/config/app-config.service.ts"),
  );
  const configServiceClass =
    configServiceFile.getClassOrThrow("AppConfigService");
  const dbUrlGetter = configServiceClass.getGetAccessor("postgresUrl");
  if (dbUrlGetter) {
    dbUrlGetter.remove();
  }

  await project.save();
  console.log("  └─ TS source files scrubbed of Postgres references.");

  // 4. Surgical Docker Compose Pruning
  const dockerComposePath = path.join(projectRoot, "docker-compose.yml");
  if (await pathExists(dockerComposePath)) {
    const fileContent = await readFile(dockerComposePath, "utf8");
    const composeDoc = YAML.parseDocument(fileContent);

    // Safely delete postgres service block
    if (composeDoc.hasIn(["services", "postgres"])) {
      composeDoc.deleteIn(["services", "postgres"]);
    }

    // Safely delete associated postgres volume block
    if (composeDoc.hasIn(["volumes", "pgdata"])) {
      composeDoc.deleteIn(["volumes", "pgdata"]);
    }

    // If no services are left in the docker-compose file, delete the file entirely
    const services = composeDoc.get("services") as YAML.YAMLMap;
    if (!services || services.items.length === 0) {
      await remove(dockerComposePath);
      console.log("  └─ Docker-compose.yml emptied and deleted.");
    } else {
      await writeFile(dockerComposePath, composeDoc.toString(), "utf8");
      console.log(
        "  └─ Removed postgres container configurations from docker-compose.yml",
      );
    }
  }
}
