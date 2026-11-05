import { chromium } from "playwright";
export const BLOCK = /google-analytics\.com|googletagmanager\.com|clarity\.ms|facebook\.com\/tr|connect\.facebook\.net/;
export const stats = { blocked: 0, blockedUrls: [] };
export const UA_IG = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0";
export async function newCtx(browser, opts = {}) {
  const ctx = await browser.newContext(opts);
  await ctx.route("**/*", (r) => { if (BLOCK.test(r.request().url())) { stats.blocked++; if (stats.blockedUrls.length < 20) stats.blockedUrls.push(r.request().url().slice(0, 100)); return r.fulfill({ status: 204, body: "" }); } return r.fallback(); });
  await ctx.addInitScript(() => {
    window.__rec = { fbq: [], gtag: [], clarity: [] };
    window.fbq = function () { window.__rec.fbq.push(Array.from(arguments)); };
    window.gtag = function () { window.__rec.gtag.push(Array.from(arguments)); };
    window.clarity = function () { window.__rec.clarity.push(Array.from(arguments)); };
  });
  return ctx;
}
export { chromium };
