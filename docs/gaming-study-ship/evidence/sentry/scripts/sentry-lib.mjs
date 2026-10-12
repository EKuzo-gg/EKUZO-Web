import fs from "node:fs";
import { launchGuarded, newCtx, closeCtx, BASE, POST } from "./lib.mjs";
export { launchGuarded, closeCtx, BASE, POST };
export const EV = "/Users/jamiefitch/Projects/ekuzo-web/.claude/worktrees/gaming-study-ship/docs/gaming-study-ship/evidence/sentry";
export const S1 = '[role=dialog][aria-labelledby=s1-title]';
export const NL_TEXT = ["The EKUZO weekly", "One email after you read this", "One email tomorrow", "One email a week", "For parents of gamers, once a week", "Send me the one email", "Join the weekly"];
const RECORDER = () => {
  const q = { dl: [], fbq: [], clarity: [] };
  window.__qa = q;
  const send = (k, a) => { const e = { t: Date.now(), url: location.pathname + location.search, a: Array.from(a).map(x => { try { return JSON.parse(JSON.stringify(x)); } catch { return String(x); } }) }; q[k].push(e); try { window.__qaSend && window.__qaSend(k, e); } catch {} };
  const dl = []; const op = Array.prototype.push;
  dl.push = function () { for (const a of arguments) send("dl", a); return op.apply(this, arguments); };
  window.dataLayer = dl;
  const f = function () { send("fbq", arguments); }; f.queue = []; f.loaded = true; f.version = "qa"; f.push = f; window.fbq = f; window._fbq = f;
  window.clarity = function () { send("clarity", arguments); };
};
export async function mk(browser, name, opts = {}) {
  const ctx = await newCtx(browser, name, { suppressPopup: false, ...opts });
  const rec = { dl: [], fbq: [], clarity: [], posts: [], unexpected: [], nav: [] };
  ctx.qaCalls = rec; ctx.qaApi = { season: [], newsletter: [], contact: [] };
  await ctx.exposeFunction("__qaSend", (k, e) => { rec[k].push(e); });
  await ctx.addInitScript(RECORDER);
  const handler = (key) => async (route) => {
    const req = route.request();
    if (req.method() !== "POST") return route.continue();
    let body = null; try { body = JSON.parse(req.postData() || "null"); } catch { body = req.postData(); }
    const queue = ctx.qaApi[key]; const st = queue.length ? queue.shift() : 200;
    rec.posts.push({ t: Date.now(), key, url: new URL(req.url()).pathname, status: st, body });
    return route.fulfill({ status: st, contentType: "application/json", body: st === 200 ? '{"ok":true}' : '{"ok":false,"error":"qa"}' });
  };
  await ctx.route(/\/api\/season-one(\?|$)/, handler("season"));
  await ctx.route(/\/api\/newsletter(\?|$)/, handler("newsletter"));
  await ctx.route(/\/api\/contact(\?|$)/, handler("contact"));
  await ctx.route(/\/api\/(?!season-one|newsletter|contact)/, async (route) => {
    const req = route.request();
    if (req.method() !== "GET" && req.method() !== "HEAD") { rec.unexpected.push({ m: req.method(), u: req.url() }); return route.fulfill({ status: 200, contentType: "application/json", body: "{}" }); }
    return route.continue();
  });
  return ctx;
}
export const events = (ctx) => ctx.qaCalls.dl.filter(e => e.a[0] === "event").map(e => ({ name: e.a[1], params: e.a[2] || {}, t: e.t, url: e.url }));
export const evCount = (ctx, name) => events(ctx).filter(e => e.name === name).length;
export const fbqTrack = (ctx) => ctx.qaCalls.fbq.filter(e => e.a[0] === "track").map(e => ({ name: e.a[1], params: e.a[2] || {}, opts: e.a[3] || {}, t: e.t }));
export const allCalls = (ctx) => ({ gtag: ctx.qaCalls.dl.map(e => e.a), fbq: ctx.qaCalls.fbq.map(e => e.a), clarity: ctx.qaCalls.clarity.map(e => e.a) });
export const s1Open = (page) => page.locator(S1).count();
export const nlState = (page) => page.evaluate((txts) => {
  const body = document.body.innerText.toLowerCase(); const hits = txts.filter(t => body.includes(t.toLowerCase()));
  const dialogs = [...document.querySelectorAll("[role=dialog]")].map(d => d.getAttribute("aria-labelledby") || d.className.slice(0, 40));
  const barInput = [...document.querySelectorAll("input[type=email]")].filter(i => !i.closest("[aria-labelledby=s1-title]")).filter(i => { let e = i; while (e) { if (getComputedStyle(e).position === "fixed") return true; e = e.parentElement; } return false; }).length;
  return { hits, dialogs, nlDialogs: dialogs.filter(d => d !== "s1-title"), fixedEmailInputs: barInput };
}, NL_TEXT);
export const storage = (page) => page.evaluate(() => ({ ls: { ...localStorage }, ss: { ...sessionStorage } }));
export const sleep = (ms) => new Promise(r => setTimeout(r, ms));
export async function dismissS1(page, how = "x") {
  await page.waitForSelector(S1, { timeout: 8000 });
  if (how === "esc") await page.keyboard.press("Escape");
  else if (how === "backdrop") { const b = await page.locator(S1).boundingBox(); await page.mouse.click(2, 2); }
  else await page.locator(S1 + ' button[aria-label="Close"]').click();
  await page.waitForSelector(S1, { state: "detached", timeout: 3000 }).catch(() => {});
}
export async function scrollSteps(page, fracs = [0.25, 0.5, 0.75, 1], waitMs = 1000, sampler) {
  const out = [];
  for (const f of fracs) {
    await page.evaluate((f) => { const h = document.documentElement.scrollHeight - innerHeight; scrollTo(0, Math.round(h * f)); }, f);
    await page.waitForTimeout(f >= 0.5 ? Math.max(waitMs, 1500) : waitMs);
    out.push({ f, state: sampler ? await sampler(page) : null });
  }
  return out;
}
export async function cdpTouch(ctx, page, from, to, steps = 8, endTap = false) {
  const cdp = await ctx.newCDPSession(page);
  const pt = (x, y) => [{ x, y, id: 1 }];
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: pt(from.x, from.y) });
  for (let i = 1; i <= steps; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: pt(from.x + (to.x - from.x) * i / steps, from.y + (to.y - from.y) * i / steps) }); await sleep(16); }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}
export const save = (name, obj) => fs.writeFileSync(`${EV}/${name}`, typeof obj === "string" ? obj : JSON.stringify(obj, null, 2));
export const center = async (loc) => { const b = await loc.boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
