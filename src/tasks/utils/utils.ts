import * as path from "path";
import fsExtra from "fs-extra";
import * as YAML from "yaml";
import {
  ObjectLiteralExpression,
  Project,
  SyntaxKind,
  type SourceFile,
} from "ts-morph";

const { pathExists, readJson, writeJson, readFile, writeFile } = fsExtra;

/**
 * Safely removes a list of dependencies from package.json
 */
export async function pruneDependencies(
  projectRoot: string,
  dependencies: string[],
) {
  const pkgPath = path.join(projectRoot, "package.json");
  if (await pathExists(pkgPath)) {
    const pkg = await readJson(pkgPath);
    dependencies.forEach((dep) => {
      delete pkg.dependencies?.[dep];
      delete pkg.devDependencies?.[dep]; // Cleans up types if they are in devDeps
    });
    await writeJson(pkgPath, pkg, { spaces: 2 });
    console.log(`  └─ Removed dependencies: [${dependencies.join(", ")}]`);
  }
}

/**
 * Removes a list of npm scripts from package.json
 */
export async function pruneScripts(projectRoot: string, scripts: string[]) {
  const pkgPath = path.join(projectRoot, "package.json");
  if (await pathExists(pkgPath)) {
    const pkg = await readJson(pkgPath);
    scripts.forEach((script) => {
      delete pkg.scripts?.[script];
    });
    await writeJson(pkgPath, pkg, { spaces: 2 });
    console.log(`  └─ Removed scripts: [${scripts.join(", ")}]`);
  }
}

/**
 * Scrubs specific environment variable keys from both .env and .env.example
 */
export async function pruneEnvKeys(projectRoot: string, keys: string[]) {
  const envFiles = [".env", ".env.example"];
  for (const file of envFiles) {
    const envPath = path.join(projectRoot, file);
    if (await pathExists(envPath)) {
      const content = await readFile(envPath, "utf8");
      const cleanLines = content
        .split(/\r?\n/)
        .filter((line) => !keys.some((key) => line.startsWith(`${key}=`)));

      await writeFile(envPath, cleanLines.join("\n"), "utf8");
      console.log(`  └─ Scrubbed keys [${keys.join(", ")}] from ${file}`);
    }
  }
}

/**
 * Safely removes specific services and volumes from docker-compose.yml
 */
export async function pruneDockerCompose(
  projectRoot: string,
  options: { services?: string[]; volumes?: string[] },
) {
  const dockerComposePath = path.join(projectRoot, "docker-compose.yml");
  if (await pathExists(dockerComposePath)) {
    const fileContent = await readFile(dockerComposePath, "utf8");
    const composeDoc = YAML.parseDocument(fileContent);

    options.services?.forEach((service) => {
      if (composeDoc.hasIn(["services", service])) {
        composeDoc.deleteIn(["services", service]);
      }
    });

    options.volumes?.forEach((volume) => {
      if (composeDoc.hasIn(["volumes", volume])) {
        composeDoc.deleteIn(["volumes", volume]);
      }
    });

    await writeFile(dockerComposePath, composeDoc.toString(), "utf8");
    console.log(`  └─ Updated docker-compose.yml (removed services/volumes)`);
  }
}

/**
 * Rips an explicit import statement out of a file by its module name path
 */
export function removeImportBySpecifier(
  sourceFile: SourceFile,
  specifier: string,
) {
  const importDecl = sourceFile.getImportDeclaration(specifier);
  if (importDecl) importDecl.remove();
}

/**
 * Removes a specific module class from a NestJS class @Module({ imports: [...] }) array
 */
export function removeNestModuleImport(
  sourceFile: SourceFile,
  className: string,
  moduleName: string,
) {
  const args = getDecoratorArgs(sourceFile, className, "Module");
  removeElementFromDecoratorArray(args, "imports", moduleName, false);
}

/**
 * Traverses an entire file recursively and deletes any property assignment keys matching the provided list
 */
