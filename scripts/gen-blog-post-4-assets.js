/**
 * Builds the blog-post-4 hero + share card from a 21:9 broadcast frame.
 *
 * Source: ~/Downloads/blog-header.png (3024x1296 ≈ 21:9), a wide frame
 * from an EKUZO broadcast (current brand).
 *
 * Per direction: use the frame EXACTLY as-is — no cropping, no color
 * grade, no baked text. Scaling only. Hero and share card are the same
 * uncropped frame; only the filename differs (the share card is
 * intentionally text-free).
 *
 * The on-page hero box is set to the source's exact aspect ratio so
 * the full image displays with zero object-cover trim. (The blog-index
 * thumbnail + OG consumers apply their own fixed-ratio object-cover at
 * display time — that's consumer behavior; the saved file is the full
 * uncropped frame.)
 *
 * Run from repo root:
 *   node scripts/gen-blog-post-4-assets.js [sourcePath]
 */
const fs = require("fs");
const os = require("os");
const path = require("path");

// Resolved via Node walking up to the parent repo's node_modules
// (git worktrees don't have their own node_modules).
const sharp = require("sharp");

const REPO = path.join(__dirname, "..");
const SRC =
  process.argv[2] || path.join(os.homedir(), "Downloads", "blog-header.png");
const OUT_DIR = path.join(REPO, "public", "images");

// Source is 3024x1296. Preserve aspect exactly; scale width to the
// page container max. height = round(1232 * 1296 / 3024) = 528.
const OUT_W = 1232;
const OUT_H = 528;

async function build(name, quality) {
  const outPath = path.join(OUT_DIR, name);
  await sharp(SRC)
    .resize(OUT_W, OUT_H, { fit: "fill" }) // src is already 21:9 → no distortion
    .jpeg({ quality, mozjpeg: true })
    .toFile(outPath);
  return outPath;
}

(async () => {
  if (!fs.existsSync(SRC)) throw new Error(`Source not found: ${SRC}`);
  for (const name of ["blog-post-4-hero.jpg", "blog-post-4-card.jpg"]) {
    const p = await build(name, 78);
    const kb = (fs.statSync(p).size / 1024).toFixed(1);
    console.log(`Wrote ${p} — ${OUT_W}x${OUT_H} — ${kb} KB`);
  }
})();
