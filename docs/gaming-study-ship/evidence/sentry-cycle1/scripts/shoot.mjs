import fs from "node:fs";
import sharp from "/Users/jamiefitch/Projects/ekuzo-web/.claude/worktrees/gaming-study-ship/node_modules/sharp/lib/index.js";
import { startProxy, LOG } from "./proxy.mjs";
import { launchGuarded, newCtx, closeCtx, scrollThrough, BASE, POST, VIEWPORTS } from "./lib.mjs";
const OUT = "/Users/jamiefitch/Projects/ekuzo-web/.claude/worktrees/gaming-study-ship/docs/gaming-study-ship/screenshots";
const EVD = "/Users/jamiefitch/Projects/ekuzo-web/.claude/worktrees/gaming-study-ship/docs/gaming-study-ship/evidence";
const srv = {close:(cb)=>cb&&cb()};
const browser = await launchGuarded();
const made = [], notes = [], consoleRep = [];
const fullLog = [];
// Chrome caps a capture texture near 16384 device px; tile taller pages and stitch.
async function fullShot(page, name) {
  const f = `${OUT}/${name}.png`;
  const { H, W, d } = await page.evaluate(() => ({ H: document.documentElement.scrollHeight, W: innerWidth, d: devicePixelRatio }));
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
  const T = Math.floor(14000 / d);
  if (H * d <= 16000) { await page.screenshot({ path: f, fullPage: true, clip: { x: 0, y: 0, width: W, height: H } }); made.push(name + ".png"); }
  else {
    const tiles = [];
    for (let y = 0; y < H; y += T) { const h = Math.min(T, H - y); tiles.push({ input: await page.screenshot({ fullPage: true, clip: { x: 0, y, width: W, height: h } }), top: Math.round(y * d), left: 0 }); }
    await sharp({ create: { width: Math.round(W * d), height: Math.round(H * d), channels: 3, background: "#fff" } }).composite(tiles).png().toFile(f); made.push(name + ".png");
  }
  const md = await sharp(f).metadata();
  fullLog.push(`${name}: docHeight=${H} css px, DPR=${d}, expected ${Math.round(W * d)}x${Math.round(H * d)}, got ${md.width}x${md.height}, ${Math.round(W * d) === md.width && Math.abs(md.height - H * d) <= d ? "MATCH" : "MISMATCH"}${H * d > 16000 ? ", tiled" : ""}`);
}

