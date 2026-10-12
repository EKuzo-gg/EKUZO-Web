import { launchGuarded, mk, BASE, POST, save } from "./sentry-lib.mjs";
import { VIEWPORTS } from "./lib.mjs";
import sharp from "/Users/jamiefitch/Projects/ekuzo-web/.claude/worktrees/gaming-study-ship/node_modules/sharp/lib/index.js";
const R = JSON.parse((await import("node:fs")).readFileSync("/Users/jamiefitch/Projects/ekuzo-web/.claude/worktrees/gaming-study-ship/docs/gaming-study-ship/evidence/sentry-cycle1/a-results.json", "utf8"));
// resource widths
const rows = [];
for (const h of R.hero) {
  const u = new URL(h.currentSrc.replace(/&amp;/g, "&")); const buf = Buffer.from(await (await fetch(BASE + u.pathname + u.search, { headers: { accept: "image/webp,image/avif,image/*" } })).arrayBuffer());
  const md = await sharp(buf).metadata();
  const ratio = md.width / (h.drawnW_fromContract * h.dpr);
  rows.push({ label: h.label, candidate_w: h.wParam, sizesAttr: h.sizes, resourceWidthPx: md.width, resourceHeightPx: md.height, resourceBytes: buf.length, format: md.format, drawnCssW: h.drawnW_fromContract, dpr: h.dpr, ratio: +ratio.toFixed(3), pass: ratio >= 1.0 });
  console.log(rows.at(-1));
}
const src = await sharp("/Users/jamiefitch/Projects/ekuzo-web/.claude/worktrees/gaming-study-ship/public/images/gaming-study-13-7-hero.jpg").metadata();
console.log("source file", src.width, src.height);
save("a-hero-resource.json", { source: { w: src.width, h: src.height }, rows });
// layout metrics for overflow
const browser = await launchGuarded(); const lm = [];
for (const vp of ["375", "768", "1024"]) for (const [tag, path] of [["post", POST], ["fortnite", "/blog/should-you-ban-fortnite"], ["friends", "/blog/when-your-sons-only-friends-are-online"]]) {
  const ctx = await mk(browser, `a3b-${vp}-${tag}`, { vp, suppressPopup: true }); const page = await ctx.newPage();
  await page.goto(BASE + path, { waitUntil: "load" }); await page.waitForTimeout(1500);
  const cdp = await ctx.newCDPSession(page); const m = await cdp.send("Page.getLayoutMetrics");
  const info = await page.evaluate(() => { const q = (s) => document.querySelector(s); const img = [...document.querySelectorAll("img")].find(i => i.className.includes("left-1/2") && i.className.includes("z-20")); const form = [...document.querySelectorAll("form")].find(f => f.getBoundingClientRect().right > innerWidth); const anc = (e) => { const o = []; while (e && e !== document.documentElement) { const cs = getComputedStyle(e); o.push(`${e.tagName}.${(e.getAttribute("class") || "").slice(0, 40)} ox=${cs.overflowX}`); e = e.parentElement; } return o.slice(0, 6); };
    return { htmlOx: getComputedStyle(document.documentElement).overflowX, bodyOx: getComputedStyle(document.body).overflowX, imgSrc: img && (img.currentSrc || img.src).slice(-60), imgAnc: img && anc(img), formParentChain: form && anc(form), formText: form && form.parentElement.innerText.replace(/\s+/g, " ").slice(0, 100) }; });
  lm.push({ vp, tag, cssContentSize: m.cssContentSize, cssLayoutViewport: m.cssLayoutViewport, ...info });
  console.log(vp, tag, JSON.stringify(m.cssContentSize), JSON.stringify(m.cssLayoutViewport), info.htmlOx, info.bodyOx, info.imgSrc, "|", info.formText);
  await ctx.close();
}
save("a-layoutmetrics.json", lm); await browser.close();
