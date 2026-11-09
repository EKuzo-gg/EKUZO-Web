// J10: node classq-j10.mjs <port> <label>
import fs from "fs";
import { launch, newCtx, snapshot, sleep, typeAndSubmit, waitPosts } from "./classq-lib.mjs";
const [port, label] = process.argv.slice(2);
const base = `http://localhost:${port}`;
const browser = await launch();
const out = {};
for (const ad of ["d18", "d19"]) {
  const ctx = await newCtx(browser); const rec = ctx.__rec;
  await ctx.route("https://ekuzo.gg/**", (r) => { rec.stubbed.push(r.request().url()); return r.fulfill({ status: 200, contentType: "text/html", body: "<html><body>stub destination</body></html>" }); });
  const page = await ctx.newPage();
  const url = `${base}/season1?ad=${ad}&utm_source=fb&utm_medium=paid&utm_campaign=s1&utm_content=${ad}&fbclid=TESTFBCLID&s1qa=1`;
  await page.goto(url, { waitUntil: "load" }); await sleep(3000);
  await page.evaluate(() => { window.__shifts = []; new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__shifts.push({ v: e.value, t: Math.round(e.startTime), src: (e.sources || []).map((s) => s.node && (s.node.id || s.node.className || s.node.nodeName)) , input: e.hadRecentInput }))).observe({ type: "layout-shift", buffered: true }); window.__marker = "same-document"; });
  const s0 = await snapshot(page);
  const pv = (s) => ({ dl: s.dataLayer.length, pageViewEvents: s.dataLayer.filter((e) => e[0] === "event" && e[1] === "page_view").length, configCalls: s.dataLayer.filter((e) => e[0] === "config").length, fbqPageView: (s.fbqQueue || []).filter((e) => e[0] === "track" && e[1] === "PageView").length });
  const first = pv(s0);
  await page.locator("footer a").first().scrollIntoViewIfNeeded();
  await Promise.all([page.waitForURL(/ekuzo\.gg/, { timeout: 8000 }).catch(() => {}), page.locator("footer a").first().tap()]);
  const atDest = page.url();
  await page.goBack({ waitUntil: "load" }).catch(() => {}); await sleep(2500);
  const restored = await page.evaluate(() => window.__marker === "same-document");
  const s1 = await snapshot(page);
  const afterBack = pv(s1);
  if (!restored) await page.evaluate(() => { window.__shifts = []; new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__shifts.push({ v: e.value, t: Math.round(e.startTime), src: (e.sources || []).map((s) => s.node && (s.node.id || s.node.className || s.node.nodeName)), input: e.hadRecentInput }))).observe({ type: "layout-shift", buffered: true }); });
  const n = s1.dataLayer.length;
  await page.evaluate(async () => { const set = (v) => { Object.defineProperty(document, "visibilityState", { configurable: true, get: () => v }); Object.defineProperty(document, "hidden", { configurable: true, get: () => v === "hidden" }); document.dispatchEvent(new Event("visibilitychange")); }; set("hidden"); await new Promise((r) => setTimeout(r, 800)); set("visible"); window.dispatchEvent(new Event("focus")); });
  await sleep(1500);
  const s2 = await snapshot(page);
  await typeAndSubmit(page); await waitPosts(rec, 1); await sleep(800);
  const s3 = await snapshot(page);
  const shifts = await page.evaluate(() => window.__shifts);
  out[ad] = { initial: first, atDest, restoredSameDocument: restored, afterBack, afterVisibility: pv(s2), newDlAfterVisibility: s2.dataLayer.length - n, newDlSample: s2.dataLayer.slice(n), shifts, heroShifts: shifts.filter((s) => s.src.some((x) => /hero|ihero/.test(String(x)))), submitPostAd: rec.posts.map((p) => p.body.ad), submitAttribution: rec.posts.map((p) => p.body.attribution), page: page.url(), hosts: rec.requests.filter((u) => !/localhost|fonts\.g/.test(u)).slice(0, 8), pageErrors: rec.pageErrors };
  await ctx.close();
}
fs.mkdirSync("classq", { recursive: true });
fs.writeFileSync(`classq/${label}-j10.json`, JSON.stringify(out, null, 1));
console.log(label, JSON.stringify(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, { initial: v.initial, back: v.afterBack, vis: v.afterVisibility, rest: v.restoredSameDocument, heroShifts: v.heroShifts.length, ad: v.submitPostAd, newDl: v.newDlAfterVisibility }]))));
await browser.close();
