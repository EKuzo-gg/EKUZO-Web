import { launchGuarded, mk, BASE, POST, S1, NL_TEXT, nlState, storage, events, save, sleep, EV } from "./sentry-lib.mjs";
import { VIEWPORTS } from "./lib.mjs";
const R = []; const rec = (id, sev, note, extra) => { R.push({ id, sev, note, ...(extra ? { extra } : {}) }); console.log(`[${sev}] ${id}: ${String(note).slice(0, 900)}`); };
const browser = await launchGuarded();
// path variants
for (const [label, p] of [].concat(0 ? [["trailing slash", POST + "/"], ["uppercase", POST.toUpperCase()], ["/extra", POST + "/extra"]] : [])) {
  const ctx = await mk(browser, "b-path", { vp: "1440" }); const page = await ctx.newPage(); const errs = []; page.on("pageerror", e => errs.push(String(e).slice(0, 120)));
  const resp = await page.goto(BASE + p, { waitUntil: "load" }); await page.waitForTimeout(500);
  const finalUrl = page.url().replace(BASE, ""); const nl = await nlState(page); await page.evaluate(() => scrollTo(0, 900)); await page.waitForTimeout(1500); const nl2 = await nlState(page);
  const bar = await page.locator("div.fixed.bottom-0", { hasText: /Join Season 01/ }).count(); const popup = await page.waitForSelector(S1, { timeout: 5000 }).then(() => 1).catch(() => 0);
  rec(`path: ${label}`, errs.length || nl2.nlDialogs.length || nl2.fixedEmailInputs ? "FINDING" : "info", `status ${resp.status()} (after redirects), final URL ${finalUrl.slice(0, 90)}, newsletter UI after 900px scroll: dialogs ${nl2.nlDialogs.length}, fixed email inputs ${nl2.fixedEmailInputs}, copy hits ${nl2.hits.length}; S01 sticky bar=${bar}; S01 popup auto-open=${popup}; page errors=${errs.length}`);
  await ctx.close();
}
// reduced motion + 320 + zoom
const clipScan = () => {
  const out = []; const els = [...document.querySelectorAll("h1,h2,h3,p,li,a,button,figcaption,span,div")];
  for (const e of els) { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
    const hidX = ["hidden", "clip"].includes(cs.overflowX), hidY = ["hidden", "clip"].includes(cs.overflowY);
    const txt = (e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())); if (!txt) continue;
    if ((hidX && e.scrollWidth > e.clientWidth + 2) || (hidY && e.scrollHeight > e.clientHeight + 2) || r.right > innerWidth + 1 || r.left < -1) out.push({ tag: e.tagName, cls: (e.className || "").toString().slice(0, 50), text: e.textContent.trim().slice(0, 50), sw: e.scrollWidth, cw: e.clientWidth, sh: e.scrollHeight, ch: e.clientHeight, left: Math.round(r.left), right: Math.round(r.right) }); }
  return out.slice(0, 10);
};
const modes = [
  ["320px wide", { viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, userAgent: VIEWPORTS["375"].userAgent }, null],
  ["200% browser zoom (viewport 720 wide)", { viewport: { width: 720, height: 450 } }, null],
  ["200% text zoom at 1440 (root font-size 200%)", { viewport: { width: 1440, height: 900 } }, () => { document.documentElement.style.fontSize = "200%"; }],
  ["320px + reduced motion", { viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, userAgent: VIEWPORTS["375"].userAgent }, "rm"],
];
let n = 0;
for (const [label, vpOpts, extra] of modes) {
  VIEWPORTS["zz" + n] = vpOpts; const ctx = await mk(browser, "b-zoom", { vp: "zz" + n, suppressPopup: true }); const page = await ctx.newPage(); const errs = []; page.on("pageerror", e => errs.push(String(e).slice(0, 120)));
  if (extra === "rm") await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(BASE + POST, { waitUntil: "load" }); await page.waitForTimeout(1200); if (typeof extra === "function") await page.evaluate(extra);
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } scrollTo(0, 0); }); await page.waitForTimeout(600);
  const base = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, iw: innerWidth }));
  const regions = {};
  const scan = async (name, sel) => { regions[name] = await page.evaluate((s) => { const root = document.querySelector(s); if (!root) return "region not found"; const out = []; for (const e of root.querySelectorAll("*")) { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; const txt = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); if (!txt) continue; const hx = ["hidden", "clip"].includes(cs.overflowX), hy = ["hidden", "clip"].includes(cs.overflowY); if ((hx && e.scrollWidth > e.clientWidth + 2) || (hy && e.scrollHeight > e.clientHeight + 2) || r.right > innerWidth + 1 || r.left < -1) out.push(`${e.tagName}.${(e.className || "").toString().slice(0, 30)} "${e.textContent.trim().slice(0, 30)}" sw${e.scrollWidth}/cw${e.clientWidth} sh${e.scrollHeight}/ch${e.clientHeight} L${Math.round(r.left)} R${Math.round(r.right)}`); } return out.slice(0, 6); }, sel); };
  await scan("hero area (h1 section)", "main section, article"); // broad first
  const heroSel = await page.evaluate(() => { let e = document.querySelector("h1"); for (let i = 0; i < 3 && e.parentElement; i++) e = e.parentElement; e.setAttribute("data-qa-hero", "1"); return "[data-qa-hero]"; });
  await scan("hero", heroSel);
  const g = await page.evaluate(() => { const i = document.querySelector('img[alt^="Same game, two"]'); const f = i.closest("figure") || i.parentElement; f.setAttribute("data-qa-g", "1"); return true; }); await scan("graphic", "[data-qa-g]");
  const kr = await page.evaluate(() => { const h = [...document.querySelectorAll("*")].find(x => x.children.length === 0 && /^Keep Reading$/i.test(x.textContent.trim())); let e = h; for (let i = 0; i < 3; i++) e = e.parentElement; e.setAttribute("data-qa-kr", "1"); return true; }); await scan("keep reading", "[data-qa-kr]");
  await page.evaluate(() => scrollTo(0, 900)); await page.waitForTimeout(1200);
  await page.evaluate(() => { const b = [...document.querySelectorAll("div.fixed.bottom-0")].find(d => /Join Season 01/.test(d.textContent)); b && b.setAttribute("data-qa-bar", "1"); }); await scan("sticky bar", "[data-qa-bar]");
  const barBox = await page.evaluate(() => { const b = document.querySelector("[data-qa-bar]"); if (!b) return null; const r = b.getBoundingClientRect(); return { h: Math.round(r.height), w: Math.round(r.width), vh: innerHeight, covers: +(r.height / innerHeight * 100).toFixed(1) }; });
  const f = `${EV}/zoom-${n}.png`; await page.screenshot({ path: f });
  const firstFold = `${EV}/zoom-${n}-top.png`; await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(400); await page.screenshot({ path: firstFold });
  const flagged = Object.entries(regions).filter(([k, v]) => Array.isArray(v) && v.length);
  rec(`zoom/narrow: ${label}`, flagged.length || base.doc > base.iw || errs.length ? "FINDING?" : "ok", `docScrollWidth ${base.doc} vs innerWidth ${base.iw}; sticky bar box ${JSON.stringify(barBox)}; flagged regions: ${flagged.length ? JSON.stringify(Object.fromEntries(flagged)) : "none"}; page errors ${errs.length}; screenshots zoom-${n}.png, zoom-${n}-top.png`, regions);
  await ctx.close(); n++;
}
save("b4-results.json", R); await browser.close();
