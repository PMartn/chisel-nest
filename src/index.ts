// src/index.ts
import inquirer from "inquirer";
import * as path from "path";
import { copySkeleton } from "./utils/copy-skeleton";
import { pruneDatabase } from "./tasks/prune-db";

interface GeneratorAnswers {
  projectName: string;
  database: "PostgreSQL (TypeORM)" | "None";
}

async function runGenerator() {
  const answers: GeneratorAnswers = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "What is the name of your project?",
      default: "my-nest-app",
    },
    {
      type: "list",
      name: "database",
      message: "Select a database configuration:",
      choices: ["PostgreSQL (TypeORM)", "None"],
    },
  ]);

  const targetPath = path.join(process.cwd(), answers.projectName);

  console.log(`\n🚀 Scaffolding project in: ${targetPath}...\n`);

  await copySkeleton(targetPath);

  if (answers.database === "None") {
    await pruneDatabase(targetPath);
  }

  console.log(`\n🎉 Project ${answers.projectName} configured successfully!`);
}

runGenerator();
