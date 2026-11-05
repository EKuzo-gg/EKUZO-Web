import { createRequire } from "module";
const require = createRequire("/opt/node-tools/node_modules/");
export const { chromium } = require("playwright");
export const BLOCK = /google-analytics\.com|googletagmanager\.com|clarity\.ms|facebook\.com\/tr|connect\.facebook\.net|doubleclick\.net/;
export const UA_M = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0";
export const AFTER = "http://localhost:3170", BEFORE = "http://localhost:3171";
export const stats = { blocked: 0, urls: new Set() };
export async function newCtx(browser, opts = {}) {
  const ctx = await browser.newContext(opts);
  await ctx.route("**/*", (r) => {
    const u = r.request().url();
    if (BLOCK.test(u)) { stats.blocked++; stats.urls.add(u.replace(/\?.*/, "").slice(0, 80)); return r.fulfill({ status: 204, body: "" }); }
    return r.continue();
  });
  return ctx;
}
export const STUBS = () => {
  window.__calls = [];
  const rec = (n) => (...a) => { try { window.__calls.push([n, JSON.parse(JSON.stringify(a))]); } catch (_) { window.__calls.push([n, "unserializable"]); } };
  window.fbq = rec("fbq"); window.gtag = rec("gtag"); window.clarity = rec("clarity");
  window.dataLayer = window.dataLayer || [];
};
export async function throttle(ctx, page, cpu = 4) {
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
}
export const mobile = { viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA_M };
export const desk = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };
export const ADS = Array.from({ length: 21 }, (_, i) => "d" + (i + 1));
