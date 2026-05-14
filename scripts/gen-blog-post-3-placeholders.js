/**
 * Generates two placeholder JPGs for blog post 3 (summer camps).
 * Solid background, sentence-case label centered. Under 100KB each.
 *
 * Run from repo root:
 *   node scripts/gen-blog-post-3-placeholders.js
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "public", "images");

function svgPlaceholder(width, height, text) {
  // Brand red on light grey, dashed border, sentence-case caption.
  const border = 8;
  const fontSize = Math.round(width / 28);
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#f0edea"/>
  <rect x="${border / 2}" y="${border / 2}" width="${width - border}" height="${height - border}"
        fill="none" stroke="#F92524" stroke-width="${border}" stroke-dasharray="${border * 3},${border * 2}"/>
  <text x="50%" y="48%" text-anchor="middle" dominant-baseline="middle"
        fill="#F92524" font-family="Inter, Helvetica, Arial, sans-serif"
        font-weight="700" font-size="${Math.round(fontSize * 0.55)}" letter-spacing="3">
    PLACEHOLDER
  </text>
  <text x="50%" y="56%" text-anchor="middle" dominant-baseline="middle"
        fill="#111" font-family="Inter, Helvetica, Arial, sans-serif"
        font-weight="600" font-size="${fontSize}">
    ${text}
  </text>
</svg>
  `.trim();
}

async function makeImage(filename, width, height, caption) {
  const svg = Buffer.from(svgPlaceholder(width, height, caption));
  const outPath = path.join(OUT_DIR, filename);
  await sharp(svg).jpeg({ quality: 80 }).toFile(outPath);
  const size = fs.statSync(outPath).size;
  console.log(`Wrote ${outPath} — ${width}x${height} — ${(size / 1024).toFixed(1)} KB`);
}

(async () => {
  if (!fs.existsSync(OUT_DIR)) {
    throw new Error(`Output directory does not exist: ${OUT_DIR}`);
  }
  await makeImage("blog-post-3-card.jpg", 1232, 770, "Blog post 3 — card placeholder.");
  await makeImage("blog-post-3-hero.jpg", 1232, 520, "Blog post 3 — hero placeholder.");
})();
