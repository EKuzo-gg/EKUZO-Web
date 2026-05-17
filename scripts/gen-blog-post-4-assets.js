/**
 * Builds the real blog-post-4 hero + card from a broadcast VOD frame.
 *
 * Source: a fullscreen League broadcast frame (2000x1298) from the
 * EKUZO Florida Invitational VOD.
 *
 * Crops out: old "Ekuso Allstars" wordmark (top-left), "Panther
 * Esports"/FIU partner branding (top-right), the top scoreboard bar +
 * game timer, both student webcams + stats panel + Florida branding +
 * minimap (bottom), and the champion portrait columns (far left/right).
 * Keeps: the clean center teamfight.
 *
 * Hero  = clean graded gameplay, no baked text (the page renders the
 *         live H1 directly above it; baked text would duplicate it).
 * Card  = same grade, tighter crop, + bottom gradient + EKUZO eyebrow
 *         + headline in Tungsten Narrow (OG/social share surface where
 *         there is no H1 beside it).
 *
 * Font: librsvg (sharp's SVG renderer) resolves fonts via fontconfig.
 * We point fontconfig at the repo's public/fonts dir so this is
 * portable (no dependency on system-installed fonts). Must set
 * FONTCONFIG_FILE before sharp/libvips loads.
 *
 * Run from repo root:
 *   node scripts/gen-blog-post-4-assets.js [sourcePath]
 */
const fs = require("fs");
const os = require("os");
const path = require("path");

const REPO = path.join(__dirname, "..");

// Resolved via Node walking up to the parent repo's node_modules
// (git worktrees don't have their own node_modules).
const sharp = require("sharp");

const SRC = process.argv[2] || path.join(os.homedir(), "Downloads", "claude.jpg");
const OUT_DIR = path.join(REPO, "public", "images");

// Source 2000x1298. Top nudged down ~12px vs first pass to drop the
// faint "13:44" game-timer sliver. Ratios held exactly.
const HERO_CROP = { left: 151, top: 222, width: 1658, height: 700 }; // 2.369:1
const CARD_CROP = { left: 372, top: 214, width: 1216, height: 760 }; // 1.6:1

const HERO_OUT = { w: 1232, h: 520 };
const CARD_OUT = { w: 1232, h: 770 };

const GRADE = (img) => img.modulate({ brightness: 0.84, saturation: 0.9 }).linear(1.06, -8);

async function buildHero() {
  // Final asset — no baked text (page renders the live H1 above it).
  const outPath = path.join(OUT_DIR, "blog-post-4-hero.jpg");
  await GRADE(sharp(SRC).extract(HERO_CROP).resize(HERO_OUT.w, HERO_OUT.h))
    .jpeg({ quality: 82 })
    .toFile(outPath);
  return outPath;
}

// Temp dir under public/ so the Next dev server serves it over HTTP
// (Playwright blocks file://). Deleted after the card is rendered.
const TMP_WEB_DIR = path.join(REPO, "public", "_tmp-card");

async function buildCardBackground() {
  // Textless graded crop. The Tungsten headline + eyebrow + gradient
  // are composited on top by a real browser rendering the HTML below
  // (librsvg can't resolve the custom OTF; a browser @font-face
  // renders it pixel-perfect).
  fs.mkdirSync(TMP_WEB_DIR, { recursive: true });
  const outPath = path.join(TMP_WEB_DIR, "bg.jpg");
  await GRADE(sharp(SRC).extract(CARD_CROP).resize(CARD_OUT.w, CARD_OUT.h))
    .jpeg({ quality: 88 })
    .toFile(outPath);
  return outPath;
}

function writeCardHtml() {
  const htmlPath = path.join(TMP_WEB_DIR, "card.html");
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face{font-family:"Tungsten Narrow";src:url("/fonts/TungstenNarrow-Black.otf") format("opentype");font-weight:900;}
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${CARD_OUT.w}px;height:${CARD_OUT.h}px;overflow:hidden}
  .card{position:relative;width:${CARD_OUT.w}px;height:${CARD_OUT.h}px;
    background:url("bg.jpg") center/cover no-repeat;font-family:"Tungsten Narrow",sans-serif}
  .shade{position:absolute;inset:0;background:linear-gradient(to bottom,
    rgba(0,0,0,0) 30%,rgba(0,0,0,.88) 100%)}
  .copy{position:absolute;left:64px;bottom:56px;right:64px}
  .rule{width:84px;height:6px;background:#F92524;margin-bottom:22px}
  .eyebrow{font-weight:900;font-size:30px;letter-spacing:7px;color:#F92524;margin-bottom:14px}
  .headline{font-weight:900;font-size:84px;line-height:.96;color:#fff}
</style></head><body><div class="card"><div class="shade"></div>
  <div class="copy"><div class="rule"></div>
  <div class="eyebrow">GUIDES</div>
  <div class="headline">Why League of Legends<br>is perfect for<br>youth development</div>
  </div></div></body></html>`;
  fs.writeFileSync(htmlPath, html);
  return htmlPath;
}

(async () => {
  if (!fs.existsSync(SRC)) throw new Error(`Source not found: ${SRC}`);
  const hero = await buildHero();
  console.log(
    `Wrote ${hero} — ${(fs.statSync(hero).size / 1024).toFixed(1)} KB`,
  );
  await buildCardBackground();
  writeCardHtml();
  console.log(`Card staged at  → public/_tmp-card/card.html (serve via dev server)`);
  console.log(`Next: browser-screenshot http://localhost:3001/_tmp-card/card.html at ${CARD_OUT.w}x${CARD_OUT.h}, compress to public/images/blog-post-4-card.jpg, then delete public/_tmp-card/`);
})();
