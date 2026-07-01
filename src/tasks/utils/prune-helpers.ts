import * as path from "path";
import fsExtra from "fs-extra";
import * as YAML from "yaml";
import { SyntaxKind, type SourceFile } from "ts-morph";

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
  const targetClass = sourceFile.getClass(className);
  const decorator = targetClass?.getDecorator("Module");
  if (!decorator) return;

  const decoratorArg = decorator
    .getArguments()[0]
    ?.asKind(SyntaxKind.ObjectLiteralExpression);
  const importsProperty = decoratorArg
    ?.getProperty("imports")
    ?.asKind(SyntaxKind.PropertyAssignment);
  const importsArray = importsProperty?.getInitializerIfKind(
    SyntaxKind.ArrayLiteralExpression,
  );

  if (importsArray) {
    importsArray.getElements().forEach((element) => {
      if (element.getText() === moduleName) {
        importsArray.removeElement(element);
      }
    });
  }
}

/**
 * Traverses an entire file recursively and deletes any property assignment key (e.g. MONGO_URI: Joi...)
 */
export function removePropertyAssignmentByName(
  sourceFile: SourceFile,
  propertyName: string,
) {
  const property = sourceFile
    .getDescendantsOfKind(SyntaxKind.PropertyAssignment)
    .find((p) => p.getName() === propertyName);
  if (property) property.remove();
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
