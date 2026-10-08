import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceDir = path.join(root, "..");
const targetDir = path.join(root, "public", "images");

fs.mkdirSync(targetDir, { recursive: true });

for (const file of [
  "hero.jpg",
  "market.jpg",
  "swap.jpg",
  "mole.jpg",
  "biryani.jpg",
  "jollof.jpg",
  "kimchi-jjigae.jpg",
  "pho.jpg",
]) {
  const src = path.join(sourceDir, file);
  const dst = path.join(targetDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
  }
}

console.log("Images copied to public/images");
