import * as fs from "fs-extra";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function copySkeleton(destinationDir: string) {
  const skeletonPath = path.join(__dirname, "../../skeleton");

  const filterFunc = (src: string) => {
    const baseName = path.basename(src);
    const ignored = ["node_modules", "dist", ".git", ".DS_Store"];
    return !ignored.includes(baseName);
  };

  try {
    await fs.copy(skeletonPath, destinationDir, { filter: filterFunc });
    console.log(`✅ Skeleton copied (ignoring build artifacts).`);
  } catch (err) {
    console.error("❌ Failed to copy skeleton:", err);
    throw err;
  }
}
