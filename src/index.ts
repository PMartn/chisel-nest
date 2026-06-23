// src/index.ts
import express from "express";
import open from "open";
import * as path from "path";
import { fileURLToPath } from "url";
import { copySkeleton } from "./utils/copy-skeleton";
import { pruneDatabase } from "./tasks/prune-db";

interface GeneratorAnswers {
  projectName: string;
  database: "PostgreSQL (TypeORM)" | "None";
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startWebServer() {
  const app = express();
  const PORT = 4200;

  app.use(express.json());

  const rootDir = path.resolve(__dirname, "../");
  app.use(express.static(path.join(rootDir, "dist-frontend")));

  app.post("/api/generate", async (req, res) => {
    const answers: GeneratorAnswers = req.body;

    console.log("\n📥 Received Configuration from React UI:", answers);

    const targetPath = path.join(process.cwd(), answers.projectName);

    try {
      console.log(`\n🚀 Scaffolding project in: ${targetPath}...\n`);

      await copySkeleton(targetPath);

      if (answers.database === "None") {
        await pruneDatabase(targetPath);
      }

      console.log(
        `\n🎉 Project ${answers.projectName} configured successfully!`,
      );

      res.status(200).send({ message: "Success" });

      setTimeout(() => {
        console.log("👋 Configuration complete. Shutting down local server.");
        process.exit(0);
      }, 1500);
    } catch (error) {
      console.error("❌ Scaffolding Error:", error);
      res
        .status(500)
        .send({ error: "Failed to build out the project architecture." });
    }
  });

  app.listen(PORT, async () => {
    console.log(
      `🌐 Configuration dashboard active at http://localhost:${PORT}`,
    );
    console.log(`Press Ctrl+C to abort configuration manually.`);

    await open(`http://localhost:${PORT}`);
  });
}

startWebServer();
