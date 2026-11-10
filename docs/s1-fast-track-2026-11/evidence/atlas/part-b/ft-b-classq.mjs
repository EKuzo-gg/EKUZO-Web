// s1-fast-track Part B, Class Q on localhost. usage: node ft-b-classq.mjs <mainBase> <branchBase> <outDir>
// Journey on both builds: open the tagged d19 URL (s1qa=1, QA tags), read the [data-join] hrefs, tap the top
// fast-track link (navigation held by a capture-phase preventDefault so the page and its queues stay), submit the
// top form, read the confirmation. Analytics hosts are stubbed to 204 by host regex, so the "beacons" are the
// calls queued to gtag (dataLayer), fbq (fbq.queue) and clarity (clarity.q). POST /api/season-one is fulfilled
// locally and its bodies are kept. The lists are compared main vs branch with the new events removed.
import { createRequire } from "module";
import fs from "fs";
import path from "path";
const { chromium } = createRequire("/home/claude/")("playwright");
const [mainBase, branchBase, outDir] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const STUB = /(^|\.)(googletagmanager\.com|google-analytics\.com|analytics\.google\.com|google\.com|doubleclick\.net|googleadservices\.com|googlesyndication\.com|clarity\.ms|bing\.com|facebook\.net|facebook\.com)$/i;
const ALLOWED = new Set(["localhost", "127.0.0.1", "fonts.googleapis.com", "fonts.gstatic.com"]);
const URL_ = "/season1?ad=d19&utm_source=meta&utm_medium=paid_social&utm_campaign=s1&utm_content=d19-a&s1qa=1";
const browser = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY, bypass: "localhost,127.0.0.1" } });
const offenders = new Set(), stubbed = new Set();

