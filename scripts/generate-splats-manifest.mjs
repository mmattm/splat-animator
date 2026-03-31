import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const splatsDir = path.join(root, "public", "splats");
const outputFile = path.join(splatsDir, "manifest.json");

function main() {
  if (!fs.existsSync(splatsDir)) {
    console.warn(`No splats directory found: ${splatsDir}`);
    fs.mkdirSync(splatsDir, { recursive: true });
  }

  const files = fs
    .readdirSync(splatsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.toLowerCase().endsWith(".ply"))
    .sort((a, b) => a.localeCompare(b));

  fs.writeFileSync(outputFile, JSON.stringify(files, null, 2), "utf8");
  console.log(
    `Generated splat manifest with ${files.length} file(s): ${outputFile}`,
  );
}

main();
