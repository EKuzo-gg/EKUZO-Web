import { chromium, newCtx, throttle, mobile, desk, AFTER, BEFORE, stats, UA_M } from "./lib.mjs";
import fs from "fs";
const [runsArg, width, outFile, ...vars] = process.argv.slice(2);
const runs = Number(runsArg), opts = width === "1440" ? desk : mobile;
const browser = await chromium.launch();
async function one(base, v) {
  const ctx = await newCtx(browser, opts);
  const page = await ctx.newPage();
  await throttle(ctx, page);
  await page.addInitScript(() => {
    window.__ls = [];
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { if (e.hadRecentInput) continue;
      window.__ls.push({ t: Math.round(e.startTime), v: e.value, src: (e.sources || []).map((s) => { const n = s.node; let d = "?"; if (n && n.nodeType === 1) d = n.tagName.toLowerCase() + (n.id ? "#" + n.id : ""); return d; }) }); } }).observe({ type: "layout-shift", buffered: true });
  });
  const q = v === "noad" ? "utm_source=meta&utm_content=noad-qa" : `ad=${v}&utm_source=meta&utm_content=${v}-qa`;
  await page.goto(`${base}/season1?${q}`, { waitUntil: "load", timeout: 120000 });
  await page.waitForTimeout(4000);
  const ls = await page.evaluate(() => window.__ls);
  let max = 0, cur = 0, start = -1, last = -1;
  for (const e of ls) { if (start < 0 || e.t - last > 1000 || e.t - start > 5000) { cur = 0; start = e.t; } cur += e.v; last = e.t; if (cur > max) max = cur; }
  await ctx.close();
  return { cls: Number(max.toFixed(4)), shifts: ls.map((e) => [e.t, Number(e.v.toFixed(4)), e.src.slice(0, 2).join("|")]) };
}
const res = {};
for (const v of vars) {
  res[v] = { before: [], after: [] };
  for (let i = 0; i < runs; i++) {
    res[v].after.push(await one(AFTER, v));
    res[v].before.push(await one(BEFORE, v));
  }
  const med = (a) => a.map((r) => r.cls).sort((x, y) => x - y)[Math.floor(a.length / 2)];
  console.log(v, width, "before med", med(res[v].before), "after med", med(res[v].after), "after max", Math.max(...res[v].after.map((r) => r.cls)));
  fs.writeFileSync(outFile, JSON.stringify({ width, runs, blocked: stats.blocked, blockedHosts: [...stats.urls], res }, null, 1));
}
await browser.close();
