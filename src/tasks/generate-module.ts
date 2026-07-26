import * as path from "path";
import { fileURLToPath } from "url";
import fsExtra from "fs-extra";
import { registerModuleWithApp } from "./utils/utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { ensureDir, readFile, writeFile } = fsExtra;

function pluralize(word: string): string {
  if (/[^aeiou]y$/i.test(word)) {
    return word.slice(0, -1) + "ies";
  }
  if (/(s|x|z|ch|sh)$/i.test(word)) {
    return word + "es";
  }
  return word + "s";
}

function getNames(name: string) {
  const words = name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);

  const pascal = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
  const camel = pascal.charAt(0).toLowerCase() + pascal.slice(1);
  const kebab = words.map((w) => w.toLowerCase()).join("-");

  return {
    kebab,
    pascal,
    camel,
    pluralKebab: pluralize(kebab),
    pluralPascal: pluralize(pascal),
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
    [path.join(templateBase, "domain", "error.tmpl.ts")]: path.join(
      targetDir,
      "domain",
      "errors",
      `${names.kebab}-not-found.error.ts`,
    ),
    [path.join(templateBase, "application", "service.port.tmpl.ts")]: path.join(
      targetDir,
      "application",
      "ports",
      `${names.kebab}-service.port.ts`,
    ),
    [path.join(templateBase, "application", "create-command.tmpl.ts")]:
      path.join(
        targetDir,
        "application",
        "dto",
        `create-${names.kebab}.command.ts`,
      ),
    [path.join(templateBase, "application", "service.tmpl.ts")]: path.join(
      targetDir,
      "application",
      `${names.kebab}.service.ts`,
    ),
    [path.join(templateBase, "application", "service.spec.tmpl.ts")]: path.join(
      targetDir,
      "application",
      `${names.kebab}.service.spec.ts`,
    ),
    // Infrastructure — HTTP layer
    [path.join(templateBase, "infrastructure", "http", "controller.tmpl.ts")]:
      path.join(
        targetDir,
        "infrastructure",
        "http",
        `${names.pluralKebab}.controller.ts`,
      ),
    [path.join(
      templateBase,
      "infrastructure",
      "http",
      "dto",
      "create-request.tmpl.ts",
    )]: path.join(
      targetDir,
      "infrastructure",
      "http",
      "dto",
      `create-${names.kebab}.request.dto.ts`,
    ),
    [path.join(
      templateBase,
      "infrastructure",
      "http",
      "dto",
      "response.tmpl.ts",
    )]: path.join(
      targetDir,
      "infrastructure",
      "http",
      "dto",
      `${names.kebab}.response.dto.ts`,
    ),
  };

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

  for (const [tmplPath, destPath] of Object.entries(fileMappings)) {
    const compiled = await compileTemplate(tmplPath, tokens);
    await ensureDir(path.dirname(destPath));
    await writeFile(destPath, compiled, "utf8");
  }

  await registerModuleWithApp(
    projectRoot,
    `${names.pluralPascal}Module`,
    `./${names.pluralKebab}/${names.pluralKebab}.module`,
  );

  console.log(
    ` ✨ Architectural module generation for ${names.pascal} complete.`,
  );
}
