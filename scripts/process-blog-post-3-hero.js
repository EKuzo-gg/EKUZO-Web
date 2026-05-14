/**
 * Process the blog-post-3 hero source image into the two assets the site uses:
 *
 *   public/images/blog-post-3-hero.jpg — 1232×520, article hero (~2.37:1)
 *   public/images/blog-post-3-card.jpg — 1232×770, blog index card AND the
 *                                         single share preview asset (~1.6:1).
 *                                         Referenced by Article.image,
 *                                         og:image, and twitter:image.
 *
 * Source default: ~/Downloads/BlogImage.png (1915×821, ~2.33:1).
 * Override with `node scripts/process-blog-post-3-hero.js /path/to/source`.
 *
 * Targets are <100KB each (Netlify-function-bundle hygiene + faster share
 * preview fetches). Quality is tuned to land just under that.
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SRC =
  process.argv[2] ||
  path.join(process.env.HOME || "", "Downloads", "BlogImage.png");
const OUT = path.join(__dirname, "..", "public", "images");

async function processHero(srcMeta) {
  // Hero is 1232×520 (≈2.369:1). Source is ≈2.333:1 — slightly narrower.
  // Resize to 1232 wide first, then crop a few pixels evenly off top + bottom.
  const scaledHeight = Math.round((1232 * srcMeta.height) / srcMeta.width);
  const cropTop = Math.floor((scaledHeight - 520) / 2);
  await sharp(SRC)
    .resize({ width: 1232 })
    .extract({ left: 0, top: cropTop, width: 1232, height: 520 })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(path.join(OUT, "blog-post-3-hero.jpg"));
}

async function processCard(srcMeta) {
  // Card is 1232×770 (≈1.6:1). Source is ≈2.33:1 — much wider than target.
  // Extract a 1.6:1 region from source first, then resize to exact 1232×770.
  // Target ratio of the source extract: 1.6:1 keeping full source height.
  // → extractWidth = round(height × 1.6)
  // Subject (monitor + kid) spans roughly x=200..x=1900 in the 1915-wide
  // source. Centering the crop on x≈957 with a 1314-wide window means
  // leftOffset = 957 - 657 = 300. Drops a sliver of dark left edge and a
  // sliver of bed on the right — both edge pixels, neither focal.
  const extractWidth = Math.round(srcMeta.height * 1.6);
  const leftOffset = Math.max(
    0,
    Math.round((srcMeta.width - extractWidth) / 2),
  );
  await sharp(SRC)
    .extract({
      left: leftOffset,
      top: 0,
      width: extractWidth,
      height: srcMeta.height,
    })
    .resize({ width: 1232, height: 770 })
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(path.join(OUT, "blog-post-3-card.jpg"));
}

(async () => {
  if (!fs.existsSync(SRC)) {
    throw new Error(`Source image not found: ${SRC}`);
  }
  if (!fs.existsSync(OUT)) {
    throw new Error(`Output directory not found: ${OUT}`);
  }
  const srcMeta = await sharp(SRC).metadata();
  console.log(`Source: ${SRC} (${srcMeta.width}×${srcMeta.height})`);

  await processHero(srcMeta);
  await processCard(srcMeta);

  for (const name of ["blog-post-3-hero.jpg", "blog-post-3-card.jpg"]) {
    const p = path.join(OUT, name);
    const stat = fs.statSync(p);
    const m = await sharp(p).metadata();
    console.log(
      `  ${name}: ${m.width}×${m.height}, ${(stat.size / 1024).toFixed(1)} KB`,
    );
  }
})();
