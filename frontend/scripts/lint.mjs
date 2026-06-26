import { spawnSync } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, "..");

const jsFiles = [
  "projects.js",
  "create-project.js",
  "project-details.js",
];

const htmlFiles = [
  "index.html",
  "create.html",
  "project.html",
];

const cssFiles = ["styles.css"];
const errors = [];

for (const file of jsFiles) {
  const absolutePath = path.join(frontendDir, file);
  const result = spawnSync(process.execPath, ["--check", absolutePath], {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    errors.push(`JavaScript syntax check failed for ${file}.\n${result.stderr.trim()}`);
  }
}

for (const file of cssFiles) {
  const absolutePath = path.join(frontendDir, file);

  try {
    await access(absolutePath);
  } catch {
    errors.push(`Missing stylesheet: ${file}`);
  }
}

for (const file of htmlFiles) {
  const absolutePath = path.join(frontendDir, file);
  const contents = await readFile(absolutePath, "utf8");

  if (!contents.startsWith("<!DOCTYPE html>")) {
    errors.push(`${file} is missing an HTML5 doctype.`);
  }

  const assetMatches = contents.matchAll(/<(?:link|script)[^>]+(?:href|src)="([^"]+)"/g);
  for (const match of assetMatches) {
    const assetPath = match[1];
    if (!assetPath.startsWith("/")) {
      continue;
    }

    const localAssetPath = path.join(frontendDir, assetPath.slice(1));
    try {
      await access(localAssetPath);
    } catch {
      errors.push(`${file} references a missing asset: ${assetPath}`);
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(error);
  }
  process.exit(1);
}

console.log("Frontend lint checks passed.");
