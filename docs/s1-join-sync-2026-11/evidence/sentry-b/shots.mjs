import { chromium, newCtx, stats } from "./common.mjs";
import sharp from "sharp";
import fs from "fs";
const SH = process.argv[2]; const b = await chromium.launch(); const rows = [];
const ports = { before: 3200, after: 3110, before2: 3200 };
async function shot(port, ad, w, full) {
  const ctx = await newCtx(b, { viewport: { width: w, height: w === 375 ? 667 : 900 }, deviceScaleFactor: 1, isMobile: w === 375, hasTouch: w === 375 });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${port}/season1?ad=${ad}&utm_source=meta&utm_content=${ad}-qa`, { waitUntil: "load" });
  await page.waitForTimeout(6000);
  const buf = await page.screenshot({ fullPage: full, animations: "disabled" });
  await ctx.close(); return buf;
}
async function raw(buf) { const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true }); return { data, w: info.width, h: info.height }; }
function diff(a, c) {
  if (a.w !== c.w || a.h !== c.h) return { sizeMismatch: [a.w + "x" + a.h, c.w + "x" + c.h] };
  let n = 0; for (let i = 0; i < a.data.length; i += 4) { if (Math.abs(a.data[i] - c.data[i]) + Math.abs(a.data[i + 1] - c.data[i + 1]) + Math.abs(a.data[i + 2] - c.data[i + 2]) > 30) n++; }
  return { size: a.w + "x" + a.h, diffPx: n, share: Number((n / (a.w * a.h) * 100).toFixed(4)) };
}
for (const ad of ["d18", "d19", "d21", "d2"]) for (const w of [375, 1440]) for (const full of [false, true]) {
  const tag = `${ad}-${w}-${full ? "full" : "fold"}`;
  const bufs = {};
  for (const k of ["before", "after", "before2"]) bufs[k] = await shot(ports[k], ad, w, full);
  if (!full || true) { fs.writeFileSync(`${SH}/sentry-landing-${tag}-before.png`, bufs.before); fs.writeFileSync(`${SH}/sentry-landing-${tag}-after.png`, bufs.after); }
  const r = { tag, beforeVsAfter: diff(await raw(bufs.before), await raw(bufs.after)), noiseFloor_beforeVsBefore: diff(await raw(bufs.before), await raw(bufs.before2)) };
  rows.push(r); console.log(JSON.stringify(r));
}
await b.close(); console.log("blocked", stats.blocked);
fs.writeFileSync(process.argv[3], JSON.stringify({ blocked: stats.blocked, rows }, null, 1));
