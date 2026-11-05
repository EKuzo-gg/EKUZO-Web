import { chromium, newCtx, mobile, desk, AFTER, BEFORE, stats, ADS } from "./lib.mjs";
import fs from "fs";
const browser = await chromium.launch();
const out = { blocked: 0, pages: {}, bgKeys: {} };
async function check(base, tag, ad, extra = "", opts = mobile) {
  const ctx = await newCtx(browser, opts);
  const page = await ctx.newPage();
  const reqs = [];
  page.on("response", (r) => { const u = r.url(); if (r.request().resourceType() === "image" || /\/images\//.test(u)) reqs.push([r.status(), u.replace(base, "")]); });
  page.on("requestfailed", (r) => reqs.push(["FAIL", r.url().replace(base, "")]));
  await page.goto(`${base}/season1?ad=${ad}${extra}&utm_source=meta`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(2500);
  const info = await page.evaluate(() => ({
    keys: Object.keys(IMG), data: Object.entries(IMG).filter(([k, v]) => /^data:/.test(v)).map(([k]) => k),
    bgs: (D.find((x) => x.id === (new URLSearchParams(location.search).get("ad"))) || {}).bgs || [],
    imgsInDom: [...document.images].map((i) => [i.currentSrc.slice(0, 80), i.naturalWidth]),
  }));
  await ctx.close();
  const bad = reqs.filter((r) => r[0] !== 200 && r[0] !== 304);
  const dom0 = info.imgsInDom.filter(([s, w]) => w === 0 && !/^data:/.test(s) && s);
  return { n: reqs.length, bad, dataKeys: info.data, bgs: info.bgs, domBroken: dom0, keys: info.keys };
}
const allKeys = new Set(), bgSet = new Set();
for (const ad of ADS) {
  const r = await check(AFTER, "after", ad);
  r.keys.forEach((k) => allKeys.add(k)); r.bgs.forEach((b) => bgSet.add(b.k));
  out.pages[ad] = { n: r.n, bad: r.bad, dataKeys: r.dataKeys, bgs: r.bgs.map((b) => b.k), domBroken: r.domBroken };
  console.log(ad, "requests", r.n, "bad", JSON.stringify(r.bad), "data:", r.dataKeys.length, "domBroken", r.domBroken.length);
}
for (const [ad, ex] of [["d2", "&hero=amount"], ["d2", "&hero=games"], ["d4", "&hero=shortlist"], ["d4", "&hero=screentime"]]) {
  const r = await check(AFTER, "after", ad, ex);
  out.pages[ad + ex] = { n: r.n, bad: r.bad, dataKeys: r.dataKeys, domBroken: r.domBroken };
  console.log(ad + ex, "requests", r.n, "bad", JSON.stringify(r.bad));
}
// Every IMG key and every bg key fetched directly
const ctx = await newCtx(browser, mobile); const pg = await ctx.newPage();
await pg.goto(`${AFTER}/season1?ad=d1`, { waitUntil: "load" });
const imgmap = await pg.evaluate(() => IMG);
await ctx.close();
for (const k of new Set([...allKeys, ...bgSet])) {
  const u = imgmap[k];
  if (!u) { out.bgKeys[k] = "NOT IN IMG"; continue; }
  const r = await fetch(AFTER + u); const b = (await r.arrayBuffer()).byteLength;
  out.bgKeys[k] = `${r.status} ${r.headers.get("content-type")} ${b}B ${u}`;
}
// Before-build baseline for the missing bg key
const cb = await newCtx(browser, mobile); const pb = await cb.newPage();
await pb.goto(`${BEFORE}/season1?ad=d1`, { waitUntil: "load" });
out.beforeHasEsportsRoom = await pb.evaluate(() => "esports-room" in IMG);
out.beforeDataKeys = await pb.evaluate(() => Object.entries(IMG).filter(([k, v]) => /^data:/.test(v)).map(([k]) => k));
await cb.close();
out.blocked = stats.blocked;
fs.writeFileSync("images.json", JSON.stringify(out, null, 1));
console.log(JSON.stringify(out.bgKeys, null, 1), "beforeHasEsportsRoom", out.beforeHasEsportsRoom, "blocked", stats.blocked);
await browser.close();
