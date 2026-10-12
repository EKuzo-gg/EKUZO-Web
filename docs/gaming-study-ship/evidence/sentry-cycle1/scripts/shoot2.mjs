import fs from "node:fs";
import { startProxy } from "./proxy.mjs";
import { launchGuarded, newCtx, closeCtx, scrollThrough, BASE, POST } from "./lib.mjs";
const OUT = "/Users/jamiefitch/Projects/ekuzo-web/.claude/worktrees/gaming-study-ship/docs/gaming-study-ship/screenshots";
const srv = {close:(cb)=>cb&&cb()};
const browser = await launchGuarded(); const notes = [];
for (const vp of ["1440", "375"]) {
  const ctx = await newCtx(browser, `s2-${vp}`, { vp }); const page = await ctx.newPage();
  await page.goto(BASE + POST, { waitUntil: "load" }); await page.waitForTimeout(1500); await scrollThrough(page);
  // opening: from byline through first H2
  const box = await page.evaluate(() => {
    const by = [...document.querySelectorAll("span")].find(e => [...e.childNodes].some(n => n.nodeType === 3 && /Updated/.test(n.textContent)));
    const h2 = document.querySelector("h2");
    let c = by; for (let i = 0; i < 5 && c.parentElement && !/Karlin|Oei/.test(c.textContent); i++) c = c.parentElement; const sp = [...document.querySelectorAll('p')].find(e => /^\s*Short answer/.test(e.textContent)); const r1 = (sp || c).getBoundingClientRect(), r2 = h2.getBoundingClientRect(); const rb = c.getBoundingClientRect(); if (rb.top < r1.top) { Object.defineProperty(r1, 'top', { value: rb.top }); }
    return { top: r1.top + scrollY - 24, bottom: r2.bottom + scrollY + 24, vw: innerWidth };
  });
  await page.screenshot({ path: `${OUT}/post-${vp}-opening.png`, fullPage: true, clip: { x: 0, y: Math.max(0, box.top), width: box.vw, height: box.bottom - box.top } });
  notes.push(`opening ${vp} ${JSON.stringify(box)}`);
  if (vp === "1440") {
    const sb = await page.evaluate(() => {
      const h = [...document.querySelectorAll("h2")].find(e => /^Sources/i.test(e.textContent.trim()));
      let last = h, n = h.nextElementSibling, i = 0;
      while (n && n.tagName !== "H2" && i < 6) { if (n.getBoundingClientRect().height > 0) last = n; n = n.nextElementSibling; i++; }
      const r1 = h.getBoundingClientRect(), r2 = last.getBoundingClientRect();
      return { top: r1.top + scrollY - 24, bottom: r2.bottom + scrollY + 24, left: Math.max(0, r1.left - 24), width: Math.min(innerWidth, 900), sibs: i };
    });
    notes.push("sources " + JSON.stringify(sb));
    console.log(JSON.stringify(sb)); if (sb) await page.screenshot({ path: `${OUT}/post-1440-sources.png`, fullPage: true, clip: { x: sb.left, y: sb.top, width: sb.width, height: sb.bottom - sb.top } });
  }
  await page.close(); await closeCtx(ctx);
}
const posts = { "what-your-kids-gaming-is-telling-you": "kids-gaming", "league-of-legends-youth-development": "lol", "should-you-ban-fortnite": "fortnite", "what-homeschool-parents-taught-us-about-gaming": "homeschool", "when-your-sons-only-friends-are-online": "sons-friends" };
const ctx = await newCtx(browser, "inbound", { vp: "1440" });
for (const [slug, short] of Object.entries(posts)) {
  const page = await ctx.newPage(); await page.goto(BASE + "/blog/" + slug, { waitUntil: "load" }); await page.waitForTimeout(1200);
  const info = await page.evaluate(() => {
    const a = [...document.querySelectorAll('a[href*="gaming-study-13-7"]')].filter(x => x.closest(".blog-content") || x.closest("main") || true);
    if (!a.length) return null;
    const el = a[0]; el.scrollIntoView({ block: "center" });
    const p = el.closest("p,li,blockquote,div") || el; const r = p.getBoundingClientRect();
    return { count: a.length, href: a.map(x => x.getAttribute("href")), text: p.textContent.slice(0, 400), y: r.top + scrollY, h: r.height };
  });
  notes.push(`${slug}: ${JSON.stringify(info)}`);
  if (info) {
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => { const el = document.querySelector('a[href*="gaming-study-13-7"]'); const p = el.closest("p,li,blockquote,div") || el; const b = p.getBoundingClientRect(); return { top: b.top + scrollY, h: b.height }; });
    const y0 = Math.max(0, r.top - 260);
    await page.screenshot({ path: `${OUT}/inbound-${short}-1440.png`, fullPage: true, clip: { x: 0, y: y0, width: 1440, height: Math.min(700, r.h + 520) } });
  }
  await page.close();
}
await closeCtx(ctx); await browser.close(); await new Promise(r => srv.close(r));
console.log(notes.join("\n"));
