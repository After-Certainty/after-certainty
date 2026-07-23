/**
 * Build public/og.png (1200×630) from the hero backdrop with headline, CTA, and compression.
 * Run: npm run generate:og
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "public/images/hero/hero-backdrop.png");
const OUT = path.join(ROOT, "public/og.png");

const WIDTH = 1200;
const HEIGHT = 630;
const MAX_BYTES = 600 * 1024;

const HEADLINE = "AFTER CERTAINTY";
const SUBLINE = "Meaning, trust, and leadership beyond false certainty";
const CTA = "START HERE";

function buildOverlaySvg() {
  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#050506" stop-opacity="0"/>
      <stop offset="40%" stop-color="#050506" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#050506" stop-opacity="0.9"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#scrim)"/>
  <text
    x="80"
    y="360"
    fill="#ece8e1"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="64"
    font-weight="500"
    letter-spacing="12"
  >${HEADLINE}</text>
  <text
    x="80"
    y="430"
    fill="#b8b2a6"
    font-family="system-ui, -apple-system, sans-serif"
    font-size="26"
  >${SUBLINE}</text>
  <rect x="80" y="468" width="248" height="56" rx="2" fill="#c9a962"/>
  <text
    x="104"
    y="505"
    fill="#050506"
    font-family="system-ui, -apple-system, sans-serif"
    font-size="20"
    font-weight="600"
    letter-spacing="4"
  >${CTA}</text>
</svg>`;
}

async function compressPng(buffer) {
  const attempts = [
    { compressionLevel: 9, effort: 10 },
    { compressionLevel: 9, effort: 10, palette: true },
    { compressionLevel: 9, effort: 10, palette: true, colours: 128 },
  ];

  let best = buffer;
  for (const options of attempts) {
    const next = await sharp(buffer).png(options).toBuffer();
    if (next.length < best.length) best = next;
    if (best.length <= MAX_BYTES) break;
  }
  return best;
}

async function main() {
  mkdirSync(path.dirname(OUT), { recursive: true });

  const composed = await sharp(SRC)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "attention" })
    .composite([{ input: Buffer.from(buildOverlaySvg()), top: 0, left: 0 }])
    .png()
    .toBuffer();

  const output = await compressPng(composed);
  await sharp(output).toFile(OUT);

  const kb = output.length / 1024;
  console.log(`Wrote ${OUT} (${WIDTH}×${HEIGHT}, ${kb.toFixed(1)} KB)`);

  if (output.length > MAX_BYTES) {
    console.error(`OG image is ${kb.toFixed(1)} KB; WhatsApp recommends < ${MAX_BYTES / 1024} KB.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
