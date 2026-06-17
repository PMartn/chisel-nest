import inquirer from "inquirer";

interface GeneratorAnswers {
  projectName: string;
  database: "PostgreSQL" | "MongoDB" | "None";
  useAuth: boolean;
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
      type: "select",
      name: "database",
      message: "Select a database:",
      choices: ["PostgreSQL", "MongoDB", "None"],
    },  
    {
      type: "confirm",
      name: "useAuth",
      message: "Include Authentication module?",
      default: true,
    },
  ]);

  console.log(`🚀 Scaffolding ${answers.projectName}...`);
}

runGenerator();
