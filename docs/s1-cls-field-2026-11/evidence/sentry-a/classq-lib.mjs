// Class Q helpers (Sentry A). Every analytics request and every POST to /api/season-one is fulfilled locally.
import { createRequire } from "module";
const { chromium } = createRequire("/home/claude/")("playwright");
export const FB_UA = "Mozilla/5.0 (Linux; Android 14; SM-S921U Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.6778.135 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/490.0.0.50.109;]";
export const ALLOWED_HOSTS = new Set(["localhost", "fonts.googleapis.com", "fonts.gstatic.com"]);
// Regex routes on the host (the first version used globs like "**/clarity.ms/**", which do not match www.clarity.ms: see defects.md SA-2).
export const STUBS = [/^https?:\/\/([^/]*\.)?(clarity\.ms|bing\.com|google-analytics\.com|analytics\.google\.com|googletagmanager\.com|google\.com\/g\/collect|doubleclick\.net|facebook\.net|facebook\.com|googleadservices\.com|g\.doubleclick\.net)(:\d+)?\//i, /\/gtag\/js/, /\/fbevents\.js/];

export const launch = () => chromium.launch({ proxy: { server: process.env.HTTPS_PROXY, bypass: "localhost,127.0.0.1" } });

// postPlan: array of statuses, consumed in order; the last one repeats. Default [200].
export async function newCtx(browser, { width = 412, height = 915, dpr = 2.625, ua = FB_UA, postPlan = [200], rand = null } = {}) {
  const ctx = await browser.newContext({ userAgent: ua, viewport: { width, height }, deviceScaleFactor: dpr, isMobile: true, hasTouch: true, ignoreHTTPSErrors: true });
  const rec = { requests: [], posts: [], stubbed: [], pageErrors: [], console: [], failed: [] };
  let planIdx = 0;
  for (const g of STUBS) await ctx.route(g, (r) => { rec.stubbed.push(r.request().url().slice(0, 200)); return r.fulfill({ status: 204, body: "" }); });
  await ctx.route("**/api/season-one", async (r) => {
    const req = r.request();
    if (req.method() !== "POST") return r.fulfill({ status: 204, body: "" });
    let body = null; try { body = JSON.parse(req.postData() || "null"); } catch { body = req.postData(); }
    const status = postPlan[Math.min(planIdx++, postPlan.length - 1)];
    rec.posts.push({ body, status, cookie: (await req.allHeaders()).cookie || "" });
    const payload = status === 429 ? { error: "Too many tries." } : { ok: true };
    return r.fulfill({ status, contentType: "application/json", body: JSON.stringify(payload) });
  });
  ctx.on("request", (q) => rec.requests.push(q.url()));
  ctx.on("requestfailed", (q) => rec.failed.push(q.url().slice(0, 160) + " " + (q.failure() && q.failure().errorText)));
  if (rand !== null) await ctx.addInitScript((v) => { Math.random = () => v; }, rand);
  await ctx.addInitScript(INSTRUMENT);
  ctx.__rec = rec;
  return ctx;
}
export function hostsLeft(rec) {
  const hosts = {};
  for (const u of rec.requests) { try { const h = new URL(u).hostname; hosts[h] = (hosts[h] || 0) + 1; } catch {} }
  const stubbedUrls = new Set(rec.stubbed);
  const stubbedHosts = new Set(rec.stubbed.map((u) => { try { return new URL(u).hostname; } catch { return ""; } }));
  // an offender is a request URL, not fulfilled by a stub, to a host outside the allowed set
  const offenders = [...new Set(rec.requests.filter((u) => { try { return !ALLOWED_HOSTS.has(new URL(u).hostname) && !stubbedUrls.has(u.slice(0, 200)); } catch { return false; } }).map((u) => u.slice(0, 120)))];
  return { hosts, offenders, stubbedHosts: [...stubbedHosts] };
}
// Runs before any page script: a numbered timeline of tag calls, cookie and storage writes.
const INSTRUMENT = () => {
  window.__seq = 0; window.__tl = [];
  const log = (k, d) => window.__tl.push({ seq: ++window.__seq, t: Math.round(performance.now()), k, d });
  const arr = (a) => (a && typeof a.length === "number" && typeof a !== "string" ? Array.from(a) : [a]);
  const dl = []; const op = dl.push.bind(dl);
  dl.push = function () { for (const a of arguments) log("dl", arr(a)); return op.apply(null, arguments); };
  window.dataLayer = dl;
  for (const nm of ["fbq", "clarity"]) {
    let v;
    Object.defineProperty(window, nm, { configurable: true, get() { return v; }, set(x) { v = typeof x === "function" ? new Proxy(x, { apply(t, th, args) { log(nm, arr(args)); return Reflect.apply(t, th, args); } }) : x; } });
  }
  const cd = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");
  Object.defineProperty(document, "cookie", { configurable: true, get() { return cd.get.call(document); }, set(v) { log("cookie", String(v).split("=")[0]); return cd.set.call(document, v); } });
  const si = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) { log(this === window.localStorage ? "ls" : "ss", k); return si.call(this, k, v); };
};
export async function snapshot(page) {
  return page.evaluate(() => {
    const dump = (s) => { const o = {}; try { for (let i = 0; i < s.length; i++) o[s.key(i)] = s.getItem(s.key(i)); } catch {} return o; };
    const q = (x) => (x && x.queue ? Array.from(x.queue).map((a) => Array.from(a)) : null);
    return {
      url: location.href,
      timeline: window.__tl,
      dataLayer: (window.dataLayer || []).map((a) => (a && typeof a.length === "number" ? Array.from(a) : a)),
      fbqQueue: q(window.fbq),
      clarityQ: window.clarity && window.clarity.q ? window.clarity.q.map((a) => Array.from(a)) : null,
      localStorage: dump(localStorage), sessionStorage: dump(sessionStorage), cookie: document.cookie,
    };
  });
}
export async function typeAndSubmit(page, _s, _b, email = "qa+sentry@example.com") {
  // first visible of the top and end forms (the top form is hidden on some variants); records which one
  let which = null;
  for (const [sel, form] of [["#em-top", "#join-top"], ["#em-end", "#join-end"]]) {
    if (await page.locator(sel).isVisible()) { which = [sel, form + " button[type=submit]"]; break; }
  }
  if (!which) { await page.locator("#em-end").scrollIntoViewIfNeeded(); which = ["#em-end", "#join-end button[type=submit]"]; }
  page.__form = which[0];
  await page.locator(which[0]).scrollIntoViewIfNeeded();
  await page.locator(which[0]).tap();
  await page.keyboard.type(email, { delay: 15 });
  await page.locator(which[1]).tap();
}
export async function waitPosts(rec, n, ms = 8000) {
  const t0 = Date.now();
  while (rec.posts.length < n && Date.now() - t0 < ms) await new Promise((s) => setTimeout(s, 100));
}
export const sleep = (ms) => new Promise((s) => setTimeout(s, ms));
// Normalisation for main vs branch comparison.
export function norm(x, key = "") {
  if (typeof x === "string") x = x.replace(/localhost:\d+/g, "localhost:PORT").replace(/\\?"at\\?":\d{13}/g, '"at":<ts>');
  if (Array.isArray(x)) return x.map((v) => norm(v));
  if (x && typeof x === "object") { const o = {}; for (const k of Object.keys(x)) o[k] = /^(eventID|event_id|eventId)$/.test(k) ? "<id>" : k === "gtm.start" ? "<ts>" : norm(x[k], k); return o; }
  if (typeof x === "number" && x > 1.6e12) return "<ts>";
  if (typeof x === "string") {
    if (/^\d{4}-\d\d-\d\dT[\d:.]+Z$/.test(x)) return "<date>";
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-/.test(x) || /^\d{13}-[a-z0-9]+$/.test(x)) return "<uuid>";
    if (/^fb\.\d\.\d{10,13}\./.test(x)) return x.replace(/^fb\.(\d)\.\d+\./, "fb.$1.<ts>.");
    if (/^https?:\/\/[^ ]*\?/.test(x) || /^\/season1\?/.test(x)) { const [b, q] = x.split("?"); return b + "?" + q.split("&").sort().join("&"); }
  }
  return x;
}