export function removePropertyAssignmentsByNames(
  sourceFile: SourceFile,
  propertyNames: string[],
) {
  for (const name of propertyNames) {
    const property = sourceFile
      .getDescendantsOfKind(SyntaxKind.PropertyAssignment)
      .find((p) => p.getName() === name);

    if (property) {
      property.remove();
    }
  }
}

/**
 * Removes a specific 'get method()' accessor from a given target class name
 */
export function removeClassGetter(
  sourceFile: SourceFile,
  className: string,
  getterName: string,
) {
  const targetClass = sourceFile.getClass(className);
  const getter = targetClass?.getGetAccessor(getterName);
  if (getter) getter.remove();
}

/**
 * Updates the 'useClass' value inside a specific provider declaration token block.
 */
export function updateProviderUseClass(
  sourceFile: SourceFile,
  providerName: string,
  targetClassName: string,
): void {
  const providerVar = sourceFile.getVariableDeclaration(providerName);
  if (providerVar) {
    const initializer = providerVar.getInitializerIfKind(
      SyntaxKind.ObjectLiteralExpression,
    );
    const useClassProp = initializer?.getProperty("useClass");
    if (useClassProp && useClassProp.isKind(SyntaxKind.PropertyAssignment)) {
      useClassProp.setInitializer(targetClassName);
    }
  }
}

/**
 * Gets the argument configuration object from a NestJS class decorator (e.g., @Module).
 */
export function getDecoratorArgs(
  sourceFile: SourceFile,
  className: string,
  decoratorName: string,
): ObjectLiteralExpression {
  const targetClass = sourceFile.getClassOrThrow(className);
  const decorator = targetClass.getDecoratorOrThrow(decoratorName);
  // @ts-ignore
  return decorator
    .getArguments()[0]
    .asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
}

/**
 * Removes an element from a specific array property matching a specific text search substring.
 */
export function removeElementFromDecoratorArray(
  decoratorArgs: ObjectLiteralExpression,
  propertyName: "imports" | "providers" | "controllers" | "exports",
  searchSubstring: string,
  exactMatch = false,
): void {
  const prop = decoratorArgs
    .getProperty(propertyName)
    ?.asKindOrThrow(SyntaxKind.PropertyAssignment);
  const array = prop
    ?.getInitializer()
    ?.asKindOrThrow(SyntaxKind.ArrayLiteralExpression);

  const elementToRemove = array?.getElements().find((el) => {
    const text = el.getText();
    return exactMatch
      ? text === searchSubstring
      : text.includes(searchSubstring);
  });

  if (elementToRemove) {
    array?.removeElement(elementToRemove);
  }
}

export async function registerModuleWithApp(
  projectRoot: string,
  moduleClassName: string,
  importPath: string,
): Promise<void> {
  const project = new Project();
  const appModulePath = path.join(projectRoot, "src/app.module.ts");
  const sourceFile = project.addSourceFileAtPath(appModulePath);

  const existingImport = sourceFile.getImportDeclaration(
    (imp) => imp.getModuleSpecifierValue() === importPath,
  );

  if (!existingImport) {
    sourceFile.addImportDeclaration({
      namedImports: [moduleClassName],
      moduleSpecifier: importPath,
    });
  }

  const moduleArgs = getDecoratorArgs(sourceFile, "AppModule", "Module");
  const importsProp = moduleArgs
    .getProperty("imports")
    ?.asKindOrThrow(SyntaxKind.PropertyAssignment);
  const importsArray = importsProp
    ?.getInitializer()
    ?.asKindOrThrow(SyntaxKind.ArrayLiteralExpression);

  const alreadyImported = importsArray
    ?.getElements()
    .some((el) => el.getText() === moduleClassName);

  if (!alreadyImported) {
    importsArray?.addElement(moduleClassName);
  }

  sourceFile.formatText();
  await project.save();
  console.log(`  └─ Registered ${moduleClassName} inside app.module.ts`);
}
