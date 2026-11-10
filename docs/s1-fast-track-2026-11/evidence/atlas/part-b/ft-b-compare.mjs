// Pixel compare of the section shots ft-b-pixel.mjs saved: for each main/branch pair of equal size, the share of
// pixels whose channel delta exceeds 8 (raw), and the same after a 1.5 px Gaussian blur with a delta of 24 (blur),
// which absorbs anti-aliasing from a fractional device-pixel offset (59 CSS px x 2.625 = 154.875 device px).
// A section counts as visually equal when blur share is 0.
import { createRequire } from "module";
import fs from "fs";
import path from "path";
const sharp = createRequire("/home/claude/wt-atlas/")("sharp");
const dir = process.argv[2];
const files = fs.readdirSync(dir).filter((f) => f.endsWith("-main.png"));
async function load(p, blur) { let s = sharp(p); if (blur) s = s.blur(1.5); return s.raw().ensureAlpha().toBuffer({ resolveWithObject: true }); }
const rows = [];
for (const f of files.sort()) {
  const a = path.join(dir, f), b = path.join(dir, f.replace(/-main\.png$/, "-branch.png"));
  if (!fs.existsSync(b)) continue;
  const A = await load(a), B = await load(b);
  if (A.info.width !== B.info.width || A.info.height !== B.info.height) { rows.push({ shot: f.replace(/-main\.png$/, ""), size: `${A.info.width}x${A.info.height} vs ${B.info.width}x${B.info.height}` }); continue; }
  const cnt = (X, Y, t) => { let n = 0; for (let i = 0; i < X.data.length; i += 4) if (Math.abs(X.data[i] - Y.data[i]) > t || Math.abs(X.data[i + 1] - Y.data[i + 1]) > t || Math.abs(X.data[i + 2] - Y.data[i + 2]) > t) n++; return n; };
  const px = A.info.width * A.info.height;
  const raw = cnt(A, B, 8), Ab = await load(a, true), Bb = await load(b, true), bl = cnt(Ab, Bb, 24);
  rows.push({ shot: f.replace(/-main\.png$/, ""), size: `${A.info.width}x${A.info.height}`, rawPct: +(100 * raw / px).toFixed(3), blurPct: +(100 * bl / px).toFixed(3) });
}
for (const r of rows) console.log(JSON.stringify(r));
fs.writeFileSync(path.join(dir, "_compare.json"), JSON.stringify(rows, null, 1));
