import sharp from "sharp";
import { readFileSync } from "node:fs";

const svg = readFileSync(new URL("./icon-source.svg", import.meta.url));

const targets = [
  ["public/icon-192.png", 192],
  ["public/icon-512.png", 512],
  ["public/apple-touch-icon.png", 180],
];

for (const [out, size] of targets) {
  await sharp(svg, { density: 300 }).resize(size, size).png().toFile(out);
  console.log(`wrote ${out}`);
}
