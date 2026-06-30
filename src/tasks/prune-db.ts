import * as path from "path";
import { Project, SyntaxKind } from "ts-morph";
import fsExtra from "fs-extra";
import * as YAML from "yaml";

export async function pruneDatabase(projectRoot: string) {
  console.log(
    "✂️  Starting complete database wipe operation (None selected)...",
  );

  const { pathExists, readJson, writeJson, remove, readFile, writeFile } =
    fsExtra;

  const envKeysToRemove = ["POSTGRES_URL", "MONGO_URI"];

  // 1. Clean package.json Dependencies
  const pkgPath = path.join(projectRoot, "package.json");
  if (await pathExists(pkgPath)) {
    const pkg = await readJson(pkgPath);

    // Postgres Packages
    delete pkg.dependencies["@nestjs/typeorm"];
    delete pkg.dependencies["typeorm"];
    delete pkg.dependencies["pg"];

    // Mongo Packages
    delete pkg.dependencies["@nestjs/mongoose"];
    delete pkg.dependencies["mongoose"];

    await writeJson(pkgPath, pkg, { spaces: 2 });
    console.log("  └─ Removed all database dependencies from package.json");
  }

  // 2. Delete the entire database modules directory
  await remove(path.join(projectRoot, "src/database"));
  console.log("  └─ Deleted src/database folder entirely");

  // 3. Clean Environment Files (.env and .env.example)
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
      console.log(`  └─ Scrubbed database keys from ${file}`);
    }
  }

  // 4. Surgical AST Modifications
  const project = new Project();

  // --- Clean app.module.ts ---
  const appModuleFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/app.module.ts"),
  );

  // Remove imports safely
  const pgImport = appModuleFile.getImportDeclaration(
    "./database/postgres.module",
  );
  if (pgImport) pgImport.remove();
  const mongoImport = appModuleFile.getImportDeclaration(
    "./database/mongo.module",
  );
  if (mongoImport) mongoImport.remove();

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

  // Filter out both modules from the NestJS imports array
  importsArray.getElements().forEach((element) => {
    const text = element.getText();
    if (text === "PostgresModule" || text === "MongoModule") {
      importsArray.removeElement(element);
    }
  });

  // --- Clean config.module.ts (Remove Joi Validation Properties) ---
  const configModuleFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/config/config.module.ts"),
  );
  envKeysToRemove.forEach((key) => {
    const property = configModuleFile
      .getDescendantsOfKind(SyntaxKind.PropertyAssignment)
      .find((p) => p.getName() === key);
    if (property) property.remove();
  });

  // --- Clean app-config.service.ts (Remove Getters) ---
  const configServiceFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/config/app-config.service.ts"),
  );
  const configServiceClass =
    configServiceFile.getClassOrThrow("AppConfigService");

  const pgGetter = configServiceClass.getGetAccessor("postgresUrl");
  if (pgGetter) pgGetter.remove();

  const mongoGetter = configServiceClass.getGetAccessor("mongoUri");
  if (mongoGetter) mongoGetter.remove();

  // Save all AST changes
  await project.save();
  console.log("  └─ TS source files completely scrubbed.");

  // 5. Clean Docker Compose Architecture
  const dockerComposePath = path.join(projectRoot, "docker-compose.yml");
  if (await pathExists(dockerComposePath)) {
    const fileContent = await readFile(dockerComposePath, "utf8");
    const composeDoc = YAML.parseDocument(fileContent);

    // Wipe out the database blocks from services
    if (composeDoc.hasIn(["services", "postgres"]))
      composeDoc.deleteIn(["services", "postgres"]);
    if (composeDoc.hasIn(["services", "mongodb"]))
      composeDoc.deleteIn(["services", "mongodb"]);

    // Wipe out the database volumes
    if (composeDoc.hasIn(["volumes", "pgdata"]))
      composeDoc.deleteIn(["volumes", "pgdata"]);
    if (composeDoc.hasIn(["volumes", "mongodata"]))
      composeDoc.deleteIn(["volumes", "mongodata"]);

    // Evaluate remaining configuration state
    const services = composeDoc.get("services") as YAML.YAMLMap;
    if (!services || services.items.length === 0) {
      await remove(dockerComposePath);
      console.log("  └─ docker-compose.yml is now empty, file deleted.");
    } else {
      await writeFile(dockerComposePath, composeDoc.toString(), "utf8");
      console.log(
        "  └─ Removed database service configurations from docker-compose.yml",
      );
    }
  }
}
