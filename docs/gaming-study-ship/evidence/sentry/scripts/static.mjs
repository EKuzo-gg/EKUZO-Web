import fs from "node:fs";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { launchGuarded, mk, BASE, POST, save, EV, sleep } from "./sentry-lib.mjs";
const WT = "/Users/jamiefitch/Projects/ekuzo-web/.claude/worktrees/gaming-study-ship";
const require = createRequire(WT + "/package.json"); const sharp = require("sharp");
const R = []; const rec = (id, vp, pass, notes, extra) => { R.push({ id, vp, pass, notes, ...(extra ? { extra } : {}) }); console.log(pass ? "PASS" : "FAIL", id, vp, notes.slice(0, 700)); };
const html = await (await fetch(BASE + POST)).text(); fs.writeFileSync(`${EV}/html/post.html`, html);
// TG-3
const blocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
let parsed = []; let parseErr = [];
for (const b of blocks) { try { parsed.push(JSON.parse(b)); } catch (e) { parseErr.push(String(e)); } }
const nodes = parsed.flatMap(p => p["@graph"] || [p]); const types = nodes.map(n => [].concat(n["@type"]).join("/"));
const faq = nodes.find(n => n["@type"] === "FAQPage"); const bp = nodes.find(n => n["@type"] === "BlogPosting"); const vo = nodes.filter(n => n["@type"] === "VideoObject");
const allText = JSON.stringify(parsed); const dates = [...new Set([...allText.matchAll(/"(date\w+|uploadDate)":"([^"]+)"/g)].map(m => m[1] + "=" + m[2]))];
rec("TG-3", "-", !parseErr.length && ["BlogPosting", "BreadcrumbList", "FAQPage", "VideoObject"].every(t => types.includes(t)) && faq?.mainEntity?.length === 5 && faq.mainEntity.some(q => q.name === "Is gaming good for kids' brains?" || q.name === "Is gaming good for kids’ brains?") && dates.filter(d => /^date(Published|Modified)=/.test(d)).every(d => d.includes("2026-10-12")), `blocks=${blocks.length} parseErrors=${parseErr.length} types=${JSON.stringify(types)} FAQ questions=${faq?.mainEntity?.length}: ${JSON.stringify(faq?.mainEntity?.map(q => q.name))} dates=${JSON.stringify(dates)} VideoObjects=${vo.length}; BlogPosting image=${JSON.stringify(bp?.image)}; headline=${bp?.headline}`);
rec("DT-1 (dates)", "-", dates.filter(d => /^date(Published|Modified)=/.test(d)).length === 2 && dates.filter(d => /^date(Published|Modified)=/.test(d)).every(d => d.includes("2026-10-12")), `JSON-LD ${JSON.stringify(dates)}`);
// AS-2
const og = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1], tw = html.match(/<meta name="twitter:image" content="([^"]+)"/)?.[1];
const dim = async (u) => { const r = await fetch(u.replace(/^https?:\/\/[^/]+/, BASE)); const b = Buffer.from(await r.arrayBuffer()); const m = await sharp(b).metadata(); return { status: r.status, w: m.width, h: m.height, type: r.headers.get("content-type"), bytes: b.length }; };
const og_d = await dim(og), tw_d = await dim(tw);
rec("AS-2", "-", /gaming-study-13-7-card\.jpg$/.test(og) && /gaming-study-13-7-card\.jpg$/.test(tw) && og_d.status === 200 && og_d.w === 1200 && og_d.h === 630, `og:image=${og} -> ${JSON.stringify(og_d)}; twitter:image=${tw} -> ${JSON.stringify(tw_d)} (served from local origin; absolute URL host is metadataBase)`);
// DT-2 visible byline
const vis = /Updated[\s\S]{0,40}October 12, 2026/.test(html.replace(/<!--.*?-->/g, ""));
rec("DT-2", "-", vis, `served HTML contains "Updated" + "October 12, 2026" in visible markup: ${vis}; fragment=${JSON.stringify((html.match(/Updated(?:<!-- -->)?\s*(?:<!-- -->)?[^<]{0,30}(?:<!-- -->)?[^<]{0,30}/) || [""])[0])}`);
// browser DOM checks CP-5 CP-18 CP-10 DT-3 CP-... 
const browser = await launchGuarded();
for (const vp of ["1440", "375"]) {
  const ctx = await mk(browser, `st-${vp}`, { vp, suppressPopup: true }); const page = await ctx.newPage(); await page.goto(BASE + POST, { waitUntil: "load" }); await page.waitForTimeout(1500);
  const g = await page.evaluate(() => {
    const img = document.querySelector('img[alt^="Same game, two different hours."]'); if (!img) return null;
    const col = document.querySelector(".blog-content"); const r = img.getBoundingClientRect(), cr = col.getBoundingClientRect();
    let fig = img; const prevP = (el) => { let e = el; while (e && e.parentElement !== col) e = e.parentElement; return e; };
    const top = prevP(img); const prev = top.previousElementSibling, next = top.nextElementSibling;
    return { alt: img.alt, w: Math.round(r.width), colW: Math.round(cr.width), centered: Math.round(Math.abs((r.left + r.width / 2) - (cr.left + cr.width / 2))), prevText: prev?.textContent.trim().slice(-60), nextText: next?.textContent.trim().slice(0, 40), src: img.currentSrc || img.src };
  });
  rec(`CP-5/CP-18 graphic (${vp})`, vp, !!g && /Everything around it is different\.$/.test(g.prevText) && /^In June a parent emailed me/.test(g.nextText) && (vp === "1440" ? g.w <= 560 && g.centered <= 2 : g.w >= g.colW - 2) && g.alt.startsWith("Same game, two different hours."), JSON.stringify(g), g);
  const kr = await page.evaluate(() => { const h = [...document.querySelectorAll("p")].find(e => e.textContent.trim() === "Keep Reading"); if (!h) return null; const sec = h.parentElement; return { hrefs: [...sec.querySelectorAll("a[href^='/blog/']")].map(a => a.getAttribute("href")), } });
  const want = ["what-homeschool-parents-taught-us-about-gaming", "should-you-ban-fortnite", "when-your-sons-only-friends-are-online"];
  const got = (kr?.hrefs || []).map(h => h.replace("/blog/", "")); const uniq = [...new Set(got)];
  rec(`CP-18 Keep Reading (${vp})`, vp, JSON.stringify(uniq.slice(0, 3)) === JSON.stringify(want), `cards in order: ${JSON.stringify(uniq)}`);
  if (vp === "1440") {
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await page.waitForTimeout(800);
    const fb = await page.evaluate(() => document.body.innerText.includes("Season 01 starts in 2027. Get them on the list.") && !/Every gamer deserves a team/.test(document.body.innerText));
    rec("CP-10/DT-3 footer banner (mode on)", vp, fb, `footer shows "Season 01 starts in 2027. Get them on the list." and not the dormant heading: ${fb}`);
  }
  await ctx.close();
}
const src = fs.readFileSync(WT + "/app/blog/gaming-study-13-7-years-younger-what-it-means-for-kids/page.tsx", "utf8");
rec("CP-10 source", "-", /FooterBanner[^>]*heading="Every gamer deserves a team"/.test(src.replace(/\s+/g, " ")), `FooterBanner heading string in page.tsx: ${/heading="Every gamer deserves a team"/.test(src)}`);
// /blog featured
{
  const ctx = await mk(browser, "blogidx", { vp: "1440", suppressPopup: true }); const page = await ctx.newPage(); await page.goto(BASE + "/blog", { waitUntil: "load" }); await page.waitForTimeout(1000);
  const f = await page.evaluate(() => { const feat = [...document.querySelectorAll("a[href^='/blog/']")].map(a => ({ href: a.getAttribute("href"), txt: a.textContent.replace(/\s+/g, " ").slice(0, 120), feat: /featured/i.test(a.textContent) || /featured/i.test(a.className) })); return feat; });
  const html2 = await page.content(); const fm = [...html2.matchAll(/[Ff]eatured/g)].length;
  save("json/blog-index-links.json", f);
  const h1 = await page.evaluate(() => { const first = document.querySelector("section a[href^='/blog/']"); const lab = [...document.querySelectorAll("span")].filter(e => /· Featured$/.test(e.textContent.trim())); return { firstHref: first?.getAttribute("href"), firstText: first?.textContent.replace(/\s+/g, " ").slice(0, 160), featuredLabelCount: lab.length, labelHrefs: lab.map(l => l.closest("a")?.getAttribute("href")) }; });
  rec("DT-3 /blog featured", "1440", h1.firstHref === POST && h1.featuredLabelCount === 1 && h1.labelHrefs[0] === POST, `first card href=${h1.firstHref} text="${h1.firstText}"; leaf nodes labelled Featured=${h1.featuredLabelCount}; all post links=${f.length}`, h1);
  const feats = execSync(`grep -n "featured" ${WT}/app/blog/page.tsx | head -20`).toString();
  const t = execSync(`grep -c "^ *featured: true," ${WT}/app/blog/page.tsx`).toString().trim(); const ff = execSync(`grep -n -B8 "^ *featured: true," ${WT}/app/blog/page.tsx | grep -E "slug|featured"`).toString();
  rec("DT-3 source featured: true count", "-", t === "1", `"featured: true" occurrences in app/blog/page.tsx = ${t}\n${ff}`);
  await ctx.close();
}
await browser.close(); save("results-static.json", R);
