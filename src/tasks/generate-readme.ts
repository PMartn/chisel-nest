import * as path from "path";
import fsExtra from "fs-extra";
import type { GeneratorAnswers } from "../shared/types";

const { writeFile } = fsExtra;

const dbLabel = (db: "postgres" | "mongo"): string =>
  db === "postgres" ? "PostgreSQL" : "MongoDB";

/**
 * Writes a README.md tailored to the generated project: its chosen name and
 * only the sections relevant to the features that were selected.
 */
export async function generateReadme(
  projectRoot: string,
  answers: GeneratorAnswers,
) {
  const {
    projectName,
    postgresEnabled,
    mongoEnabled,
    usersModuleDatabase,
    authProvider,
    modules,
    usePinoLogger,
    useHelmet,
    useRateLimiting,
  } = answers;

  const anyDatabase = postgresEnabled || mongoEnabled;
  const bothDatabases = postgresEnabled && mongoEnabled;
  const authEnabled = authProvider !== "none";
  const featureModules = modules.filter((m) => m.name.trim());
  const hasModules = usersModuleDatabase !== "none" || featureModules.length > 0;

  const sections: string[] = [];

  sections.push(
    `# ${projectName}\n\n` +
      "A NestJS backend organized around " +
      "[hexagonal (ports & adapters) architecture](https://alistair.cockburn.us/hexagonal-architecture/): " +
      "a clean separation between the domain, application, and infrastructure layers.",
  );

  const features = [
    "Hexagonal architecture (domain / application / infrastructure)",
  ];
  if (postgresEnabled) features.push("PostgreSQL persistence via **TypeORM**");
  if (mongoEnabled) features.push("MongoDB persistence via **Mongoose**");
  features.push("Interactive API documentation with **Swagger**");
  features.push("Request validation with **class-validator**");
  features.push("Environment validation with **Joi**");
  if (authEnabled) {
    features.push("Authentication & role-based access (**Local JWT**)");
  }
  if (usePinoLogger) features.push("Structured logging with **Pino**");
  if (useHelmet) features.push("Secure HTTP headers via **Helmet**");
  if (useRateLimiting) features.push("Rate limiting");
  sections.push(`## Features\n\n${features.map((f) => `- ${f}`).join("\n")}`);

  const gettingStarted = ["## Getting started"];
  gettingStarted.push(
    "### Prerequisites\n\n- Node.js 20+" +
      (anyDatabase
        ? `\n- Docker (to run the database${bothDatabases ? "s" : ""} locally)`
        : ""),
  );
  gettingStarted.push(
    "### Install\n\n```bash\nnpm install\n```\n\n" +
      "A `.env` with local development defaults is included. Review and adjust it before running.",
  );
  if (anyDatabase) {
    gettingStarted.push(
      `### Start the database${bothDatabases ? "s" : ""}\n\n` +
        "```bash\ndocker compose up -d\n```",
    );
  }
  if (postgresEnabled) {
    gettingStarted.push(
      "### Create the initial schema\n\n" +
        "Generate the first migration from your entities. The app applies pending migrations on startup:\n\n" +
        "```bash\nnpm run migration:generate -- ./src/database/migrations/InitSchema\n```",
    );
  }
  gettingStarted.push(
    "### Run\n\n" +
      "```bash\n# watch mode\nnpm run start:dev\n\n# production build\nnpm run build\nnpm run start:prod\n```\n\n" +
      "The API listens on `http://localhost:3000` (set `PORT` to change it). " +
      "Swagger UI is available at `http://localhost:3000/docs` outside production.",
  );
  sections.push(gettingStarted.join("\n\n"));

  if (hasModules) {
    const parts: string[] = [];
    if (usersModuleDatabase !== "none") {
      parts.push(
        `### Users\n\nA ready-made Users module backed by **${dbLabel(
          usersModuleDatabase,
        )}**, exposing REST endpoints under \`/users\`.`,
      );
    }
    if (featureModules.length > 0) {
      const list = featureModules
        .map((m) => `- **${m.name}** — ${dbLabel(m.database)}`)
        .join("\n");
      parts.push(
        "### Feature modules\n\n" +
          "Each follows the same hexagonal structure and exposes REST endpoints.\n\n" +
          list,
      );
    }
    sections.push(`## Modules\n\n${parts.join("\n\n")}`);
  }

  if (authEnabled) {
    sections.push(
      "## Authentication\n\n" +
        "Authentication uses **Local JWT** (email & password) with role-based access. " +
        "Users have a `user` or `admin` role, and access control is **secure by default**. " +
        "every route requires a valid bearer token except the ones below.\n\n" +
        "| Endpoint | Description |\n| --- | --- |\n" +
        "| `POST /auth/register` | Create an account, returns a JWT (public) |\n" +
        "| `POST /auth/login` | Exchange credentials for a JWT (public) |\n" +
        "| `GET /auth/me` | The current authenticated user |\n\n" +
        "Protect your own routes with the guards' decorators: `@Public()` to open a " +
        "route, `@Roles(Role.ADMIN)` to restrict one, and `@CurrentUser()` to read the " +
        "principal. Set a strong `JWT_SECRET` before deploying.\n\n" +
        "In Swagger (`/docs`) protected endpoints show a lock. click **Authorize**, " +
        "paste a token from `/auth/login`, and try them out.",
    );
  }

  if (anyDatabase) {
    const parts: string[] = [];
    if (postgresEnabled) {
      parts.push(
        "### PostgreSQL & migrations\n\n" +
          "The schema is managed with TypeORM **migrations**, so it stays explicit and versioned. " +
          "Generate your first migration from the entities, then apply it:\n\n" +
          "```bash\nnpm run migration:generate -- ./src/database/migrations/InitSchema\nnpm run migration:run\n```\n\n" +
          "Pending migrations are also applied automatically on startup. The connection is configured in `src/database/data-source.ts`.",
      );
    }
    if (mongoEnabled) {
      parts.push(
        "### MongoDB\n\n" +
          "Document shapes and indexes are defined on the Mongoose schemas.",
      );
    }
    sections.push(`## Database\n\n${parts.join("\n\n")}`);
  }

  const envRows = [
    "| `PORT` | Port the API listens on (default `3000`) |",
    "| `NODE_ENV` | `development`, `production`, or `test` |",
  ];
  if (postgresEnabled) {
    envRows.push(
      "| `POSTGRES_HOST` | PostgreSQL host |",
      "| `POSTGRES_PORT` | PostgreSQL port |",
      "| `POSTGRES_USER` | PostgreSQL user |",
      "| `POSTGRES_PASSWORD` | PostgreSQL password |",
      "| `POSTGRES_DB` | PostgreSQL database name |",
    );
  }
  if (mongoEnabled) {
    envRows.push(
      "| `MONGO_HOST` | MongoDB host |",
      "| `MONGO_PORT` | MongoDB port |",
      "| `MONGO_ROOT_USER` | MongoDB user |",
      "| `MONGO_ROOT_PASSWORD` | MongoDB password |",
      "| `MONGO_DB` | MongoDB database name |",
    );
  }
  if (authEnabled) {
    envRows.push(
      "| `JWT_SECRET` | Secret used to sign JWTs (change in production) |",
      "| `JWT_EXPIRES_IN` | Token lifetime, e.g. `1d` |",
    );
  }
  sections.push(
    "## Environment variables\n\n" +
      "Defaults live in `.env.example`.\n\n" +
      "| Variable | Description |\n| --- | --- |\n" +
      envRows.join("\n"),
  );

  const tree = [
    "src/",
    "├── config/          # Configuration & Joi env validation",
  ];
  if (anyDatabase) {
    tree.push(
      "├── database/        # Database connection" +
        (postgresEnabled ? " + migrations" : ""),
    );
  }
  if (usersModuleDatabase !== "none") {
    tree.push("├── users/           # Users module");
  }
  if (featureModules.length > 0) {
    tree.push("├── <feature>/       # Generated feature modules");
  }
  tree.push("└── main.ts          # Application entry point");

  let structure = "## Project structure\n\n```\n" + tree.join("\n") + "\n```";
  if (hasModules) {
    structure +=
      "\n\nEach module is organized by hexagonal layer:\n\n" +
      "```\n<feature>/\n" +
      "├── domain/          # Model, repository port, errors\n" +
      "├── application/     # Service (use cases), DTOs\n" +
      "└── infrastructure/  # HTTP controller + DTOs, persistence adapter\n" +
      "```";
  }
  sections.push(structure);

  const scripts = [
    "- `npm run start:dev` — start in watch mode",
    "- `npm run start:prod` — run the compiled app",
    "- `npm run test` — run unit tests",
    "- `npm run lint` — lint and auto-fix",
  ];
  if (postgresEnabled) {
    scripts.push(
      "- `npm run migration:generate -- <path>` — generate a migration",
      "- `npm run migration:run` — apply pending migrations",
      "- `npm run migration:revert` — revert the last migration",
    );
  }
  sections.push(`## Useful scripts\n\n${scripts.join("\n")}`);

  sections.push(
    "---\n\n" +
      "Generated with [Chisel Nest](https://github.com/PMartn/chisel-nest).",
  );

  const content = sections.join("\n\n") + "\n";
  await writeFile(path.join(projectRoot, "README.md"), content, "utf8");
  console.log("  └─ Generated tailored README.md");
}
