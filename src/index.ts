// src/index.ts
import express from "express";
import open from "open";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { copySkeleton } from "./utils/copy-skeleton";
import { prunePostgresDatabase } from "./tasks/prune-postgres-db";
import { pruneDatabase } from "./tasks/prune-db";
import { pruneMongoDatabase } from "./tasks/prune-mongo-db";
import { pruneHelmet } from "./tasks/prune-helmet";
import { prunePino } from "./tasks/prune-pino";
import { pruneConfigFromAppModule } from "./tasks/prune-config-from-app-module";
import { pruneThrottler } from "./tasks/prune-throttler";
import { updateSwaggerMetadata } from "./tasks/update-swagger-metadata";
import { prunePostgresFromUsersModule } from "./tasks/prune-postgres-from-users-module";
import { pruneMongoFromUsersModule } from "./tasks/prune-mongo-from-users-module";
import { pruneUsersModule } from "./tasks/prune-users-module";
import { generateFeature } from "./tasks/generate-module";
import { generateAuth } from "./tasks/generate-auth";
import { generateReadme } from "./tasks/generate-readme";
import type { GeneratorAnswers } from "./shared/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startWebServer() {
  const app = express();
  const PORT = 4200;

  app.use(express.json());

  app.get("/api/browse", (req, res) => {
    try {
      let targetPath = (req.query.path as string) || "";

      if (!targetPath) {
        targetPath = os.homedir();
      }

      const resolvedPath = path.resolve(targetPath);

      if (!fs.existsSync(resolvedPath)) {
        return res.status(400).send({ error: "Path does not exist." });
      }

      const stats = fs.statSync(resolvedPath);
      if (!stats.isDirectory()) {
        return res.status(400).send({ error: "Path is not a directory." });
      }

      const files = fs.readdirSync(resolvedPath, { withFileTypes: true });
      const subdirectories = files
        .filter((file) => file.isDirectory())
        .map((file) => file.name)
        .sort((a, b) => a.localeCompare(b));

      const parentPath = path.dirname(resolvedPath);

      let drives: string[] = [];
      if (process.platform === "win32") {
        try {
          const stdout = execSync("wmic logicaldisk get name").toString();
          drives = stdout
            .split("\r\r\n")
            .filter((value) => /[A-Za-z]:/.test(value))
            .map((value) => value.trim() + "\\");
        } catch (e) {
          drives = ["C:\\"];
        }
      }

      res.status(200).send({
        currentPath: resolvedPath,
        parentPath: parentPath === resolvedPath ? null : parentPath,
        subdirectories,
        drives,
        homeDir: os.homedir(),
        projectDir: process.cwd(),
      });
    } catch (error: any) {
      console.error("Browse Error:", error);
      res
        .status(500)
        .send({ error: error.message || "Failed to read directory." });
    }
  });

  const rootDir = path.resolve(__dirname, "../");
  app.use(express.static(path.join(rootDir, "dist-frontend")));

  app.post("/api/generate", async (req, res) => {
    const answers: GeneratorAnswers = req.body;
    console.log("\n📥 Received Configuration:", answers);
    const {
      projectName,
      destinationPath,
      postgresEnabled,
      //postgresOrm,
      mongoEnabled,
      //mongoOrm,
      usersModuleDatabase,
      authProvider,
      modules,
      usePinoLogger,
      useHelmet,
      useRateLimiting,
    }: GeneratorAnswers = answers;

    const baseDir = destinationPath || process.cwd();
    const targetPath = path.join(baseDir, projectName);

    try {
      console.log(`\n🚀 Scaffolding project in: ${targetPath}...\n`);
      await copySkeleton(targetPath);

      const shouldRemoveConfigFromAppAppModule = !usePinoLogger;

      await updateSwaggerMetadata(targetPath, projectName);
      if (!postgresEnabled && !mongoEnabled) {
        await pruneDatabase(targetPath);
      } else if (!postgresEnabled) {
        await prunePostgresDatabase(targetPath);
      } else if (!mongoEnabled) {
        await pruneMongoDatabase(targetPath);
      }

      if (usersModuleDatabase === "none") {
        await pruneUsersModule(targetPath);
      } else if (usersModuleDatabase === "postgres") {
        await pruneMongoFromUsersModule(targetPath);
      } else {
        await prunePostgresFromUsersModule(targetPath);
      }
      if (!usePinoLogger) {
        await prunePino(targetPath);
      }
      if (!useHelmet) {
        await pruneHelmet(targetPath);
      }
      if (!useRateLimiting) {
        await pruneThrottler(targetPath);
      }

      if (shouldRemoveConfigFromAppAppModule) {
        await pruneConfigFromAppModule(targetPath);
      }

      for (const feature of modules) {
        const name = feature.name.trim();
        const dbEnabled =
          feature.database === "postgres" ? postgresEnabled : mongoEnabled;
        if (name && dbEnabled) {
          await generateFeature(targetPath, name, feature.database);
        }
      }

      if (authProvider !== "none" && usersModuleDatabase !== "none") {
        await generateAuth(targetPath, authProvider, usersModuleDatabase);
      }

      await generateReadme(targetPath, answers);

      console.log(`\n🎉 Project ${projectName} configured successfully!`);
      res.status(200).send({ message: "Success" });

      setTimeout(() => {
        console.log("👋 Shutting down local server.");
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
    await open(`http://localhost:${PORT}`);
  });
}

startWebServer();
