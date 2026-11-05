import { chromium, newCtx, stats } from "./common.mjs";
import fs from "fs";
const URL0 = "http://localhost:3110/season1?ad=d19&utm_source=meta&utm_content=d19-qa";
const b = await chromium.launch();
const results = {};
const ck = (name, ok, detail) => { results[name] = { pass: !!ok, detail }; console.log(ok ? "PASS" : "FAIL", name, JSON.stringify(detail)); };
async function mk(opts = {}) {
  const ctx = await newCtx(b, { viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true, ...opts });
  const page = await ctx.newPage();
  const posts = [];
  const state = { mode: ["ok"], delay: 0, idx: 0 };
  await page.route("**/api/season-one", async (route) => {
    const req = route.request();
    if (req.method() !== "POST") return route.fulfill({ status: 405, body: "" });
    let body = {}; try { body = JSON.parse(req.postData()); } catch {}
    posts.push(body);
    const m = state.mode[Math.min(state.idx++, state.mode.length - 1)];
    if (state.delay) await new Promise((r) => setTimeout(r, state.delay));
    if (m === "abort") return route.abort("failed");
    if (m === "repeat") return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, repeat: true }) });
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  return { ctx, page, posts, state };
}
async function open(page) {
  await page.goto(URL0, { waitUntil: "load" });
  await page.waitForFunction(() => document.getElementById("hero")?.children.length > 0, null, { timeout: 30000 });
  await page.waitForTimeout(800);
}
const rec = (page) => page.evaluate(() => ({ ...window.__rec, ls: (() => { try { return localStorage.getItem("ekuzo_s1_joined"); } catch { return "ERR"; } })(), conf: !document.getElementById("conf").hidden }));
const leads = (r) => r.fbq.filter((a) => a[0] === "track" && a[1] === "Lead");
const gl = (r) => r.gtag.filter((a) => a[0] === "event" && a[1] === "generate_lead");
const cs = (r) => r.clarity.filter((a) => a[0] === "event" && a[1] === "signup");
const fill = async (page, email) => { await page.fill("#em-top", email); };
const submitTop = (page) => page.click(".join form[data-where] button, #join-top form button", { noWaitAfter: true });

// a) double tap
{ const { ctx, page, posts, state } = await mk(); state.delay = 600; await open(page);
  await fill(page, "qa-a@example.com");
  const btn = page.locator("#join-top form button").first();
  await btn.dispatchEvent("click"); await btn.dispatchEvent("click"); await btn.dispatchEvent("click");
  await page.waitForTimeout(1500);
  const r = await rec(page);
  ck("a1 triple click burst -> 1 POST", posts.length === 1 && r.conf, { posts: posts.length, conf: r.conf });
  await ctx.close(); }
// a2) real dblclick (touch tap x2) and Enter + click
{ const { ctx, page, posts, state } = await mk(); state.delay = 600; await open(page);
  await fill(page, "qa-b@example.com");
  await page.focus("#em-top"); await page.keyboard.press("Enter");
  await page.locator("#join-top form button").first().dispatchEvent("click");
  await page.waitForTimeout(1500);
  const r = await rec(page);
  ck("a2 Enter + click -> 1 POST", posts.length === 1 && r.conf, { posts: posts.length });
  await ctx.close(); }
{ const { ctx, page, posts, state } = await mk(); state.delay = 600; await open(page);
  await fill(page, "qa-c@example.com");
  await page.locator("#join-top form button").first().dblclick({ noWaitAfter: true });
  await page.waitForTimeout(1500);
  ck("a3 dblclick (mouse) -> 1 POST", posts.length === 1, { posts: posts.length });
  await ctx.close(); }
// c) failure then success, same email
{ const { ctx, page, posts, state } = await mk(); state.mode = ["abort", "ok"]; await open(page);
  await fill(page, "qa-retry@example.com");
  await page.locator("#join-top form button").first().click({ noWaitAfter: true });
  await page.waitForSelector("#join-top form .err:not([hidden])", { timeout: 5000 });
  const mid = await rec(page);
  await page.locator("#join-top form button").first().click({ noWaitAfter: true });
  await page.waitForFunction(() => !document.getElementById("conf").hidden, null, { timeout: 5000 });
  const r = await rec(page); const L = leads(r);
  ck("c1 retry carries same eventId", posts.length === 2 && posts[0].eventId && posts[0].eventId === posts[1].eventId, { ids: posts.map((p) => p.eventId) });
  ck("c2 exactly one fbq Lead, eventID == posted eventId", L.length === 1 && L[0][3]?.eventID === posts[1].eventId && mid.fbq.filter((a)=>a[1]==="Lead").length === 0, { leads: L, leadsBeforeRetry: mid.fbq.length });
  ck("c3 one gtag generate_lead and one clarity signup", gl(r).length === 1 && cs(r).length === 1, { gl: gl(r).length, cs: cs(r).length });
  ck("c4 ls joined=1 after new", r.ls === "1", r.ls);
  ck("m3 posted body also has eventSourceUrl and ad d19", posts[1].ad === "d19" && !!posts[1].eventSourceUrl, { ad: posts[1].ad });
  await ctx.close(); }