async function journey(base, label) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true });
  const posts = [], errors = [], navs = [];
  await ctx.route("**/*", (r) => {
    const req = r.request(); const u = new URL(req.url());
    if (STUB.test(u.hostname)) { stubbed.add(u.hostname); return r.fulfill({ status: 204, body: "" }); }
    if (req.method() === "POST" && u.pathname === "/api/season-one") { posts.push(JSON.parse(req.postData() || "{}")); return r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }); }
    return r.continue();
  });
  ctx.on("response", (res) => { const u = new URL(res.url()); if (u.protocol.startsWith("http") && !ALLOWED.has(u.hostname) && !STUB.test(u.hostname)) offenders.add(u.hostname); });
  await ctx.addInitScript(() => { try { localStorage.clear(); } catch (_) {} window.addEventListener("click", (e) => { const a = e.target && e.target.closest && e.target.closest("[data-join]"); if (a) { e.preventDefault(); window.__held = (window.__held || []).concat(a.href); } }, true); });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("framenavigated", (f) => { if (f === page.mainFrame()) navs.push(f.url().replace(base, "")); });
  await page.goto(base + URL_, { waitUntil: "load" });
  await page.waitForTimeout(800);
  const q = () => page.evaluate(() => ({
    ga: (window.dataLayer || []).map((a) => JSON.parse(JSON.stringify(Array.from(a)))).filter((a) => a[0] === "event" || a[0] === "config").map((a) => { const p = Object.assign({}, a[2] || {}); delete p.debug_mode; return [a[0], a[1], p]; }),
    fbq: ((window.fbq && window.fbq.queue) || []).map((a) => JSON.parse(JSON.stringify(Array.from(a)))),
    clarity: ((window.clarity && window.clarity.q) || []).map((a) => JSON.parse(JSON.stringify(Array.from(a)))),
  }));
  const out = { label, base };
  out.hrefs = await page.evaluate(() => [...document.querySelectorAll("[data-join]")].map((a) => ({ where: a.dataset.join, href: a.getAttribute("href"), text: a.textContent })));
  out.atLoad = await q();
  if (out.hrefs.length) {
    await page.locator('[data-join="top"]').scrollIntoViewIfNeeded();
    await page.tap('[data-join="top"]'); await page.waitForTimeout(300);
    out.held = await page.evaluate(() => window.__held || []);
  }
  out.afterTap = await q();
  await page.locator("#em-top").scrollIntoViewIfNeeded();
  await page.fill("#em-top", "qa-classq@example.com");
  await page.locator('#join-top button[type=submit]').tap();
  await page.waitForSelector("#conf:not([hidden])", { timeout: 10000 });
  await page.waitForTimeout(500);
  out.conf = await page.evaluate(() => ({
    kick: document.querySelector("#conf .kick")?.textContent,
    lock: !!document.querySelector("#conf .lock"),
    lockVisible: !!document.querySelector("#conf .lock")?.offsetParent,
    confirmHref: document.querySelector('#conf [data-join="confirm"]')?.getAttribute("href") ?? null,
    confirmText: document.querySelector('#conf [data-join="confirm"]')?.textContent ?? null,
  }));
  await page.screenshot({ path: path.join(outDir, `classq-conf-d19-${label}.png`) });
  out.afterSubmit = await q();
  out.posts = posts; out.errors = errors; out.navs = navs;
  await ctx.close();
  return out;
}
const m = await journey(mainBase, "main"), b = await journey(branchBase, "branch");
const NEW = (x) => JSON.stringify(x).includes("s1_join_click") || JSON.stringify(x).includes("join_click");
const strip = (L) => ({ ga: L.ga.filter((e) => !NEW(e)), fbq: L.fbq, clarity: L.clarity.filter((e) => !NEW(e)) });
const ev = (L, name) => L.ga.filter((e) => e[0] === "event" && e[1] === name);
const leadF = (L) => L.fbq.filter((e) => e[0] === "track" && e[1] === "Lead");
const summary = {
  hrefs: b.hrefs,
  tap: { s1_join_click: ev(b.afterTap, "s1_join_click"), clarity_join_click: b.afterTap.clarity.filter((e) => e[0] === "event" && e[1] === "join_click").length, held: b.held, navigatedAway: b.navs.length > 1 },
  submit: {
    branch: { generate_lead: ev(b.afterSubmit, "generate_lead").length, Lead: leadF(b.afterSubmit).length, leadEventID: leadF(b.afterSubmit).map((e) => e[3] && e[3].eventID), postEventIds: b.posts.map((p) => p.eventId) },
    main: { generate_lead: ev(m.afterSubmit, "generate_lead").length, Lead: leadF(m.afterSubmit).length, leadEventID: leadF(m.afterSubmit).map((e) => e[3] && e[3].eventID), postEventIds: m.posts.map((p) => p.eventId) },
    conf: b.conf, confMain: m.conf,
  },
  equalApartFromNew: {
    ga: JSON.stringify(strip(m.afterSubmit).ga.map((e) => e.slice(0, 2))) === JSON.stringify(strip(b.afterSubmit).ga.map((e) => e.slice(0, 2))),
    gaParams: JSON.stringify(strip(m.afterSubmit).ga) === JSON.stringify(strip(b.afterSubmit).ga),
    fbqNames: JSON.stringify(m.afterSubmit.fbq.map((e) => e.slice(0, 2))) === JSON.stringify(b.afterSubmit.fbq.map((e) => e.slice(0, 2))),
    clarity: JSON.stringify(strip(m.afterSubmit).clarity) === JSON.stringify(strip(b.afterSubmit).clarity),
  },
  gaListMain: m.afterSubmit.ga.map((e) => e[0] + " " + e[1]), gaListBranch: b.afterSubmit.ga.map((e) => e[0] + " " + e[1]),
  fbqMain: m.afterSubmit.fbq.map((e) => e.slice(0, 2).join(" ")), fbqBranch: b.afterSubmit.fbq.map((e) => e.slice(0, 2).join(" ")),
  clarityMain: m.afterSubmit.clarity.map((e) => e.slice(0, 2).join(" ")), clarityBranch: b.afterSubmit.clarity.map((e) => e.slice(0, 2).join(" ")),
  errors: { main: m.errors, branch: b.errors },
  offenders: [...offenders], stubbed: [...stubbed],
};
fs.writeFileSync(path.join(outDir, "classq.json"), JSON.stringify({ summary, main: m, branch: b }, null, 1));
console.log(JSON.stringify(summary, null, 1));
await browser.close();
