import * as path from "path";
import { fileURLToPath } from "url"; // Add this native import
import fsExtra from "fs-extra";
import { registerModuleWithApp } from "./utils/utils";

// Recreate __dirname cleanly for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { ensureDir, readFile, writeFile } = fsExtra;

// ... rest of your code remains exactly the same ...

function getNames(name: string) {
  const kebab = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const pascal = name.charAt(0).toUpperCase() + name.slice(1);
  const camel = name.charAt(0).toLowerCase() + name.slice(1);
  return {
    kebab,
    pascal,
    camel,
    pluralKebab: `${kebab}s`,
    pluralPascal: `${pascal}s`,
  };
}

async function compileTemplate(
  templatePath: string,
  replacements: Record<string, string>,
): Promise<string> {
  let content = await readFile(templatePath, "utf8");
  for (const [key, value] of Object.entries(replacements)) {
    const placeholder = `__${key.toUpperCase()}__`;
    content = content.split(placeholder).join(value);
  }
  return content;
}

export async function generateFeature(
  projectRoot: string,
  featureName: string,
  database: "postgres" | "mongo",
) {
  const names = getNames(featureName);
  const targetDir = path.join(projectRoot, "src", names.pluralKebab);
  const templateBase = path.join(__dirname, "templates");

  console.log(
    `🚀 Provisioning Hexagonal [${names.pascal}] engine components for ${database}...`,
  );

  const tokens = {
    kebab_name: names.kebab,
    pascal_name: names.pascal,
    camel_name: names.camel,
    plural_kebab: names.pluralKebab,
    plural_pascal: names.pluralPascal,
  };

  // 1. Shared core domain blueprint maps
  const fileMappings: Record<string, string> = {
    [path.join(templateBase, "domain", "model.tmpl.ts")]: path.join(
      targetDir,
      "domain",
      "models",
      `${names.kebab}.model.ts`,
    ),
    [path.join(templateBase, "domain", "port.tmpl.ts")]: path.join(
      targetDir,
      "domain",
      "ports",
      `${names.kebab}-repository.port.ts`,
    ),
    [path.join(templateBase, "infrastructure", "http", "controller.tmpl.ts")]:
      path.join(
        targetDir,
        "infrastructure",
        "http",
        `${names.pluralKebab}.controller.ts`,
      ),
  };

  // 2. Database infrastructure layer map assignments
  if (database === "postgres") {
    fileMappings[
      path.join(
        templateBase,
        "infrastructure",
        "persistence",
        "postgres",
        "entity.tmpl.ts",
      )
    ] = path.join(
      targetDir,
      "infrastructure",
      "persistence",
      "postgres",
      `${names.kebab}.entity.ts`,
    );
    fileMappings[
      path.join(
        templateBase,
        "infrastructure",
        "persistence",
        "postgres",
        "mapper.tmpl.ts",
      )
    ] = path.join(
      targetDir,
      "infrastructure",
      "persistence",
      "postgres",
      `${names.kebab}.mapper.ts`,
    );
    fileMappings[
      path.join(
        templateBase,
        "infrastructure",
        "persistence",
        "postgres",
        "repository.tmpl.ts",
      )
    ] = path.join(
      targetDir,
      "infrastructure",
      "persistence",
      "postgres",
      `postgres-${names.kebab}.repository.ts`,
    );
    fileMappings[path.join(templateBase, "module-postgres.tmpl.ts")] =
      path.join(targetDir, `${names.pluralKebab}.module.ts`);
  } else {
    fileMappings[
      path.join(
        templateBase,
        "infrastructure",
        "persistence",
        "mongo",
        "schema.tmpl.ts",
      )
    ] = path.join(
      targetDir,
      "infrastructure",
      "persistence",
      "mongo",
      `${names.kebab}.schema.ts`,
    );
    fileMappings[
      path.join(
        templateBase,
        "infrastructure",
        "persistence",
        "mongo",
        "mapper.tmpl.ts",
      )
    ] = path.join(
      targetDir,
      "infrastructure",
      "persistence",
      "mongo",
      `${names.kebab}.mapper.ts`,
    );
    fileMappings[
      path.join(
        templateBase,
        "infrastructure",
        "persistence",
        "mongo",
        "repository.tmpl.ts",
      )
    ] = path.join(
      targetDir,
      "infrastructure",
      "persistence",
      "mongo",
      `mongo-${names.kebab}.repository.ts`,
    );
    fileMappings[path.join(templateBase, "module-mongo.tmpl.ts")] = path.join(
      targetDir,
      `${names.pluralKebab}.module.ts`,
    );
  }

  // 3. Sequential file processing compilation loop
  for (const [tmplPath, destPath] of Object.entries(fileMappings)) {
    const compiled = await compileTemplate(tmplPath, tokens);
    await ensureDir(path.dirname(destPath));
    await writeFile(destPath, compiled, "utf8");
  }

  // 4. Connect the output structure cleanly back to your central core architecture
  await registerModuleWithApp(
    projectRoot,
    `${names.pluralPascal}Module`,
    `./${names.pluralKebab}/${names.pluralKebab}.module`,
  );

  console.log(
    ` ✨ Architectural module generation for ${names.pascal} complete.`,
  );
}
