import * as fs from "fs-extra";
import * as path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { copySkeleton } from "./copy-skeleton";
import { pruneDatabase } from "../tasks/prune-db";
import { prunePostgresDatabase } from "../tasks/prune-postgres-db";
import { pruneMongoDatabase } from "../tasks/prune-mongo-db";
import { prunePostgresFromUsersModule } from "../tasks/prune-postgres-from-users-module";
import { pruneMongoFromUsersModule } from "../tasks/prune-mongo-from-users-module";
import { pruneUsersModule } from "../tasks/prune-users-module";
import { generateFeature } from "../tasks/generate-module";

const OUT_ROOT = process.argv[2];
if (!OUT_ROOT) {
  console.error("Usage: tsx _verify-modulegen.ts <output-root>");
  process.exit(1);
}

interface Scenario {
  name: string;
  postgresEnabled: boolean;
  mongoEnabled: boolean;
}

const scenarios: Scenario[] = [
  { name: "both-dbs", postgresEnabled: true, mongoEnabled: true },
  { name: "postgres-only", postgresEnabled: true, mongoEnabled: false },
  { name: "mongo-only", postgresEnabled: false, mongoEnabled: true },
  { name: "no-db", postgresEnabled: false, mongoEnabled: false },
];

async function buildScenario(scenario: Scenario): Promise<boolean> {
  const dir = path.join(OUT_ROOT, scenario.name);
  console.log(`\n=== Scenario: ${scenario.name} ===`);
  await fs.remove(dir);
  await fs.ensureDir(dir);
  await copySkeleton(dir);

  // Mirror the exact orchestration in src/index.ts
  const { postgresEnabled, mongoEnabled } = scenario;
  if (!postgresEnabled && !mongoEnabled) {
    await pruneDatabase(dir);
    await pruneUsersModule(dir);
  } else if (!postgresEnabled) {
    await prunePostgresDatabase(dir);
    await prunePostgresFromUsersModule(dir);
  } else if (!mongoEnabled) {
    await pruneMongoDatabase(dir);
    await pruneMongoFromUsersModule(dir);
  }

  if (postgresEnabled || mongoEnabled) {
    const featureDatabase = postgresEnabled ? "postgres" : "mongo";
    await generateFeature(dir, "Product", featureDatabase);
  }

  try {
    execSync("npm install --no-audit --no-fund --loglevel=error", {
      cwd: dir,
      stdio: "inherit",
    });
    execSync("npm run build", { cwd: dir, stdio: "inherit" });
    console.log(`✅ ${scenario.name}: BUILD OK`);
    return true;
  } catch {
    console.error(`❌ ${scenario.name}: BUILD FAILED`);
    return false;
  }
}

const __filename = fileURLToPath(import.meta.url);
void __filename;

async function run() {
  const results: Record<string, boolean> = {};
  for (const scenario of scenarios) {
    results[scenario.name] = await buildScenario(scenario);
  }

  console.log("\n================ SUMMARY ================");
  let allOk = true;
  for (const [name, ok] of Object.entries(results)) {
    console.log(`${ok ? "✅" : "❌"} ${name}`);
    if (!ok) allOk = false;
  }
  process.exit(allOk ? 0 : 1);
}

run().catch((err) => {
  console.error("❌ Verification harness error:", err);
  process.exit(1);
});
