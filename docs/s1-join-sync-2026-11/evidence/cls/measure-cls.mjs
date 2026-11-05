// CLS at 375 px for Season 01 landing heroes. Usage:
//   node measure-cls.mjs <baseUrl> <runs> <ad> [<ad> ...]
// 375x667, DPR 2, mobile UA, CPU 4x, Slow 4G-ish throttle, cold context per run.
// Analytics collect hosts are blocked from the first request (fail-closed gate) and every
// blocked request is counted. CLS = max session window (Google's definition: gaps < 1 s,
// windows <= 5 s), measured through load plus 4 s. Shift sources are recorded per run.
import { chromium } from "playwright";

const [base, runsArg, ...ads] = process.argv.slice(2);
const runs = Number(runsArg || 5);
const BLOCK = /google-analytics\.com|googletagmanager\.com|clarity\.ms|facebook\.com\/tr|connect\.facebook\.net|doubleclick\.net/;
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0";

const browser = await chromium.launch();
const out = {};
let blocked = 0;
for (const ad of ads) {
  out[ad] = [];
  for (let i = 0; i < runs; i++) {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA });
    await ctx.route("**/*", (r) => (BLOCK.test(r.request().url()) ? (blocked++, r.fulfill({ status: 204, body: "" })) : r.continue()));
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.addInitScript(() => {
      window.__ls = [];
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) {
          if (e.hadRecentInput) continue;
          window.__ls.push({ t: Math.round(e.startTime), v: e.value, src: (e.sources || []).map((s) => {
            const n = s.node; let d = "?";
            if (n && n.nodeType === 1) d = n.tagName.toLowerCase() + (n.id ? "#" + n.id : "") + (n.className && typeof n.className === "string" ? "." + n.className.trim().split(/\s+/).slice(0, 3).join(".") : "");
            else if (n) d = "#text";
            return { d, from: s.previousRect && [Math.round(s.previousRect.y), Math.round(s.previousRect.height)], to: s.currentRect && [Math.round(s.currentRect.y), Math.round(s.currentRect.height)] };
          }) });
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    const url = `${base}/season1?ad=${ad}&utm_source=meta&utm_content=${ad}-qa`;
    await page.goto(url, { waitUntil: "load", timeout: 90000 });
    await page.waitForTimeout(4000);
    const ls = await page.evaluate(() => window.__ls);
    let max = 0, cur = 0, start = -1, last = -1;
    for (const e of ls) {
      if (start < 0 || e.t - last > 1000 || e.t - start > 5000) { cur = 0; start = e.t; }
      cur += e.v; last = e.t; if (cur > max) max = cur;
    }
    out[ad].push({ cls: Number(max.toFixed(4)), shifts: ls.map((e) => ({ t: e.t, v: Number(e.v.toFixed(4)), src: e.src.slice(0, 3) })) });
    await ctx.close();
  }
}
await browser.close();
const summary = Object.fromEntries(Object.entries(out).map(([ad, rs]) => {
  const v = rs.map((r) => r.cls).sort((a, b) => a - b);
  return [ad, { median: v[Math.floor(v.length / 2)], runs: v }];
}));
console.log(JSON.stringify({ base, runs, blockedAnalyticsRequests: blocked, summary, detail: out }, null, 1));
