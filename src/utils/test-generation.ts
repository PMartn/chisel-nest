import * as fs from "fs-extra";
import * as path from "path";
import { execSync } from "child_process";
import { copySkeleton } from "./copy-skeleton";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testGeneration() {
  const sandboxDir = path.join(__dirname, "../test-sandbox");

  console.log("🧹 Cleaning old sandbox...");
  await fs.remove(sandboxDir);
  await fs.ensureDir(sandboxDir);

  console.log("🏗️  Copying skeleton...");
  await copySkeleton(sandboxDir);

  console.log("✂️  Applying pruning logic...");
  // Simulate a user choosing "None" for DB
  // await pruneDatabase(sandboxDir);

  console.log("📦 Installing dependencies in sandbox...");
  try {
    execSync("npm install", { cwd: sandboxDir, stdio: "inherit" });

    console.log("🏗️  Building sandbox...");
    execSync("npm run build", { cwd: sandboxDir, stdio: "inherit" });

    console.log("✅ Success! The generated project builds perfectly.");
  } catch (error) {
    console.error("❌ Build failed! Your pruning logic broke the app.");
    process.exit(1);
  }
}

testGeneration();
