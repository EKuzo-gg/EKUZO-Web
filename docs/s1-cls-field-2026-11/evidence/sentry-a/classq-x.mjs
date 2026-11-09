// X7/X9-X13 equality gesture set + X11 (429 once) + M1c local: node classq-x.mjs <port> <label>
import fs from "fs";
import { launch, newCtx, snapshot, sleep, waitPosts, hostsLeft, norm } from "./classq-lib.mjs";
const [port, label] = process.argv.slice(2);
const base = `http://localhost:${port}`;
fs.mkdirSync("classq", { recursive: true });
const browser = await launch();
const EMAIL = "qa+sentry@example.com";
const delta = async (page, fn) => {
  const before = (await page.evaluate(() => window.__tl.length));
  await fn();
  await sleep(700);
  return page.evaluate((n) => window.__tl.slice(n).filter((e) => ["dl", "fbq", "clarity"].includes(e.k)).map((e) => e.k + ":" + JSON.stringify(e.d)), before);
};
async function rawTouchScroll(page, sel) {
  await page.locator(sel).first().scrollIntoViewIfNeeded();
  const b = await page.locator(sel).first().boundingBox();
  const x = b.x + b.width / 2, y = Math.min(b.y + b.height / 2, 800);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  for (let i = 1; i <= 16; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y - i * 10 }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}
