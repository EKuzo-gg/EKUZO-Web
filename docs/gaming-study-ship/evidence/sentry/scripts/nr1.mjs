import fs from "node:fs";
import { createRequire } from "node:module";
import { launchGuarded, mk, S1, save, EV, sleep } from "./sentry-lib.mjs";
const require = createRequire("/Users/jamiefitch/Projects/ekuzo-web/.claude/worktrees/gaming-study-ship/package.json"); const sharp = require("sharp");
fs.mkdirSync(`${EV}/nr1`, { recursive: true });
const paths = ["/", "/blog", "/programs/ekuzo-camps", "/programs/ekuzo101", "/programs/ekuzo-teams", "/season1", "/blog/should-you-ban-fortnite"];
const servers = { A: "http://localhost:3311", B: "http://localhost:3312" };
const browser = await launchGuarded(); const out = {};
const slug = (p) => p === "/" ? "home" : p.replace(/^\//, "").replace(/\//g, "_");
const isV = t => /ERR_BLOCKED_BY_CLIENT|googletagmanager|facebook\.net|clarity\.ms/.test(t);
for (const [sv, base] of Object.entries(servers)) for (const vp of ["1440", "375"]) for (const p of paths) {
  const key = `${sv}|${vp}|${p}`; const o = {};
  const ctx = await mk(browser, `nr1-${key}`, { vp, suppressPopup: true }); const page = await ctx.newPage();
  await page.goto(base + p, { waitUntil: "load" }).catch(e => { o.gotoErr = String(e).slice(0, 100); }); await page.waitForTimeout(2500);
  await page.screenshot({ path: `${EV}/nr1/${sv}-${slug(p)}-${vp}-top.png` });
  await page.evaluate(() => scrollTo(0, 800)); await page.waitForTimeout(1500);
  o.sticky = await page.evaluate(() => { const els = [...document.querySelectorAll("div.fixed.bottom-0")]; return els.map(e => e.outerHTML.replace(/\s+/g, " ")); });
  o.stickyVisible = await page.evaluate(() => [...document.querySelectorAll("div.fixed.bottom-0")].map(e => getComputedStyle(e).transform));
  o.consoleErrors = ctx.qaRec.consoleErrors.filter(e => !isV(e.text) && !isV(e.loc || "")).map(e => e.text.replace(/localhost:\d+/g, "HOST") + " @ " + (e.loc || "").replace(/localhost:\d+/g, "HOST"));
  o.pageErrors = ctx.qaRec.pageErrors.map(e => e.text); o.http = ctx.qaRec.failed404.map(h => h.status + " " + h.url.replace(/localhost:\d+/, "HOST")); o.status = null;
  await ctx.close();
  // popup timing
  const c2 = await mk(browser, `nr1t-${key}`, { vp, suppressPopup: false }); const p2 = await c2.newPage(); const t0 = Date.now();
  await p2.goto(base + p, { waitUntil: "load" }).catch(() => {}); const tl = Date.now() - t0; let opened = null;
  for (let i = 0; i < 80; i++) { if (await p2.locator(S1).count()) { opened = Date.now() - t0; break; } await sleep(100); }
  o.popupOpenedMs = opened === null ? null : Math.round(opened / 500) * 500; o.popupOpenedMsRaw = opened; o.finalUrl = p2.url().replace(/localhost:\d+/, "HOST");
  await c2.close(); out[key] = o; console.log(key, "popup", o.popupOpenedMsRaw, "errs", o.consoleErrors.length, "stickyEls", o.sticky.length);
}
await browser.close(); save("nr1/nr1-raw.json", out);
// diff
const lines = ["NR-1 diff, branch (A, 3311, mode on) vs origin/main a449abc (B, 3312, mode on, same fake env)", ""];
let diffs = 0;
for (const vp of ["1440", "375"]) for (const p of paths) {
  const a = out[`A|${vp}|${p}`], b = out[`B|${vp}|${p}`]; const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
  const stickyEq = same(a.sticky, b.sticky), errEq = same(a.consoleErrors, b.consoleErrors) && same(a.pageErrors, b.pageErrors) && same(a.http, b.http);
  const popupEq = (a.popupOpenedMs === null) === (b.popupOpenedMs === null) && Math.abs((a.popupOpenedMsRaw || 0) - (b.popupOpenedMsRaw || 0)) < 1200 && a.finalUrl === b.finalUrl;
  const ia = await sharp(`${EV}/nr1/A-${slug(p)}-${vp}-top.png`).raw().toBuffer({ resolveWithObject: true }), ib = await sharp(`${EV}/nr1/B-${slug(p)}-${vp}-top.png`).raw().toBuffer({ resolveWithObject: true });
  let pix = null; if (ia.info.width === ib.info.width && ia.info.height === ib.info.height) { let n = 0; const A = ia.data, B = ib.data, ch = ia.info.channels; for (let i = 0; i < A.length; i += ch) if (Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]) > 30) n++; pix = (100 * n / (A.length / ch)).toFixed(3) + "%"; } else pix = "size differs";
  const flag = !(stickyEq && errEq && popupEq) ? "DIFF" : "same"; if (flag === "DIFF") diffs++;
  lines.push(`${vp} ${p}: sticky bar HTML ${stickyEq ? "identical" : "DIFFERS"} | console/page/http errors ${errEq ? "identical" : "DIFFER"} | popup open A=${a.popupOpenedMsRaw}ms B=${b.popupOpenedMsRaw}ms ${popupEq ? "same" : "DIFFERS"} (final ${a.finalUrl}) | top-screenshot pixel diff ${pix} | own errors A=${a.consoleErrors.length} B=${b.consoleErrors.length} | sticky elements A=${a.sticky.length} B=${b.sticky.length}`);
  if (!errEq) { lines.push("   A errors: " + JSON.stringify([...a.consoleErrors, ...a.http])); lines.push("   B errors: " + JSON.stringify([...b.consoleErrors, ...b.http])); }
  if (!stickyEq) { lines.push("   A sticky: " + a.sticky.join(" || ").slice(0, 400)); lines.push("   B sticky: " + b.sticky.join(" || ").slice(0, 400)); }
}
lines.push("", `rows with a DIFF flag: ${diffs}`);
fs.writeFileSync(`${EV}/nr1/nr1-diff.txt`, lines.join("\n") + "\n"); console.log(lines.join("\n"));
