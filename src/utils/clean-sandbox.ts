import * as fs from "fs-extra";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function cleanSandbox() {
  const sandboxDir = path.join(__dirname, "../test-sandbox");

  try {
    console.log("🧹 Cleaning old sandbox...");
    await fs.remove(sandboxDir);
    await fs.ensureDir(sandboxDir);
  } catch (error) {
    console.error("❌ Cleanup failed!");
    process.exit(1);
  }
}

cleanSandbox();