const shot = async (target, name, opts = {}) => { const f = `${OUT}/${name}.png`; try { await target.screenshot({ path: f, ...opts }); made.push(name + ".png"); } catch (e) { notes.push(`FAILED ${name}: ${String(e).slice(0, 150)}`); } };
const ancestor = (page, text, sel) => page.locator(`xpath=//*[normalize-space(text())="${text}"]`).first().locator(`xpath=ancestor::${sel}[1]`);
for (const vp of ["1440", "1024", "768", "375"]) {
  const ctx = await newCtx(browser, `post-${vp}`, { vp }); const page = await ctx.newPage();
  await page.goto(BASE + POST, { waitUntil: "load" }); await page.waitForTimeout(1500);
  await shot(page, `post-${vp}-top`);
  await scrollThrough(page);
  await fullShot(page, `post-${vp}-full`);
  await shot(page.locator('img[alt^="A phone showing the X post"]').locator("xpath=.."), `post-${vp}-hero`);
  if (vp === "1440" || vp === "375") {
    const g = page.locator('img[alt^="Same game, two"]'); await g.scrollIntoViewIfNeeded(); await page.evaluate(() => document.querySelector('img[alt^="Same game, two"]').scrollIntoView({ block: "center" })); await page.waitForTimeout(600);
    await shot(page, `post-${vp}-graphic`);
    const kr = ancestor(page, "Keep Reading", "section"); const krc = (await kr.count()) ? kr : ancestor(page, "Keep Reading", "div");
    await krc.scrollIntoViewIfNeeded(); await page.waitForTimeout(600); await shot(krc, `post-${vp}-keepreading`);
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
  }
  const by = page.locator('xpath=//*[contains(text(),"Updated")]').first();
  if (await by.count()) { const p = by.locator("xpath=.."); await p.scrollIntoViewIfNeeded(); await shot(p, `post-${vp}-byline`); } else notes.push(`no byline element ${vp}`);
  if (vp === "1440" || vp === "375") {
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
    await page.evaluate(() => window.scrollTo(0, 800)); await page.waitForTimeout(1200);
    await shot(page, `post-${vp}-stickybar`);
  }
  if (vp === "1440") {
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await page.waitForTimeout(800);
    const fb = page.locator('xpath=//*[contains(text(),"Season 01 starts in 2027")]').first();
    if (await fb.count()) { const sec = fb.locator("xpath=ancestor::section[1]"); await shot((await sec.count()) ? sec : fb.locator("xpath=../.."), `post-1440-footerbanner`); } else notes.push("footer banner text not found");
  }
  await page.waitForTimeout(500);
  consoleRep.push({ vp, ...ctx.qaRec, dialog: null }); await page.close(); await closeCtx(ctx);
}
for (const vp of ["1440", "375"]) {
  const ctx = await newCtx(browser, `popup-${vp}`, { vp, suppressPopup: false }); const page = await ctx.newPage();
  await page.goto(BASE + POST, { waitUntil: "load" }); await page.waitForTimeout(4000);
  notes.push(`popup ${vp}: dialog count=${await page.locator('[role=dialog]').count()}`);
  await shot(page, `post-${vp}-popup`); await page.close(); await closeCtx(ctx);
  const c2 = await newCtx(browser, `blog-${vp}`, { vp }); const p2 = await c2.newPage();
  await p2.goto(BASE + "/blog", { waitUntil: "load" }); await p2.waitForTimeout(1500);
  await shot(p2, `blog-${vp}-top`);
  if (vp === "375") {
    const fb = await p2.evaluate((P) => { const a = document.querySelector(`a[href="${P}"]`); const r = a.getBoundingClientRect(); return { bottom: Math.round(r.bottom + scrollY) }; }, POST);
    await p2.screenshot({ path: `${OUT}/blog-375-top.png`, fullPage: true, clip: { x: 0, y: 0, width: 375, height: fb.bottom + 24 } });
    await p2.locator(`a[href="${POST}"]`).first().screenshot({ path: `${OUT}/blog-375-featured.png` }); made.push("blog-375-featured.png");
    notes.push("blog-375-top clipped to y=0.." + (fb.bottom + 24));
  } await scrollThrough(p2); await fullShot(p2, `blog-${vp}-full`);
  await p2.close(); await closeCtx(c2);
}
await browser.close(); await new Promise(r => srv.close(r));
// console report
const lines = ["CONSOLE ERRORS ON THE POST, per viewport (production build, Season 01 on, guarded browser)", "Note: requests to blocked third-party hosts (gtag, fbevents, clarity) are expected to fail by design and are listed separately, not counted as site errors.", ""];
const isVendor = (t) => /googletagmanager|facebook\.net|clarity\.ms|google-analytics|net::ERR_BLOCKED_BY_CLIENT/.test(t);
for (const r of consoleRep) {
  const own = r.consoleErrors.filter(e => !isVendor(e.text) && !isVendor(e.loc || ""));
  const vend = r.consoleErrors.filter(e => isVendor(e.text) || isVendor(e.loc || ""));
  lines.push(`== viewport ${r.vp}: own console errors ${own.length}, uncaught page errors ${r.pageErrors.length}, local HTTP >=400 ${r.failed404.length}, blocked-vendor console errors ${vend.length}`);
  for (const e of own) lines.push("  console.error: " + e.text + " @ " + e.loc);
  for (const e of r.pageErrors) lines.push("  pageerror: " + e.text);
  for (const e of r.failed404) lines.push("  http " + e.status + " " + e.url);
  for (const e of vend) lines.push("  (vendor, expected) " + e.text.slice(0, 120));
  lines.push("  external requests intercepted: " + [...new Set(r.external.map(x => new URL(x.url).host))].join(", "));
}
fs.writeFileSync(`${EVD}/sentry-cycle1/console-post-shoot.txt`, lines.join("\n") + "\n");
const pl = fs.readFileSync(LOG, "utf8").trim().split("\n").map(l => JSON.parse(l)).filter(l => l.kind !== "marker");
notes.push(`proxy requests during shoot: ${pl.length}, not denied: ${pl.filter(l => !l.decision.startsWith("denied")).length}`);
fs.writeFileSync(`${EVD}/sentry-cycle1/fullpage-verify.txt`, fullLog.join('\n')+'\n'); console.log(fullLog.join('\n')); console.log(made.join("\n")); console.log(notes.join("\n")); console.log(lines.join("\n"));