const GEST = {
  tap: (p, s) => p.locator(s).first().tap(),
  type: async (p, s) => { await p.locator(s).first().tap(); await p.keyboard.type("abc", { delay: 10 }); },
  paste: async (p, s) => { await p.locator(s).first().evaluate((e) => e.focus()); await p.keyboard.insertText(EMAIL); },
  autofill: (p, s) => p.locator(s).first().evaluate((e) => { if ("value" in e) e.value = "autofill@example.com"; }),
  focus: (p, s) => p.locator(s).first().evaluate((e) => e.focus()),
  scroll: (p, s) => rawTouchScroll(p, s),
  retry: async (p, s) => { await p.locator(s).first().tap(); await sleep(300); await p.locator(s).first().tap(); },
};
const out = {};
const targets = [
  { ad: "d18", el: "email", sel: "#em-top" },
  { ad: "d18", el: "cta", sel: ".hero .cta, [data-go]" },
  { ad: "d18", el: "faq", sel: ".faq summary" },
  { ad: "d2", el: "email", sel: "#em-top" },
  { ad: "d2", el: "heroAnswer", sel: ".ih-opt" },
  { ad: "d2", el: "cta", sel: "[data-go], .hero .cta" },
  { ad: "d2", el: "faq", sel: ".faq summary" },
];
for (const t of targets) for (const g of Object.keys(GEST)) {
  const ctx = await newCtx(browser); const page = await ctx.newPage();
  const errs = []; page.on("pageerror", (e) => errs.push(String(e)));
  await page.goto(`${base}/season1?ad=${t.ad}&s1qa=1`, { waitUntil: "load" }); await sleep(1800);
  const exists = await page.locator(t.sel).count();
  if (!exists) { out[`${t.ad}/${t.el}/${g}`] = "no element"; await ctx.close(); continue; }
  let d; try { d = await delta(page, () => GEST[g](page, t.sel)); } catch (e) { d = ["ERR " + String(e).slice(0, 80)]; }
  out[`${t.ad}/${t.el}/${g}`] = { events: norm(d), errs };
  await ctx.close();
}
// Text Karlin: submit the form first (stubbed), then gestures on the phone input and the button.
for (const ad of ["d18", "d2"]) for (const [el, sel] of [["tkPhone", "#tk-form input[name=phone]"], ["tkButton", "#tk-form button"]]) for (const g of Object.keys(GEST)) {
  const ctx = await newCtx(browser); const page = await ctx.newPage();
  await page.goto(`${base}/season1?ad=${ad}&s1qa=1`, { waitUntil: "load" }); await sleep(1500);
  await page.locator("#em-top").scrollIntoViewIfNeeded(); await page.locator("#em-top").tap(); await page.keyboard.type(EMAIL, { delay: 10 });
  await page.locator("#join-top button[type=submit]").tap(); await waitPosts(ctx.__rec, 1); await sleep(1500);
  if (el === "tkButton") await page.locator("#tk-form input[name=phone]").evaluate((e) => (e.value = "5125550123"));
  let d; try { d = await delta(page, () => GEST[g](page, sel)); } catch (e) { d = ["ERR " + String(e).slice(0, 80)]; }
  out[`${ad}/${el}/${g}`] = { events: norm(d), posts: ctx.__rec.posts.length };
  await ctx.close();
}
fs.writeFileSync(`classq/${label}-x-gestures.json`, JSON.stringify(out, null, 1));
// X11: 429 once then 200, d18; also a double tap on a fresh page.
const x11 = {};
{
  const ctx = await newCtx(browser, { postPlan: [429, 200] }); const rec = ctx.__rec; const page = await ctx.newPage();
  await page.goto(`${base}/season1?ad=d18&s1qa=1`, { waitUntil: "load" }); await sleep(1800);
  await page.locator("#em-top").scrollIntoViewIfNeeded(); await page.locator("#em-top").tap(); await page.keyboard.type(EMAIL, { delay: 10 });
  const mark = () => page.evaluate(() => window.__tl.length);
  const n0 = await mark();
  await page.locator("#join-top button[type=submit]").tap(); await waitPosts(rec, 1); await sleep(1200);
  const afterFirst = await page.evaluate((n) => window.__tl.slice(n).filter((e) => ["dl", "fbq"].includes(e.k)).map((e) => e.k + ":" + JSON.stringify(e.d)), n0);
  const errText = await page.evaluate(() => document.querySelector("#join-top .err").textContent);
  await page.locator("#join-top button[type=submit]").tap(); await waitPosts(rec, 2); await sleep(1500);
  const afterSecond = await page.evaluate((n) => window.__tl.slice(n).filter((e) => ["dl", "fbq"].includes(e.k)).map((e) => e.k + ":" + JSON.stringify(e.d)), n0);
  const tl = (await snapshot(page)).timeline;
  const leads = tl.filter((e) => e.k === "fbq" && e.d[0] === "track" && e.d[1] === "Lead");
  const gl = tl.filter((e) => e.k === "dl" && e.d[0] === "event" && e.d[1] === "generate_lead");
  Object.assign(x11, { statuses: rec.posts.map((p) => p.status), errText, afterFirst, afterSecondCount: afterSecond.length, leadCount: leads.length, generateLeadCount: gl.length, leadEventIds: leads.map((l) => l.d[3] && l.d[3].eventID), postEventIds: rec.posts.map((p) => p.body.eventId), seqLeadAfter200: leads.length ? leads[0].seq : null, seqPost: null });
  x11.m1c = x11.leadEventIds[0] === x11.postEventIds[1] && x11.postEventIds[0] === x11.postEventIds[1];
  await ctx.close();
}
{
  const ctx = await newCtx(browser); const rec = ctx.__rec; const page = await ctx.newPage();
  await page.goto(`${base}/season1?ad=d18&s1qa=1`, { waitUntil: "load" }); await sleep(1800);
  await page.locator("#em-top").scrollIntoViewIfNeeded(); await page.locator("#em-top").tap(); await page.keyboard.type(EMAIL, { delay: 10 });
  const b = await page.locator("#join-top button[type=submit]").boundingBox();
  await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2);
  await sleep(2000);
  const tl = (await snapshot(page)).timeline;
  x11.doubleTap = { posts: rec.posts.length, leads: tl.filter((e) => e.k === "fbq" && e.d[1] === "Lead").length, generateLead: tl.filter((e) => e.k === "dl" && e.d[1] === "generate_lead").length };
  await ctx.close();
}
fs.writeFileSync(`classq/${label}-x11.json`, JSON.stringify(x11, null, 1));
console.log(label, "x11", JSON.stringify(x11));
await browser.close();
