// s1-fast-track Part A pixel pair: d19 and noad at 412x915@2.625, main vs build, md5 plus the atlas-pixel diff.
// Same capture as atlas-pixel.mjs (freeze, Math.random 0.25, fonts and images settled, full page), but analytics
// hosts are stubbed to 204 by host regex with page.route, POST /api/season-one is fulfilled locally, and an
// offender check lists hosts that answered from the network other than localhost and the two font hosts.
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import crypto from "crypto";
const { chromium } = createRequire("/home/claude/")("playwright");
const sharp = createRequire("/home/claude/wt-atlas/")("sharp");
const [mainBase, branchBase, outDir] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const STUB = /(^|\.)(googletagmanager\.com|google-analytics\.com|analytics\.google\.com|google\.com|doubleclick\.net|googleadservices\.com|googlesyndication\.com|clarity\.ms|bing\.com|facebook\.net|facebook\.com)$/i;
const ALLOWED = new Set(["localhost", "127.0.0.1", "fonts.googleapis.com", "fonts.gstatic.com"]);
const offenders = new Set();
const browser = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY, bypass: "localhost,127.0.0.1" } });
async function shoot(base, ad, label) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const errors = [];
  await ctx.route("**/*", (r) => {
    const req = r.request(); const u = new URL(req.url());
    if (STUB.test(u.hostname)) return r.fulfill({ status: 204, body: "" });
    if (req.method() === "POST" && u.pathname === "/api/season-one") return r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    return r.continue();
  });
  ctx.on("response", (res) => { const u = new URL(res.url()); if (!ALLOWED.has(u.hostname) && !STUB.test(u.hostname)) offenders.add(u.hostname); });
  await ctx.addInitScript(() => { Math.random = () => 0.25; try { localStorage.clear(); } catch (_) {} });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto(base + "/season1" + (ad === "noad" ? "" : "?ad=" + ad), { waitUntil: "load" });
  await page.addStyleTag({ content: "*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition:none!important;caret-color:transparent!important}" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    const imgs = [...document.images].filter((i) => i.loading !== "lazy");
    await Promise.all(imgs.map((i) => (i.complete ? i.decode().catch(() => {}) : new Promise((r) => { i.onload = i.onerror = r; }))));
  });
  await page.waitForTimeout(600);
  await page.evaluate(() => document.fonts.ready);
  const file = path.join(outDir, `${ad}-412-initial-${label}.png`);
  await page.screenshot({ path: file, fullPage: true });
  await ctx.close();
  return { file, errors, md5: crypto.createHash("md5").update(fs.readFileSync(file)).digest("hex") };
}
async function diffPct(a, b) {
  const A = await sharp(a).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  const B = await sharp(b).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  if (A.info.width !== B.info.width || A.info.height !== B.info.height) return { pct: 100, size: "mismatch" };
  let n = 0; const px = A.info.width * A.info.height;
  for (let i = 0; i < px; i++) { const o = i * 4; if (Math.abs(A.data[o] - B.data[o]) > 8 || Math.abs(A.data[o + 1] - B.data[o + 1]) > 8 || Math.abs(A.data[o + 2] - B.data[o + 2]) > 8) n++; }
  return { pct: (100 * n) / px, size: `${A.info.width}x${A.info.height}` };
}
const rows = [];
for (const ad of ["d19", "noad"]) {
  const m = await shoot(mainBase, ad, "main"); const b = await shoot(branchBase, ad, "branch");
  rows.push({ ad, vp: "412x915@2.625", mainMd5: m.md5, branchMd5: b.md5, md5Equal: m.md5 === b.md5, ...(await diffPct(m.file, b.file)), mainErr: m.errors, branchErr: b.errors });
  console.log(JSON.stringify(rows.at(-1)));
}
console.log("offenders", JSON.stringify([...offenders]));
fs.writeFileSync(path.join(outDir, "_pixel.json"), JSON.stringify({ rows, offenders: [...offenders] }, null, 1));
await browser.close();
