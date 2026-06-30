import * as path from "path";
import { Project, SyntaxKind } from "ts-morph";
import fsExtra from "fs-extra";
import * as YAML from "yaml";

export async function pruneMongoDatabase(projectRoot: string) {
  console.log("✂️  Starting isolated MongoDB pruning operation...");

  const { pathExists, readJson, writeJson, remove, readFile, writeFile } =
    fsExtra;

  const envKeysToRemove = ["MONGO_URI"];

  // 1. Remove MongoDB-specific dependencies from package.json
  const pkgPath = path.join(projectRoot, "package.json");
  if (await pathExists(pkgPath)) {
    const pkg = await readJson(pkgPath);
    delete pkg.dependencies["@nestjs/mongoose"];
    delete pkg.dependencies["mongoose"];
    await writeJson(pkgPath, pkg, { spaces: 2 });
    console.log("  └─ Removed MongoDB dependencies from package.json");
  }

  // 2. Remove only the MongoDB module file
  await remove(path.join(projectRoot, "src/database/mongo.module.ts"));
  console.log("  └─ Deleted mongo.module.ts");

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
      console.log(`  └─ Scrubbed MongoDB keys from ${file}`);
    }
  }

  // 4. Surgical AST Adjustments
  const project = new Project();

  // --- Clean app.module.ts ---
  const appModuleFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/app.module.ts"),
  );
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

  importsArray.getElements().forEach((element) => {
    if (element.getText() === "MongoModule") {
      importsArray.removeElement(element);
    }
  });

  // --- Clean config.module.ts (Remove MONGO_URI validation line) ---
  const configModuleFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/config/config.module.ts"),
  );
  const mongoUriProperty = configModuleFile
    .getDescendantsOfKind(SyntaxKind.PropertyAssignment)
    .find((p) => p.getName() === "MONGO_URI");
  if (mongoUriProperty) {
    mongoUriProperty.remove();
  }

  // --- Clean app-config.service.ts (Remove mongoUri getter) ---
  const configServiceFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/config/app-config.service.ts"),
  );
  const configServiceClass =
    configServiceFile.getClassOrThrow("AppConfigService");
  const mongoGetter = configServiceClass.getGetAccessor("mongoUri");
  if (mongoGetter) {
    mongoGetter.remove();
  }

  await project.save();
  console.log("  └─ TS source files scrubbed of MongoDB references.");

  // 5. Clean Docker Compose Architecture
  const dockerComposePath = path.join(projectRoot, "docker-compose.yml");
  if (await pathExists(dockerComposePath)) {
    const fileContent = await readFile(dockerComposePath, "utf8");
    const composeDoc = YAML.parseDocument(fileContent);

    // Wipe out the mongodb service block
    if (composeDoc.hasIn(["services", "mongodb"])) {
      composeDoc.deleteIn(["services", "mongodb"]);
    }

    // Wipe out the associated mongodata volume block
    if (composeDoc.hasIn(["volumes", "mongodata"])) {
      composeDoc.deleteIn(["volumes", "mongodata"]);
    }

    // Write back the updated compose doc (keeping postgres and backend intact)
    await writeFile(dockerComposePath, composeDoc.toString(), "utf8");
    console.log(
      "  └─ Removed mongodb container configurations from docker-compose.yml",
    );
  }
}
