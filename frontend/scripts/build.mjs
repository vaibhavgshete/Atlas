import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, "..");
const distDir = path.join(frontendDir, "dist");

const assets = [
  "index.html",
  "create.html",
  "project.html",
  "projects.js",
  "create-project.js",
  "project-details.js",
  "styles.css",
  "nginx.conf",
];

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

for (const asset of assets) {
  await cp(path.join(frontendDir, asset), path.join(distDir, asset));
}

console.log(`Copied ${assets.length} frontend assets into ${distDir}.`);
