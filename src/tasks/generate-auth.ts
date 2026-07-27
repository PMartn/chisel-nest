import * as path from "path";
import fsExtra from "fs-extra";
import { fileURLToPath } from "url";
import { Project, SyntaxKind } from "ts-morph";
import {
  registerModuleWithApp,
  addDependencies,
  addEnvKeys,
  addElementToDecoratorArray,
  getDecoratorArgs,
} from "./utils/utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { copy } = fsExtra;

export type AuthProvider = "local" | "auth0" | "keycloak" | "clerk";

/**
 * Exposes the UserRepository from the Users module so the Auth module's service
 * can read/write credentials on the user record.
 */
async function exportUserRepository(projectRoot: string) {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/users/users.module.ts"),
  );
  const moduleArgs = getDecoratorArgs(sourceFile, "UsersModule", "Module");
  addElementToDecoratorArray(moduleArgs, "exports", "UserRepository");
  await project.save();
}

/**
 * Adds JWT_SECRET / JWT_EXPIRES_IN to the Joi validation schema in config.module.
 */
async function addJwtConfigValidation(projectRoot: string) {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/config/config.module.ts"),
  );

  const joiObject = sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .find((call) => call.getExpression().getText() === "Joi.object")
    ?.getArguments()[0]
    ?.asKind(SyntaxKind.ObjectLiteralExpression);

  if (joiObject && !joiObject.getProperty("JWT_SECRET")) {
    joiObject.addPropertyAssignment({
      name: "JWT_SECRET",
      initializer: "Joi.string().required()",
    });
    joiObject.addPropertyAssignment({
      name: "JWT_EXPIRES_IN",
      initializer: "Joi.string().default('1d')",
    });
    sourceFile.formatText();
    await project.save();
  }
}

/**
 * Provisions authentication + role-based access. Copies the shared auth
 * infrastructure and the chosen provider's adapter, upgrades the Users module's
 * persistence with credential/role fields, and wires everything together.
 */
export async function generateAuth(
  projectRoot: string,
  provider: AuthProvider,
  usersDatabase: "postgres" | "mongo",
) {
  console.log(`🔐 Provisioning ${provider} authentication...`);

  const templateBase = path.join(__dirname, "templates", "auth");
  const authDir = path.join(projectRoot, "src", "auth");

  await copy(path.join(templateBase, "common"), authDir);
  await copy(path.join(templateBase, provider), authDir);

  const usersDir = path.join(projectRoot, "src", "users");
  await copy(
    path.join(templateBase, "users", "user.model.ts"),
    path.join(usersDir, "domain", "models", "user.model.ts"),
  );
  const persistence = path.join(usersDir, "infrastructure", "persistence");
  if (usersDatabase === "postgres") {
    await copy(
      path.join(templateBase, "users", "postgres", "user.entity.ts"),
      path.join(persistence, "postgres", "user.entity.ts"),
    );
    await copy(
      path.join(templateBase, "users", "postgres", "user.mapper.ts"),
      path.join(persistence, "postgres", "user.mapper.ts"),
    );
  } else {
    await copy(
      path.join(templateBase, "users", "mongo", "user.schema.ts"),
      path.join(persistence, "mongo", "user.schema.ts"),
    );
    await copy(
      path.join(templateBase, "users", "mongo", "user.mapper.ts"),
      path.join(persistence, "mongo", "user.mapper.ts"),
    );
  }

  await registerModuleWithApp(projectRoot, "AuthModule", "./auth/auth.module");
  await exportUserRepository(projectRoot);

  await addDependencies(
    projectRoot,
    { "@nestjs/jwt": "^11.0.0", bcryptjs: "^2.4.3" },
    { "@types/bcryptjs": "^2.4.6" },
  );
  await addEnvKeys(projectRoot, {
    JWT_SECRET: "change_me_in_production",
    JWT_EXPIRES_IN: "1d",
  });
  await addJwtConfigValidation(projectRoot);

  console.log(`  └─ Authentication provisioned with global role guards.`);
}