// d) different email after a failure
{ const { ctx, page, posts, state } = await mk(); state.mode = ["abort", "ok"]; await open(page);
  await fill(page, "qa-first@example.com");
  await page.locator("#join-top form button").first().click({ noWaitAfter: true });
  await page.waitForSelector("#join-top form .err:not([hidden])", { timeout: 5000 });
  await fill(page, "  QA-Second@Example.com ");
  await page.locator("#join-top form button").first().click({ noWaitAfter: true });
  await page.waitForFunction(() => !document.getElementById("conf").hidden, null, { timeout: 5000 });
  const r = await rec(page); const L = leads(r);
  ck("d1 different email after failure -> new eventId + own Lead", posts[0].eventId !== posts[1].eventId && L.length === 1 && L[0][3].eventID === posts[1].eventId, { ids: posts.map((p) => p.eventId), lead: L[0] && L[0][3] });
  await ctx.close(); }
// d2) success A, then B via end form (re-arm Lead guard); also case difference same email = same id
{ const { ctx, page, posts, state } = await mk(); await open(page);
  await fill(page, "qa-A@example.com");
  await page.locator("#join-top form button").first().click({ noWaitAfter: true });
  await page.waitForFunction(() => !document.getElementById("conf").hidden, null, { timeout: 5000 });
  await page.evaluate(() => { const f = document.querySelectorAll(".join form"); const t = f[f.length - 1]; t.email.value = "qa-b2@example.com"; t.requestSubmit(); });
  await page.waitForTimeout(1200);
  const r = await rec(page); const L = leads(r);
  ck("d2 second email after success -> second Lead, different eventID", posts.length === 2 && posts[0].eventId !== posts[1].eventId && L.length === 2 && L[0][3].eventID !== L[1][3].eventID, { ids: posts.map((p) => p.eventId), leads: L.map((l) => l[3].eventID) });
  await ctx.close(); }
// d3) same email resubmitted after success (end form): same id, no second Lead
{ const { ctx, page, posts, state } = await mk(); await open(page);
  await fill(page, "qa-same@example.com");
  await page.locator("#join-top form button").first().click({ noWaitAfter: true });
  await page.waitForFunction(() => !document.getElementById("conf").hidden, null, { timeout: 5000 });
  await page.evaluate(() => { const f = document.querySelectorAll(".join form"); const t = f[f.length - 1]; t.email.value = " QA-SAME@example.com"; t.requestSubmit(); });
  await page.waitForTimeout(1200);
  const r = await rec(page);
  ck("d3 same email (case/space) again -> same eventId, still one Lead", posts.length === 2 && posts[0].eventId === posts[1].eventId && leads(r).length === 1, { ids: posts.map((p) => p.eventId), leads: leads(r).length });
  await ctx.close(); }
// e) repeat
{ const { ctx, page, posts, state } = await mk(); state.mode = ["repeat"]; await open(page);
  await fill(page, "qa-rep@example.com");
  await page.locator("#join-top form button").first().click({ noWaitAfter: true });
  await page.waitForFunction(() => !document.getElementById("conf").hidden, null, { timeout: 5000 });
  const r = await rec(page);
  ck("e1 repeat shows confirmation, zero Lead/generate_lead/signup", r.conf && leads(r).length === 0 && gl(r).length === 0 && cs(r).length === 0, { conf: r.conf, fbq: r.fbq.length, gtag: r.gtag.map((g)=>g[1]), clarity: r.clarity.map((c)=>c.join(":")) });
  ck("e2 ls joined=1 after repeat", r.ls === "1", r.ls);
  // text karlin after repeat carries ad
  await ctx.close(); }
// g) storage throws
{ const { ctx, page, posts } = await mk(); await ctx.addInitScript(() => { Storage.prototype.setItem = function () { throw new Error("QuotaExceeded"); }; });
  await open(page);
  await fill(page, "qa-store@example.com");
  await page.locator("#join-top form button").first().click({ noWaitAfter: true });
  await page.waitForFunction(() => !document.getElementById("conf").hidden, null, { timeout: 5000 }).catch(() => {});
  const r = await rec(page);
  ck("g1 setItem throws -> confirmation still shows", r.conf && leads(r).length === 1, { conf: r.conf, leads: leads(r).length });
  await ctx.close(); }
// h) touch scroll on email field
{ const { ctx, page } = await mk(); await open(page);
  await page.evaluate(() => document.getElementById("em-top").scrollIntoView({ block: "center" }));
  await page.waitForTimeout(500);
  const box = await page.locator("#em-top").boundingBox();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Input.synthesizeScrollGesture", { x: Math.round(box.x + box.width / 2), y: Math.round(box.y + box.height / 2), yDistance: -150, gestureSourceType: "touch", speed: 400 });
  await page.waitForTimeout(600);
  const r1 = await rec(page); const fs1 = r1.gtag.filter((g) => g[1] === "form_start");
  const scrolled = await page.evaluate(() => scrollY);
  ck("h1 touch scroll starting on email field -> no form_start", fs1.length === 0, { form_start: fs1.length, scrollY: scrolled });
  await page.touchscreen.tap(Math.round(box.x + 20), Math.round((await page.locator("#em-top").boundingBox()).y + 10));
  await page.waitForTimeout(400);
  const r2 = await rec(page);
  ck("h2 control: a real tap on the field -> form_start", r2.gtag.filter((g) => g[1] === "form_start").length === 1, r2.gtag.filter((g) => g[1] === "form_start").length);
  await ctx.close(); }
// M5: page load fires no form_start / Lead
{ const { ctx, page } = await mk(); await open(page); await page.waitForTimeout(1500); const r = await rec(page);
  ck("m5 load + autofocus fire no form_start or Lead", r.gtag.filter((g)=>g[1]==="form_start").length===0 && leads(r).length===0, { gtag: r.gtag.map((g)=>g[1]) });
  await ctx.close(); }
await b.close();
console.log("blocked", stats.blocked);
fs.writeFileSync(process.argv[2], JSON.stringify({ blocked: stats.blocked, results }, null, 1));
