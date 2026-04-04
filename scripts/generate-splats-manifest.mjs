import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const splatsDir = path.join(root, "public", "splats");
const presetsDir = path.join(root, "public", "presets");

const outputFile = path.join(root, "public", "manifest.json");

function readFiles(dir, extension) {
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.toLowerCase().endsWith(extension))
    .sort((a, b) => a.localeCompare(b));
}

function main() {
  // ensure dirs exist
  if (!fs.existsSync(splatsDir)) fs.mkdirSync(splatsDir, { recursive: true });
  if (!fs.existsSync(presetsDir)) fs.mkdirSync(presetsDir, { recursive: true });

  const splats = readFiles(splatsDir, ".ply");
  const presets = readFiles(presetsDir, ".json");

  const manifest = {
    splats,
    presets,
  };

  fs.writeFileSync(outputFile, JSON.stringify(manifest, null, 2), "utf8");

  console.log(
    `Manifest generated:
- ${splats.length} splats
- ${presets.length} presets
→ ${outputFile}`,
  );
}

main();
