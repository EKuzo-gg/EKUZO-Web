import { chromium, devices } from "playwright-core";
import { PROXY_PORT, LOG } from "./proxy.mjs";
export const BASE = process.env.QA_BASE || "http://localhost:3311";
export const POST = "/blog/gaming-study-13-7-years-younger-what-it-means-for-kids";
const PROXY = `http://127.0.0.1:${PROXY_PORT}`;
const isLocal = (u) => { try { const h = new URL(u).hostname; return h === "localhost" || h === "127.0.0.1" || h === "[::1]"; } catch { return true; } };
export async function mark(name, ev) { await fetch(`${PROXY}/__mark?name=${encodeURIComponent(name)}&ev=${ev}`); }
export async function launchGuarded() {
  // fail closed: refuse to launch if the proxy is not answering
  const r = await fetch(`${PROXY}/__mark?name=launch&ev=check`).catch(() => null);
  if (!r || !r.ok) throw new Error("guard proxy not running; refusing to launch browser");
  return chromium.launch({
    channel: "chrome", headless: true,
    proxy: { server: PROXY, bypass: "localhost,127.0.0.1" },
    args: ["--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE localhost , EXCLUDE 127.0.0.1"],
  });
}
export const VIEWPORTS = {
  "1440": { viewport: { width: 1440, height: 900 } },
  "1024": { viewport: { width: 1024, height: 768 } },
  "768": { viewport: { width: 768, height: 1024 } },
  "375": { viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2,
    userAgent: "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36" },
};
// opts: vp (key of VIEWPORTS), suppressPopup (default true), routes (default true)
export async function newCtx(browser, name, opts = {}) {
  const { vp = "1440", suppressPopup = true, routes = true } = opts;
  await mark(name, "start");
  const ctx = await browser.newContext({ ...VIEWPORTS[vp], serviceWorkers: "block" });
  const rec = { name, external: [], consoleErrors: [], pageErrors: [], failed404: [] };
  if (suppressPopup) await ctx.addInitScript(() => { try { localStorage.setItem("ekuzo_s1_dismissed_at", String(Date.now())); } catch {} });
  if (routes) {
    await ctx.route("**/*", (route) => {
      const req = route.request(); const url = req.url();
      if (isLocal(url) || url.startsWith("data:") || url.startsWith("blob:")) return route.continue();
      const rt = req.resourceType();
      rec.external.push({ method: req.method(), url: url.slice(0, 200), type: rt, layer: "route" });
      if (rt === "script") return route.abort("blockedbyclient");
      if (rt === "image") return route.fulfill({ status: 200, contentType: "image/gif", body: Buffer.from("R0lGODlhAQABAAAAACw=", "base64") });
      return route.fulfill({ status: 204, body: "" });
    });
  }
  ctx.on("page", (p) => {
    p.on("console", (m) => { if (m.type() === "error") rec.consoleErrors.push({ url: p.url(), text: m.text().slice(0, 400), loc: m.location()?.url }); });
    p.on("pageerror", (e) => rec.pageErrors.push({ url: p.url(), text: String(e).slice(0, 400) }));
    p.on("response", (r) => { if (isLocal(r.url()) && r.status() >= 400) rec.failed404.push({ status: r.status(), url: r.url() }); });
  });
  ctx.qaRec = rec; ctx.qaName = name;
  return ctx;
}
export async function closeCtx(ctx) { await ctx.close(); await mark(ctx.qaName, "end"); }
export async function scrollThrough(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = page.viewportSize().height;
  for (let y = 0; y < h; y += Math.round(vh * 0.6)) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(150); }
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(400);
}
export { LOG };
