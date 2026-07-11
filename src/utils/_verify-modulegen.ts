import * as fs from "fs-extra";
import * as path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { copySkeleton } from "./copy-skeleton";
import { generateFeature } from "../tasks/generate-module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const sandboxDir = path.join(__dirname, "../test-sandbox");

  console.log("🧹 Cleaning old sandbox...");
  await fs.remove(sandboxDir);
  await fs.ensureDir(sandboxDir);

  console.log("🏗️  Copying skeleton...");
  await copySkeleton(sandboxDir);

  console.log("🧩 Generating Product feature (postgres, both DBs enabled)...");
  await generateFeature(sandboxDir, "Product", "postgres");

  console.log("📦 npm install...");
  execSync("npm install", { cwd: sandboxDir, stdio: "inherit" });

  console.log("🏗️  nest build...");
  execSync("npm run build", { cwd: sandboxDir, stdio: "inherit" });

  console.log("✅ BUILD OK — expanded hexagonal module compiles.");
}

run().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
