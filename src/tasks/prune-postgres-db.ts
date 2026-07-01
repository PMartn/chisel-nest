import * as path from "path";
import { Project, SyntaxKind } from "ts-morph";
import fsExtra from "fs-extra";
import * as YAML from "yaml";

export async function prunePostgresDatabase(projectRoot: string) {
  console.log("✂️  Starting isolated Postgres database pruning operation...");

  const { pathExists, readJson, writeJson, remove, readFile, writeFile } =
    fsExtra;

  const envKeysToRemove = ["POSTGRES_URL"];

  const pkgPath = path.join(projectRoot, "package.json");
  if (await pathExists(pkgPath)) {
    const pkg = await readJson(pkgPath);
    delete pkg.dependencies["@nestjs/typeorm"];
    delete pkg.dependencies["typeorm"];
    delete pkg.dependencies["pg"];
    await writeJson(pkgPath, pkg, { spaces: 2 });
    console.log("  └─ Removed Postgres dependencies from package.json");
  }

  await remove(path.join(projectRoot, "src/database/postgres.module.ts"));
  console.log("  └─ Deleted postgres.module.ts");

  const envFiles = [".env", ".env.example"];
  for (const file of envFiles) {
    const envPath = path.join(projectRoot, file);
    if (await pathExists(envPath)) {
      const content = await readFile(envPath, "utf8");
      const cleanLines = content
        .split(/\r?\n/)
        .filter(
          (line) => !envKeysToRemove.some((key) => line.startsWith(`${key}=`)),
        );

      await writeFile(envPath, cleanLines.join("\n"), "utf8");
      console.log(`  └─ Scrubbed Postgres keys from ${file}`);
    }
  }

  const project = new Project();

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

  const configModuleFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/config/config.module.ts"),
  );
  const postgresUrlProperty = configModuleFile
    .getDescendantsOfKind(SyntaxKind.PropertyAssignment)
    .find((p) => p.getName() === "POSTGRES_URL");
  if (postgresUrlProperty) {
    postgresUrlProperty.remove();
  }

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

  const dockerComposePath = path.join(projectRoot, "docker-compose.yml");
  if (await pathExists(dockerComposePath)) {
    const fileContent = await readFile(dockerComposePath, "utf8");
    const composeDoc = YAML.parseDocument(fileContent);

    if (composeDoc.hasIn(["services", "postgres"])) {
      composeDoc.deleteIn(["services", "postgres"]);
    }

    if (composeDoc.hasIn(["volumes", "pgdata"])) {
      composeDoc.deleteIn(["volumes", "pgdata"]);
    }

    await writeFile(dockerComposePath, composeDoc.toString(), "utf8");
    console.log(
      "  └─ Removed postgres container configurations from docker-compose.yml",
    );
  }
}
