import { chromium, newCtx, stats } from "./common.mjs";
const b = await chromium.launch();
const ctx = await newCtx(b, { viewport: { width: 375, height: 667 } });
const p = await ctx.newPage();
const seen = [];
p.on("requestfinished", (r) => seen.push(r.url()));
// probe: a page that tries each host
await p.goto("http://localhost:3110/season1/join");
const res = await p.evaluate(async () => {
  const out = {};
  for (const u of ["https://www.google-analytics.com/g/collect","https://www.googletagmanager.com/gtag/js?id=x","https://www.clarity.ms/tag/x","https://www.facebook.com/tr?id=1","https://connect.facebook.net/en_US/fbevents.js"]) {
    try { const r = await fetch(u, { mode: "no-cors" }); out[u] = r.status; } catch (e) { out[u] = "err " + e.message; }
  }
  return out;
});
console.log(JSON.stringify({ probe: res, blocked: stats.blocked, urls: stats.blockedUrls }, null, 1));
await b.close();
