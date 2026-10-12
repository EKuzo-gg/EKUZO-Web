import { launchGuarded, mk, closeCtx, BASE, POST, S1, save, center, cdpTouch, sleep } from "./sentry-lib.mjs";
import { VIEWPORTS } from "./lib.mjs";
import fs from "node:fs";
const UA = VIEWPORTS["375"].userAgent;
const phone = (w, h, d) => ({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: d, userAgent: UA });
VIEWPORTS["375d2"] = VIEWPORTS["375"]; VIEWPORTS["375d3"] = phone(375, 667, 3);
VIEWPORTS["768d2"] = { viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2 };
VIEWPORTS["1440d1"] = VIEWPORTS["1440"]; VIEWPORTS["1440d2"] = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 };
VIEWPORTS["1024d1"] = VIEWPORTS["1024"]; VIEWPORTS["768d1"] = VIEWPORTS["768"];
const R = {}; const out = [];
const browser = await launchGuarded();
const scrollAll = (page) => page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); });
// 1. Short answer
R.shortAnswer = {};
for (const vp of ["1440", "375"]) {
  const ctx = await mk(browser, `a1-${vp}`, { vp, suppressPopup: true }); const page = await ctx.newPage();
  await page.goto(BASE + POST, { waitUntil: "load" }); await page.waitForTimeout(1200);
  const r = await page.evaluate(() => { const p = [...document.querySelectorAll("p")].find(e => /^\s*Short answer/.test(e.textContent)); return p ? { start: p.textContent.slice(0, 60), json: JSON.stringify(p.textContent.slice(0, 45)), html: p.innerHTML.slice(0, 140), inner: p.innerText.slice(0, 40) } : null; });
  R.shortAnswer[vp] = r; await ctx.close();
}
const html = await (await fetch(BASE + POST)).text();
const m = html.match(/Short answer:?[^]{0,80}?one study/); R.shortAnswer.servedHtml = m ? m[0] : null;
const m2 = html.match(/<p[^>]*>(?:(?!<\/p>)[^])*Short answer(?:(?!<\/p>)[^])*?<\/p>/); R.shortAnswer.servedP = m2 ? m2[0].slice(0, 300) : null;
// 2. hero sharpness
R.hero = [];
const NAT_ASPECT = 2400 / 1260;
for (const [key, label] of [["375d2", "375x667 DPR2"], ["375d3", "375x667 DPR3"], ["768d2", "768x1024 DPR2"], ["1440d1", "1440x900 DPR1"], ["1440d2", "1440x900 DPR2"]]) {
  const ctx = await mk(browser, `a2-${key}`, { vp: key, suppressPopup: true }); const page = await ctx.newPage();
  await page.goto(BASE + POST, { waitUntil: "load" }); await page.waitForTimeout(800);
  await page.waitForFunction(() => { const i = document.querySelector('img[alt^="A phone showing the X post"]'); return i && i.complete && i.naturalWidth > 0; }, null, { timeout: 15000 });
  await page.waitForTimeout(800);
  const h = await page.evaluate(() => { const i = document.querySelector('img[alt^="A phone showing the X post"]'); const r = i.getBoundingClientRect(); const cs = getComputedStyle(i); return { currentSrc: i.currentSrc, srcset: i.getAttribute("srcset"), sizes: i.getAttribute("sizes"), nw: i.naturalWidth, nh: i.naturalHeight, rw: r.width, rh: r.height, fit: cs.objectFit, dpr: devicePixelRatio, vw: innerWidth, loading: i.loading, parentH: i.parentElement.getBoundingClientRect().height }; });
  const scale = Math.max(h.rw / h.nw, h.rh / h.nh); const drawnW = h.nw * scale;  // drawn width in CSS px given object-cover on actual file dims
  const drawnW2 = Math.max(h.rw, h.rh * NAT_ASPECT);
  const ratio = h.nw / (drawnW2 * h.dpr);
  const wParam = (h.currentSrc.match(/[?&]w=(\d+)/) || [])[1];
  const widths = (h.srcset || "").split(",").map(s => s.trim().split(" ")).map(([u, d]) => ({ w: (u.match(/[?&]w=(\d+)/) || [])[1], d }));
  const maxCand = Math.max(...widths.map(x => Number(x.w)));
  const row = { label, ...h, drawnW_fromContract: +drawnW2.toFixed(1), drawnW_fromFile: +drawnW.toFixed(1), ratio: +ratio.toFixed(3), wParam, maxCand, srcsetWidths: widths.map(x => x.w + (x.d ? " " + x.d : "")).join(", "), pass: ratio >= 1.0 || Number(wParam) >= maxCand };
  R.hero.push(row);
  const f = `/Users/jamiefitch/Projects/ekuzo-web/.claude/worktrees/gaming-study-ship/docs/gaming-study-ship/evidence/sentry-cycle1/hero-${key}.png`;
  const el = page.locator('img[alt^="A phone showing the X post"]').locator("xpath=..");
  await el.screenshot({ path: f }); row.shot = f.split("/").pop();
  await ctx.close();
}
// 3. sideways scroll
R.overflow = [];
const posts = { post: POST, fortnite: "/blog/should-you-ban-fortnite", friends: "/blog/when-your-sons-only-friends-are-online" };
for (const vp of ["375d2", "768d1", "1024d1"]) for (const [tag, path] of Object.entries(posts)) {
  const ctx = await mk(browser, `a3-${vp}-${tag}`, { vp, suppressPopup: true }); const page = await ctx.newPage();
  await page.goto(BASE + path, { waitUntil: "load" }); await page.waitForTimeout(1200); await scrollAll(page); await page.waitForTimeout(600);
  const m = await page.evaluate(() => {
    const de = document.documentElement;
    const base = { innerWidth, clientWidth: de.clientWidth, docScrollWidth: de.scrollWidth, bodyScrollWidth: document.body.scrollWidth, vv: visualViewport ? visualViewport.width : null, bodyOverflowX: getComputedStyle(document.body).overflowX, htmlOverflowX: getComputedStyle(de).overflowX, docH: de.scrollHeight };
    window.scrollTo(200, 0); base.scrollXAfterScrollTo200 = scrollX;
    const off = []; const lim = innerWidth + 0.5;
    for (const e of document.querySelectorAll("body *")) { const r = e.getBoundingClientRect(); if (r.width > 0 && r.right > lim) { let anc = e.parentElement, clipped = false; while (anc && anc !== document.body) { const ox = getComputedStyle(anc).overflowX; if (ox === "hidden" || ox === "clip" || ox === "auto" || ox === "scroll") { clipped = true; break; } anc = anc.parentElement; } off.push({ tag: e.tagName, cls: (e.getAttribute("class") || "").slice(0, 80), right: Math.round(r.right), width: Math.round(r.width), clippedByAncestor: clipped, pos: getComputedStyle(e).position }); } }
    base.offenders = off.sort((a, b) => b.right - a.right).slice(0, 8); base.offenderCount = off.length; base.offendersUnclipped = off.filter(o => !o.clippedByAncestor).length;
    return base;
  });
  let swipe = null;
  if (vp === "375d2") { await page.evaluate(() => scrollTo(0, 600)); const x0 = await page.evaluate(() => scrollX); await cdpTouch(ctx, page, { x: 300, y: 400 }, { x: 40, y: 400 }, 8); await page.waitForTimeout(500); swipe = { x0, x1: await page.evaluate(() => scrollX), y: await page.evaluate(() => scrollY) }; }
  R.overflow.push({ vp, tag, ...m, swipe }); await ctx.close();
}
save("a-results.json", R);
console.log(JSON.stringify(R.shortAnswer, null, 1));
for (const h of R.hero) console.log(h.label, "src", h.currentSrc.replace(/.*\/_next/, "/_next"), "nw", h.nw, "box", Math.round(h.rw), "x", Math.round(h.rh), "drawnW", h.drawnW_fromContract, "ratio", h.ratio, h.pass ? "PASS" : "FAIL", "cands", h.srcsetWidths);
for (const o of R.overflow) console.log(o.vp, o.tag, "iw", o.innerWidth, "cw", o.clientWidth, "doc", o.docScrollWidth, "body", o.bodyScrollWidth, "scrollX", o.scrollXAfterScrollTo200, "swipe", JSON.stringify(o.swipe), "offenders", o.offenderCount, "unclipped", o.offendersUnclipped, JSON.stringify(o.offenders.slice(0, 3)));
await browser.close();
