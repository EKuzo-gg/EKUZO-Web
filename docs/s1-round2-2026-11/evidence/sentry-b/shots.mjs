import { chromium, newCtx, mobile, desk, AFTER, BEFORE, ADS, stats } from "./lib.mjs";
import fs from "fs";
import { createRequire } from "module";
const sharp = createRequire("/home/claude/wt-build/node_modules/")("sharp");
const SD = "/home/claude/wt-build/docs/s1-round2-2026-11/screenshots/", TMP = "/tmp/claude-0/sb2-scripts/shots/";
fs.mkdirSync(TMP, { recursive: true });
const browser = await chromium.launch();
const results = {}, consoles = {};
async function shot(base, tag, ad, w) {
  const ctx = await newCtx(browser, w === 375 ? mobile : desk);
  await ctx.addInitScript(() => { Math.random = () => 0.1; });
  const page = await ctx.newPage();
  const errs = [];
  page.on("console", (m) => { if (m.type() === "error") errs.push("console: " + m.text().slice(0, 200)); });
  page.on("pageerror", (e) => errs.push("pageerror: " + String(e).slice(0, 200)));
  page.on("response", (r) => { if (r.status() >= 400) errs.push(`http ${r.status()} ${r.url().replace(base, "")}`); });
  page.on("requestfailed", (r) => errs.push("reqfail " + r.url().replace(base, "").slice(0, 100)));
  await page.goto(`${base}/season1?ad=${ad}&utm_source=meta&utm_content=${ad}-qa`, { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(8000);
  const f = `${TMP}${tag}-${ad}-${w}.png`;
  await page.screenshot({ path: f });
  await ctx.close();
  consoles[`${tag}-${ad}-${w}`] = errs;
  return f;
}
async function diff(a, b) {
  const A = await sharp(a).removeAlpha().raw().toBuffer({ resolveWithObject: true }), B = await sharp(b).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  if (A.info.width !== B.info.width || A.info.height !== B.info.height) return { share: 1, note: "size differs" };
  let n = 0; const px = A.info.width * A.info.height;
  for (let i = 0; i < px; i++) { const o = i * 3; if (Math.abs(A.data[o] - B.data[o]) + Math.abs(A.data[o + 1] - B.data[o + 1]) + Math.abs(A.data[o + 2] - B.data[o + 2]) > 24) n++; }
  return { share: n / px };
}
for (const w of [375, 1440]) for (const ad of ADS) {
  const fb = await shot(BEFORE, "before", ad, w), fa = await shot(AFTER, "after", ad, w);
  const d = await diff(fb, fa);
  results[`${ad}-${w}`] = { pct: Number((d.share * 100).toFixed(3)), ...(d.note ? { note: d.note } : {}) };
  if (d.share > 0.005) {
    const A = sharp(fb), B = sharp(fa); const m = await A.metadata();
    await sharp({ create: { width: m.width * 2 + 20, height: m.height, channels: 3, background: "#ff00ff" } })
      .composite([{ input: fb, left: 0, top: 0 }, { input: fa, left: m.width + 20, top: 0 }]).png().toFile(`${SD}sentry-b-sbs-${ad}-${w}.png`);
  }
  console.log(ad, w, results[`${ad}-${w}`].pct + "%");
  fs.writeFileSync("shots.json", JSON.stringify({ results, consoles }, null, 1));
}
// 2 s loading frames, after build, throttled, 375
import { throttle } from "./lib.mjs";
for (const ad of ["d2", "d4"]) {
  const ctx = await newCtx(browser, mobile); const page = await ctx.newPage(); await throttle(ctx, page);
  await page.goto(`${AFTER}/season1?ad=${ad}&utm_source=meta&utm_content=${ad}-qa`, { waitUntil: "commit" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SD}sentry-b-after-${ad}-375-2s.png` });
  await ctx.close();
}
fs.writeFileSync("shots.json", JSON.stringify({ results, consoles, blocked: stats.blocked }, null, 1));
await browser.close();
