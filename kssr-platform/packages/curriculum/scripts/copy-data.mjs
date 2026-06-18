/**
 * Cross-platform postbuild step: copy authored JSON content from src/data
 * into dist/data so the compiled package can resolve it at runtime.
 */
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, "..");
const src = join(pkgRoot, "src", "data");
const dest = join(pkgRoot, "dist", "data");

if (!existsSync(src)) {
  console.error(`[copy-data] source not found: ${src}`);
  process.exit(1);
}
mkdirSync(dirname(dest), { recursive: true });
cpSync(src, dest, { recursive: true });
console.log(`[copy-data] copied ${src} -> ${dest}`);
