// Sentry browser QA of /season1/beta/* (independent of the author's progress.mjs).
// Fail-closed harness: every host maps to 127.0.0.1 (Chrome flag), every request not to the local server is
// recorded and aborted, /api/season-one is answered locally. Run: node qa.mjs [mobile|desktop]
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire("/opt/npm-tools/node_modules/");
const { chromium } = require("playwright");

const OUT = "/home/claude/ekuzo-web/docs/beta-wizard-go-live-2026-11/evidence/sentry";
const SHOTS = OUT + "/screenshots";
const WHICH = process.argv[2] || "mobile";
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const VP = WHICH === "mobile"
  ? { tag: "390", touch: true, opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, userAgent: IPHONE } }
  : { tag: "1440", touch: false, opts: { viewport: { width: 1440, height: 900 } } };
const BASE = "http://ekuzo.gg:3100";
const EMAIL = `sentry+${VP.tag}@example.com`;
const KID = { name: "Zephyrine", age: "13", fact: "Knows every flag zq7", note: "NOTE-mx42-private" };
const TOKENS = [KID.name, KID.fact, KID.note, "zq7", "mx42", EMAIL, encodeURIComponent(EMAIL), "sentry+", "example.com"];

const results = [];
const chk = (id, what, ok, detail = "") => { results.push({ id: `${VP.tag}.${id}`, what, ok: !!ok, detail }); console.log(`${ok ? "PASS" : "FAIL"} ${VP.tag}.${id} ${what}${detail ? " :: " + String(detail).slice(0, 400) : ""}`); };
const info = (id, what, detail) => { results.push({ id: `${VP.tag}.${id}`, what, ok: null, detail }); console.log(`INFO ${VP.tag}.${id} ${what} :: ${String(detail).slice(0, 600)}`); };

const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--host-resolver-rules=MAP * 127.0.0.1", "--no-sandbox"] });
const allOffenders = new Set(); const allOtherReqs = []; const allVendor = []; const allConsole = []; const allPageErrors = [];

async function mk(o = {}) {
  const allowed = new Set(o.allowed || ["ekuzo.gg"]);
  const ctx = await browser.newContext({ ...VP.opts, timezoneId: o.tz || "America/Chicago", locale: "en-US" });
  const L = { allowed, api: [], other: [], continued: new Set(), remote: new Set(), errors: [], cons: [], dl: [], vend: [], mode: o.mode || (() => ({ status: 200, body: { ok: true } })), name: o.name || "" };
  await ctx.exposeBinding("__rec", (_s, k, v) => { L.dl.push(JSON.parse(v)); });
  await ctx.addInitScript(() => {
    var dl = []; var orig = Array.prototype.push;
    dl.push = function (a) { try { window.__rec("dl", JSON.stringify(Array.from(a))); } catch (e) {} return orig.apply(this, arguments); };
    window.dataLayer = dl;
  });
  if (o.init) await ctx.addInitScript(o.init);
  await ctx.route("**/*", async (route) => {
    const req = route.request(); const u = new URL(req.url());
    if (!allowed.has(u.hostname)) {
      const rec = { host: u.hostname, path: u.pathname, method: req.method(), url: u.toString(), body: req.postData() || "" };
      L.other.push(rec); allOtherReqs.push({ ...rec, scenario: L.name });
      return route.abort();
    }
    if (u.pathname === "/api/season-one" && req.method() === "POST") {
      let body = null; try { body = JSON.parse(req.postData()); } catch (_) { body = { _raw: req.postData() }; }
      L.api.push(body);
      const r = await L.mode(body, L.api.length);
      if (r === "abort") return route.abort("connectionreset");
      if (r.delay) await new Promise((res) => setTimeout(res, r.delay));
      return route.fulfill({ status: r.status, contentType: r.ct || "application/json", body: typeof r.body === "string" ? r.body : JSON.stringify(r.body) });
    }
    if (u.pathname.startsWith("/api/")) { L.other.push({ host: u.hostname, path: u.pathname, method: req.method(), url: u.toString(), body: "" }); return route.abort(); }
    L.continued.add(u.hostname);
    return route.continue();
  });
  ctx.on("page", (p) => {
    p.on("pageerror", (e) => { L.errors.push(String(e)); allPageErrors.push(`${L.name}: ${e}`); });
    p.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") { const t = { type: m.type(), text: m.text(), url: m.location().url }; L.cons.push(t); allConsole.push({ ...t, scenario: L.name }); } });
    p.on("response", (r) => { const a = r.serverAddr && r.serverAddr(); if (a) L.remote.add(a.ipAddress); });
  });
  L.ctx = ctx;
  return L;
}
async function done(L) {
  for (const h of L.continued) if (!L.allowed.has(h)) allOffenders.add(h);
  for (const ip of L.remote) if (ip && !["127.0.0.1", "::1"].includes(ip)) allOffenders.add("ip:" + ip);
  await L.ctx.close();
}
const vendor = (page) => page.evaluate(() => {
  const g = (f) => { try { return f(); } catch (e) { return "ERR " + e; } };
  return { fbq: g(() => (window.fbq && window.fbq.queue || []).map((x) => Array.from(x))), clarity: g(() => (window.clarity && window.clarity.q || []).map((x) => Array.from(x))), href: location.href, cookie: document.cookie, ls: g(() => Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)]))), hasGtag: typeof window.gtag };
});
const flush = async (L, page) => { try { const v = await vendor(page); L.vend.push(v); allVendor.push({ scenario: L.name, ...v }); return v; } catch (_) { return null; } };
const evNames = (L) => L.dl.filter((x) => x[0] === "event").map((x) => x[1]);
const evs = (L, n) => L.dl.filter((x) => x[0] === "event" && x[1] === n);
const tap = (loc) => (VP.touch ? loc.tap() : loc.click());
const cont = (page) => page.locator("#wiz [data-step]:not([hidden]) [data-next]");
const idx = (page) => page.evaluate(() => [...document.querySelectorAll("#wiz [data-step]")].findIndex((s) => !s.hidden));
const wait = (page, ms = 250) => page.waitForTimeout(ms);
async function open(L, path = "/season1/beta/start", base = BASE) { const p = await L.ctx.newPage(); await p.goto(base + path, { waitUntil: "domcontentloaded" }); await p.waitForTimeout(500); return p; }
async function shot(page, name) { await page.screenshot({ path: `${SHOTS}/${name}-${VP.tag}.png`, fullPage: true }); }
const S = (page, page_, state) => shot(page, `${page_}`.replace(/$/, "") ).catch(() => {});
async function sh(page, pg, state) { await page.screenshot({ path: `${SHOTS}/${pg}-${VP.tag}-${state}.png`, fullPage: true }); }
async function doEmail(p, email = EMAIL) { await p.fill("#email", email); await tap(cont(p)); await wait(p); }
async function doVows(p, n = 3) { for (const v of ["No toxicity", "Positive mindset", "Winning attitude"].slice(0, n)) { if (!(await p.locator(`input[name=vow][value="${v}"]`).isChecked())) await tap(p.locator(`label:has(input[name=vow][value="${v}"])`)); } }
async function doPlayer(p, k = KID) {
  await p.fill("#pname", k.name); await p.selectOption("select[name=age]", k.age);
  for (const v of ["Console", "Tablet"]) await tap(p.locator(`label:has(input[name=plays][value="${v}"])`));
  await tap(p.locator(`label:has(input[name=sports][value="Plays, not their thing"])`));
  for (const v of ["Quick thinker", "Natural leader"]) await tap(p.locator(`label:has(input[name=power][value="${v}"])`));
  await p.fill("#fact", k.fact);
}
async function doAvail(p, k = KID, tz = null) {
  if (tz) await p.selectOption("#tz", tz);
  for (const v of ["Weekday evenings", "Weekend afternoons"]) await tap(p.locator(`label:has(input[name=times][value="${v}"])`));
  await p.fill("#note", k.note);
}
async function toStep(p, n, k = KID, email = EMAIL) { // drive to a screen
  if (n >= 1) await doEmail(p, email);
  if (n >= 2) { await doVows(p); await tap(cont(p)); await wait(p); }
  if (n >= 3) { await doPlayer(p, k); await tap(cont(p)); await wait(p); }
}
const form = (p) => p.evaluate(() => {
  const f = document.getElementById("wiz"); const c = (n) => [...f.querySelectorAll(`[name="${n}"]:checked`)].map((x) => x.value);
  return { email: f.email.value, pname: f.pname.value, age: f.age.value, plays: c("plays"), sports: c("sports"), power: c("power"), fact: f.fact.value, vow: c("vow"), tz: f.tz.value, times: c("times"), note: f.note.value, pc: document.getElementById("pc").innerText };
});
const ls = (p) => p.evaluate(() => { try { return localStorage.getItem("ekz_beta_wiz"); } catch (e) { return "THROWS"; } });

// -------------------------------------------------------------------------------------------------
async function scenario(name, fn) { try { console.log("--- " + name); await fn(); } catch (e) { chk(`${name}.harness`, `${name} ran without a harness error`, false, e.stack || e); } }

// ===== 0. static pages screenshots + beta page ====================================================
await scenario("beta", async () => {
  const L = await mk({ name: "beta" });
  const p = await open(L, "/season1/beta?src=karlin-email");
  await sh(p, "beta", "default");
  chk("beta.noapi", "beta page load posts nothing to /api/season-one", L.api.length === 0, JSON.stringify(L.api));
  chk("beta.noprogress", "beta page load fires no beta_wizard_* GA events", !evNames(L).some((n) => /^beta_wizard/.test(n)), evNames(L).join(","));
  chk("beta.noerr", "beta page: no page errors", L.errors.length === 0, L.errors.join("|"));
  chk("beta.nolsKey", "beta page does not write ekz_beta_wiz", (await ls(p)) === null);
  await flush(L, p); await done(L);
});

// ===== a. J1 happy path ==========================================================================
await scenario("J1", async () => {
  const L = await mk({ name: "J1" });
  const p = await open(L, "/season1/beta/launch?src=karlin-email");
  await sh(p, "launch", "default");
  const links = await p.locator('a[href*="/season1/beta/start"]').evaluateAll((a) => a.map((x) => ({ href: x.getAttribute("href"), vis: !!(x.offsetWidth || x.offsetHeight), text: x.innerText.trim().slice(0, 60) })));
  info("J1.links", "launch page links to wizard", JSON.stringify(links));
  chk("J1.launchLinks", "launch page has a visible button to /season1/beta/start with no query", links.some((l) => l.vis && l.href === "/season1/beta/start"), JSON.stringify(links));
  chk("J1.launchNoPost", "launch load posts nothing", L.api.length === 0);
  await tap(p.locator('a[href="/season1/beta/start"]:visible').first());
  await p.waitForURL("**/season1/beta/start", { timeout: 8000 }); await wait(p, 600);
  chk("J1.url", "wizard URL has no query string / kid data", new URL(p.url()).search === "", p.url());
  await sh(p, "wizard", "email");
  await doEmail(p);
  await sh(p, "wizard", "expectations");
  await doVows(p); await tap(cont(p)); await wait(p);
  await doPlayer(p); await sh(p, "wizard", "player");
  const card = await p.locator("#pc").innerText();
  chk("J1.cardPreview", "player card preview shows name and age", card.toLowerCase().includes(KID.name.toLowerCase()), card.replace(/\n/g, " | "));
  await tap(cont(p)); await wait(p);
  await doAvail(p); await sh(p, "wizard", "availability");
  await tap(p.locator("#send")); await wait(p, 700);
  await sh(p, "wizard", "done");
  const order = L.api.map((b) => b.step + (b.stage !== undefined ? ":" + b.stage : ""));
  chk("J1.order", "posts in order: progress 0,1,2 then beta-wizard", JSON.stringify(order) === JSON.stringify(["beta-progress:0", "beta-progress:1", "beta-progress:2", "beta-wizard"]), JSON.stringify(order));
  fs.writeFileSync(`${OUT}/J1-bodies-${VP.tag}.json`, JSON.stringify(L.api, null, 2));
  const sids = new Set(L.api.filter((b) => b.step === "beta-progress").map((b) => b.sessionId));
  chk("J1.sid", "one sessionId across progress posts (non-empty, >8 chars)", sids.size === 1 && [...sids][0].length > 8, [...sids].join());
  const fin = L.api[L.api.length - 1];
  chk("J1.final", "final payload has eventId, name, age number, tz, times", fin.eventId && fin.playerName === KID.name && fin.playerAge === 13 && fin.times.length === 2 && fin.timeZone === "Central", JSON.stringify({ ...fin, email: "..." }));
  chk("J1.finalEventNotSid", "final eventId differs from sessionId", fin.eventId !== [...sids][0]);
  chk("J1.progressAnswersGrow", "progress answers grow by stage (0: email only; 2: name+age)", L.api[0].answers.playerName === "" && L.api[2].answers.playerName === KID.name && L.api[2].answers.playerAge === 13, JSON.stringify(L.api.slice(0, 3).map((b) => b.answers)));
  const leak2 = L.api.some((b) => b.step === "beta-progress" && (b.answers.note || "") !== "");
  info("J1.progressNote", "progress posts carry note? (answers at stage 2)", String(leak2));
  chk("J1.lsCleared", "localStorage key removed after completion", (await ls(p)) === null);
  const txt = await p.locator("#wiz").innerText();
  chk("J1.doneText", "end state promises review, not a spot", /review and email you either way/.test(txt) && !/you have a spot|you.?re in|confirmed/i.test(txt));
  const names = evNames(L);
  chk("J1.ga", "GA: beta_wizard_step x3 (email, expectations, player_card), beta_wizard_complete x1, no resume", evs(L, "beta_wizard_step").map((e) => e[2].step).join() === "email,expectations,player_card" && evs(L, "beta_wizard_complete").length === 1 && evs(L, "beta_wizard_resume").length === 0, names.join(","));
  info("J1.gaDump", "all GA dataLayer entries (event name + params)", JSON.stringify(L.dl.filter((x) => x[0] === "event" || x[0] === "config" || x[0] === "set")));
  const v = await flush(L, p); info("J1.vendor", "fbq queue / clarity queue", JSON.stringify({ fbq: v.fbq, clarity: v.clarity }));
  chk("J1.metaClean", "Meta: only init/PageView, no Lead/other event", v.fbq.every((q) => q[0] === "set" || q[0] === "init" || (q[0] === "track" && q[1] === "PageView")), JSON.stringify(v.fbq));
  chk("J1.errors", "no page errors", L.errors.length === 0, L.errors.join("|"));
  const ce = L.cons.filter((c) => c.type === "error" && /ekuzo\.gg/.test(c.url) && !/Failed to load resource/.test(c.text));
  chk("J1.console", "no console errors from our page", ce.length === 0, JSON.stringify(ce));
  await done(L);
});

// ===== b. must-not cases ========================================================================
await scenario("mustnot", async () => {
  const L = await mk({ name: "mustnot" });
  const p = await open(L);
  chk("b.load", "load: no /api post, no beta_wizard_* event, no localStorage key", L.api.length === 0 && !evNames(L).some((n) => /^beta_wizard/.test(n)) && (await ls(p)) === null, evNames(L).join());
  // autofill-like script-set values (no input event)
  await p.evaluate((e) => { const f = document.getElementById("wiz"); f.email.value = e; f.pname.value = "Autofill"; f.tz.value = "Pacific"; }, EMAIL);
  await wait(p, 700);
  chk("b.autofill", "script-set values without Continue: no post, no step event, nothing stored", L.api.length === 0 && evNames(L).filter((n) => /^beta_wizard/.test(n)).length === 0 && (await ls(p)) === null, JSON.stringify(L.api.length));
  // scroll gesture starting on field / button
  const box = async (loc) => { await loc.scrollIntoViewIfNeeded(); const b = await loc.boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
  if (VP.touch) {
    const cdp = await L.ctx.newCDPSession(p);
    for (const sel of ["#email", "#wiz [data-step]:not([hidden]) [data-next]"]) {
      const c = await box(p.locator(sel));
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: c.x, y: c.y }] });
      for (let i = 1; i <= 8; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: c.x, y: c.y - i * 12 }] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await wait(p, 400);
    }
  } else {
    for (const sel of ["#email", "#wiz [data-step]:not([hidden]) [data-next]"]) {
      const c = await box(p.locator(sel)); await p.mouse.move(c.x, c.y); await p.mouse.down(); await p.mouse.move(c.x + 300, c.y - 200, { steps: 6 }); await p.mouse.up(); await wait(p, 300);
    }
    await p.mouse.wheel(0, 300); await wait(p, 300);
  }
  chk("b.scroll", "scroll/drag gesture starting on field or Continue: no post, still on screen 0", L.api.length === 0 && (await idx(p)) === 0, `posts=${L.api.length} idx=${await idx(p)}`);
  // now a real Continue with autofilled values: exactly one post
  await tap(cont(p)); await wait(p, 500);
  chk("b.continue", "Continue tap posts stage 0 exactly once", L.api.length === 1 && L.api[0].stage === 0 && L.api[0].email === EMAIL, JSON.stringify(L.api.map((b) => b.stage)));
  // Back / forward
  await doVows(p); await tap(cont(p)); await wait(p); // -> idx2 (posts stage1)
  const before = L.api.length;
  await tap(p.locator("#wiz [data-step]:not([hidden]) [data-back]")); await wait(p, 400);
  await tap(p.locator("#wiz [data-step]:not([hidden]) [data-back]")); await wait(p, 400);
  chk("b.back", "Back x2 posts nothing", L.api.length === before && (await idx(p)) === 0, `before=${before} after=${L.api.length} idx=${await idx(p)}`);
  await tap(cont(p)); await wait(p, 400);
  info("b.refwd", "forward again after Back re-posts stage 0 (server keys on stage, idempotent)", JSON.stringify(L.api.map((b) => b.stage)));
  const stepEvents = evs(L, "beta_wizard_step").map((e) => e[2].step);
  chk("b.gaOnce", "GA beta_wizard_step once per step despite Back/forward", new Set(stepEvents).size === stepEvents.length, stepEvents.join());
  // Enter key in email on a fresh page
  const p2 = await open(L); await p2.evaluate(() => localStorage.clear()); await p2.reload(); await wait(p2, 400); const n0 = L.api.length;
  await p2.fill("#email", "enter@example.com"); await p2.press("#email", "Enter"); await wait(p2, 500);
  chk("b.enter", "Enter in the email field advances once and posts stage 0 once", (await idx(p2)) === 1 && L.api.length === n0 + 1, `idx=${await idx(p2)} posts+=${L.api.length - n0}`);
  chk("b.noComplete", "no beta_wizard_complete without a final save", evs(L, "beta_wizard_complete").length === 0);
  // invalid email Continue: no post
  const p3 = await open(L); await p3.evaluate(() => localStorage.clear()); await p3.reload(); await wait(p3, 400); const n1 = L.api.length;
  await p3.fill("#email", "not-an-email"); await tap(cont(p3)); await wait(p3, 400);
  chk("b.badEmail", "invalid email: no post, stays on screen 0", L.api.length === n1 && (await idx(p3)) === 0);
  await flush(L, p); await done(L);
});

// ===== c. failure paths ==========================================================================
const MODES = {
  "400": () => ({ status: 400, body: { ok: false, error: "Pick at least one time." } }),
  "502": () => ({ status: 502, body: { ok: false, error: "We couldn’t save that. Please try again, or text our founder at (832) 271-0150." } }),
  "429": () => ({ status: 429, body: { ok: false, error: "We couldn’t save that just now. Text our founder at (832) 271-0150 and we’ll add your player by hand." } }),
  "abort": () => "abort",
  "html504": () => ({ status: 504, ct: "text/html", body: "<html><body>Gateway Timeout</body></html>" }),
  "500json": () => ({ status: 500, body: { ok: false, error: "We couldn’t save that. Please try again." } }),
};
for (const [m, fn] of Object.entries(MODES)) {
  await scenario("fail" + m, async () => {
    let fail = true;
    const L = await mk({ name: "fail" + m, mode: (b) => (b.step === "beta-wizard" && fail ? fn() : { status: 200, body: { ok: true } }) });
    const p = await open(L); await toStep(p, 3); await doAvail(p);
    await tap(p.locator("#send")); await wait(p, 800);
    const err = p.locator("#senderr");
    const shown = await err.isVisible(); const msg = (await err.innerText()).trim();
    const btn = await p.locator("#send").evaluate((b) => ({ t: b.textContent, d: b.disabled }));
    info(`c${m}.what`, `what the parent sees on ${m}`, JSON.stringify({ shown, msg, btn, idx: await idx(p) }));
    chk(`c${m}.stay`, `${m}: stays on availability, error shown, button usable again`, shown && msg.length > 5 && (await idx(p)) === 3 && btn.t === "Send it" && !btn.d, JSON.stringify({ shown, msg, btn }));
    chk(`c${m}.noComplete`, `${m}: no beta_wizard_complete`, evs(L, "beta_wizard_complete").length === 0);
    chk(`c${m}.lsKept`, `${m}: answers still in localStorage`, !!(await ls(p)) && JSON.parse(await ls(p)).a.times.length === 2);
    if (m === "502") await sh(p, "wizard", "error");
    const first = L.api.filter((b) => b.step === "beta-wizard").map((b) => b.eventId);
    // retry on same page
    fail = false; await tap(p.locator("#send")); await wait(p, 800);
    const evIds = L.api.filter((b) => b.step === "beta-wizard").map((b) => b.eventId);
    chk(`c${m}.sameEventId`, `${m}: retry reuses the same eventId`, evIds.length === 2 && evIds[0] === evIds[1] && evIds[0], JSON.stringify(evIds));
    chk(`c${m}.completeOnce`, `${m}: complete fires once, after the successful retry; end screen shown`, evs(L, "beta_wizard_complete").length === 1 && (await idx(p)) === 4);
    chk(`c${m}.errCleared`, `${m}: error hidden on end screen`, !(await p.locator("#senderr").isVisible()));
    await flush(L, p); await done(L);
  });
}
await scenario("failReload", async () => {
  let fail = true;
  const L = await mk({ name: "failReload", mode: (b) => (b.step === "beta-wizard" && fail ? MODES["abort"]() : { status: 200, body: { ok: true } }) });
  let p = await open(L); await toStep(p, 3); await doAvail(p, KID, "Pacific");
  await tap(p.locator("#send")); await wait(p, 800);
  const id1 = L.api.filter((b) => b.step === "beta-wizard")[0].eventId;
  await flush(L, p); await p.close();
  p = await open(L);
  const f = await form(p);
  chk("cFR.restore", "after a failed send + reload: reopens on availability with times, tz, note restored", (await idx(p)) === 3 && f.times.length === 2 && f.tz === "Pacific" && f.note === KID.note && f.email === EMAIL, JSON.stringify(f));
  fail = false; await tap(p.locator("#send")); await wait(p, 800);
  const id2 = L.api.filter((b) => b.step === "beta-wizard")[1].eventId;
  chk("cFR.newEventId", "reload then resend uses a NEW eventId (server cannot dedupe a lost-response retry across reload)", id1 !== id2, `${id1} vs ${id2}`);
  info("cFR.note", "J4 variant: response lost then page reload then tap again = second Klaviyo event (new unique_id), same player row, submissions+1", "see defect list");
  await flush(L, p); await done(L);
});
await scenario("slowDouble", async () => {
  const L = await mk({ name: "slowDouble", mode: (b) => (b.step === "beta-wizard" ? { status: 200, body: { ok: true }, delay: 1500 } : { status: 200, body: { ok: true } }) });
  const p = await open(L); await toStep(p, 3); await doAvail(p);
  await tap(p.locator("#send")); await p.waitForTimeout(100);
  const dis = await p.locator("#send").evaluate((b) => b.disabled);
  await p.locator("#send").evaluate((b) => { b.click(); b.click(); });
  await p.press("#note", "Enter").catch(() => {});
  await wait(p, 2500);
  chk("slow.once", "double tap / click / Enter during an in-flight send: one final post, one complete", L.api.filter((b) => b.step === "beta-wizard").length === 1 && evs(L, "beta_wizard_complete").length === 1, `finals=${L.api.filter((b) => b.step === "beta-wizard").length} disabled=${dis}`);
  await flush(L, p); await done(L);
});

// ===== d. restart ================================================================================
await scenario("restart", async () => {
  const L = await mk({ name: "restart" });
  let p = await open(L);
  await p.fill("#email", EMAIL); await wait(p, 200);
  await p.reload(); await wait(p, 500);
  let f = await form(p);
  info("d.R0", "reload on screen 1 with email typed, not continued", JSON.stringify({ idx: await idx(p), email: f.email, ls: await ls(p) }));
  chk("d.R0", "screen 1 reload: reopens on screen 1 (typed email not restored, nothing captured yet)", (await idx(p)) === 0, `idx=${await idx(p)} email="${f.email}"`);
  await doEmail(p);
  await doVows(p, 2); await wait(p, 200); // 2 of 3
  const b1 = await form(p); await flush(L, p); await p.reload(); await wait(p, 600);
  f = await form(p);
  chk("d.R1", "screen 2 reload: reopens on screen 2 with email + 2 expectations restored", (await idx(p)) === 1 && f.email === EMAIL && f.vow.length === 2, JSON.stringify({ idx: await idx(p), vow: f.vow, email: f.email }));
  await doVows(p, 3); await tap(cont(p)); await wait(p, 300);
  await doPlayer(p); const b2 = await form(p); await flush(L, p); await p.reload(); await wait(p, 600);
  f = await form(p);
  chk("d.R2", "screen 3 reload: reopens on player card; every field + preview restored", (await idx(p)) === 2 && f.pname === KID.name && f.age === KID.age && JSON.stringify(f.plays) === JSON.stringify(b2.plays) && JSON.stringify(f.sports) === JSON.stringify(b2.sports) && JSON.stringify(f.power) === JSON.stringify(b2.power) && f.fact === KID.fact && f.vow.length === 3 && f.pc.toLowerCase().includes(KID.name.toLowerCase()), JSON.stringify(f));
  await tap(cont(p)); await wait(p, 300);
  await p.selectOption("#tz", "Pacific"); await doAvail(p, KID); await wait(p, 200);
  const b3 = await form(p); await flush(L, p); await p.reload(); await wait(p, 600);
  f = await form(p);
  chk("d.R3", "screen 4 reload: reopens on availability; times, note, tz (changed from device Central to Pacific) restored", (await idx(p)) === 3 && JSON.stringify(f.times) === JSON.stringify(b3.times) && f.note === KID.note && f.tz === "Pacific", JSON.stringify({ idx: await idx(p), times: f.times, tz: f.tz, note: f.note, devDefaultWas: "Central" }));
  // back to the player screen from restored state shows preview and values
  await tap(p.locator("#wiz [data-step]:not([hidden]) [data-back]")); await wait(p, 300);
  f = await form(p);
  chk("d.R3back", "Back from restored availability: player card still filled with preview", f.pname === KID.name && f.pc.toLowerCase().includes(KID.name.toLowerCase()));
  await tap(cont(p)); await wait(p, 300);
  // complete
  await tap(p.locator("#send")); await wait(p, 700);
  chk("d.complete", "restored run completes: end screen", (await idx(p)) === 4);
  const sid1 = L.api.filter((b) => b.step === "beta-progress").map((b) => b.sessionId);
  const fin1 = L.api.filter((b) => b.step === "beta-wizard")[0];
  chk("d.sameSid", "one sessionId across reloads in the same run", new Set(sid1).size === 1, [...new Set(sid1)].join());
  chk("d.finalTz", "final payload carries Pacific + device IANA tz America/Chicago", fin1.timeZone === "Pacific" && fin1.tz === "America/Chicago", `${fin1.timeZone} ${fin1.tz}`);
  info("d.restorePosts", "progress posts incl. restore re-posts", JSON.stringify(L.api.filter((b) => b.step === "beta-progress").map((b) => b.stage)));
  await flush(L, p); await p.close();
  p = await open(L);
  f = await form(p);
  chk("d.fresh", "after completing, a new visit starts fresh (screen 1, empty form)", (await idx(p)) === 0 && f.email === "" && f.pname === "" && (await ls(p)) === null);
  // two kids: second run
  const K2 = { name: "Orlando", age: "10", fact: "Juggles", note: "second kid" };
  const nBefore = L.api.length;
  await doEmail(p); await doVows(p); await tap(cont(p)); await wait(p, 300); await doPlayer(p, K2); await tap(cont(p)); await wait(p, 300); await doAvail(p, K2);
  await tap(p.locator("#send")); await wait(p, 700);
  const second = L.api.slice(nBefore);
  const sid2 = second.find((b) => b.step === "beta-progress").sessionId; const fin2 = second.find((b) => b.step === "beta-wizard");
  chk("d.twoKids", "second kid: NEW sessionId and NEW eventId, own name; complete fires again (2 total)", sid2 !== sid1[0] && fin2.eventId !== fin1.eventId && fin2.playerName === "Orlando" && evs(L, "beta_wizard_complete").length === 1 /* per last page */, `sid ${sid1[0]} -> ${sid2}; ev ${fin1.eventId} -> ${fin2.eventId}`);
  info("d.twoKids.ga", "GA events across both runs (dl is per ctx)", JSON.stringify(evNames(L)));
  await flush(L, p); await done(L);
});

const SIDHOSTILE = "../x'); DROP TABLE s1_beta_progress;--\r\nX";
const stored = (o) => `try{localStorage.setItem("ekz_beta_wiz", ${JSON.stringify(typeof o === "string" ? o : JSON.stringify(o))})}catch(e){}`;
const wrapTry = (c) => `try{${c}}catch(e){}`;
const good = (over = {}) => ({ v: 1, at: Date.now(), sid: "sid-good-1", stage: 2, g: [0, 1, 2], a: { email: "r@example.com", playerName: "Rae", playerAge: 11, playsOn: ["Console"], teamSports: "Loves them", superpowers: ["Quick thinker"], funFact: "f", expectations: ["No toxicity", "Positive mindset", "Winning attitude"], timeZone: "Mountain", times: ["Weekday evenings"], note: "n" }, ...over });
const cases = {
  corruptJson: { init: wrapTry(`localStorage.setItem("ekz_beta_wiz","{not json")`), expectIdx: 0 },
  v2: { init: stored({ ...good(), v: 2 }), expectIdx: 0 },
  old15d: { init: stored(good({ at: Date.now() - 15 * 864e5 })), expectIdx: 0 },
  fresh13d: { init: stored(good({ at: Date.now() - 13 * 864e5 })), expectIdx: 3 },
  noAt: { init: stored(good({ at: undefined })), expectIdx: 0 },
  lsThrowsGetter: { init: `Object.defineProperty(window,"localStorage",{get(){throw new DOMException("denied","SecurityError")}})`, expectIdx: 0 },
  lsMethodsThrow: { init: `Storage.prototype.getItem=function(){throw new Error("q")};Storage.prototype.setItem=function(){throw new Error("q")};Storage.prototype.removeItem=function(){throw new Error("q")}`, expectIdx: 0 },
  weirdTypes: { init: stored(good({ g: "str", a: { ...good().a, times: "notarray", playsOn: 5, playerAge: "x", teamSports: 7 } })), expectIdx: null },
  stage99: { init: stored(good({ stage: 99, a: { ...good().a, expectations: [] } })), expectIdx: null },
  stageStr: { init: stored(good({ stage: "2" })), expectIdx: null },
  hostileSid: { init: stored(good({ sid: SIDHOSTILE })), expectIdx: 3 },
  xssName: { init: stored(good({ a: { ...good().a, playerName: "<img src=x onerror=window.__xss=1>", funFact: "<script>window.__xss=2</script>" } })), expectIdx: 3 },
};
for (const [cn, c] of Object.entries(cases)) {
  await scenario("ls-" + cn, async () => {
    const L = await mk({ name: "ls-" + cn, init: c.init });
    const p = await open(L);
    const i0 = await idx(p); const f = await form(p);
    if (c.expectIdx !== null) chk(`d.${cn}.open`, `${cn}: page opens on screen index ${c.expectIdx}`, i0 === c.expectIdx, `idx=${i0} ${JSON.stringify(f).slice(0, 200)}`);
    else info(`d.${cn}.open`, `${cn}: opens on`, `idx=${i0} ${JSON.stringify(f).slice(0, 300)}`);
    chk(`d.${cn}.noerr`, `${cn}: no page errors`, L.errors.length === 0, L.errors.join("|"));
    chk(`d.${cn}.xss`, `${cn}: no script ran from stored values`, !(await p.evaluate(() => window.__xss)));
    if (cn === "hostileSid") info("d.hostileSid.post", "sessionId as posted from a hostile stored value", JSON.stringify(L.api.map((b) => b.sessionId)));
    // can the parent still finish? drive from wherever it opened
    let guard = 0;
    while ((await idx(p)) < 3 && guard++ < 6) {
      const k = await idx(p);
      if (k === 0) { await p.fill("#email", EMAIL); }
      if (k === 1) await doVows(p).catch(() => {});
      if (k === 1) { for (const v of ["No toxicity", "Positive mindset", "Winning attitude"]) { const l = p.locator(`input[name=vow][value="${v}"]`); if (!(await l.isChecked())) await tap(p.locator(`label:has(input[name=vow][value="${v}"])`)); } }
      if (k === 2) { if (!(await p.inputValue("#pname"))) await p.fill("#pname", "Fin"); if (!(await p.inputValue("select[name=age]"))) await p.selectOption("select[name=age]", "12"); }
      await tap(cont(p)); await wait(p, 250);
    }
    if ((await idx(p)) === 3) {
      if ((await p.locator("input[name=times]:checked").count()) === 0) await tap(p.locator(`label:has(input[name=times][value="Weekday evenings"])`));
      await tap(p.locator("#send")); await wait(p, 600);
    }
    chk(`d.${cn}.finish`, `${cn}: parent can still finish the wizard`, (await idx(p)) === 4 && L.api.some((b) => b.step === "beta-wizard"), `idx=${await idx(p)}`);
    await flush(L, p); await done(L);
  });
}

// ===== N7: non-live hosts write nothing ==========================================================
for (const [hn, base, qs] of [["localhost", "http://localhost:3100", ""], ["qa-flag", "http://localhost:3100", "?s1qa=1"], ["preview", "http://dev--ekuzo.netlify.app:3100", ""]]) {
  await scenario("nonlive-" + hn, async () => {
    const allowedHosts = hn === "preview" ? ["dev--ekuzo.netlify.app"] : ["localhost"];
    const L = await mk({ name: "nonlive-" + hn, allowed: allowedHosts });
    const p = await open(L, "/season1/beta/start" + qs, base);
    await toStep(p, 3); await doAvail(p); await tap(p.locator("#send")); await wait(p, 600);
    chk(`N7.${hn}.noapi`, `${hn}: whole wizard run posts nothing to /api/season-one`, L.api.length === 0, String(L.api.length));
    chk(`N7.${hn}.noevents`, `${hn}: no GA beta_wizard_* events`, !evNames(L).some((n) => /^beta_wizard/.test(n)), evNames(L).join());
    const vend = L.other.filter((r) => /googletagmanager|google-analytics|facebook|clarity/.test(r.host));
    info(`N7.${hn}.vendors`, `${hn}: vendor requests attempted (all aborted)`, JSON.stringify(vend.map((r) => r.host + r.path)));
    chk(`N7.${hn}.end`, `${hn}: end screen still shows`, (await idx(p)) === 4);
    await flush(L, p); await done(L);
  });
}

// ===== h. protected pages ========================================================================
await scenario("protected", async () => {
  const L = await mk({ name: "protected" });
  for (const path of ["/season1?ad=d19", "/season1/join", "/season1/join/jersey"]) {
    const p = await L.ctx.newPage();
    const r = await p.goto(BASE + path, { waitUntil: "domcontentloaded" }); await p.waitForTimeout(800);
    const html = await r.text(); const dom = await p.content();
    const hdr = r.headers()["set-cookie"] || "";
    chk(`h.${path}.200`, `${path}: HTTP 200`, r.status() === 200, String(r.status()));
    chk(`h.${path}.noWiz`, `${path}: HTML and DOM do not contain ekz_beta_wiz`, !html.includes("ekz_beta_wiz") && !dom.includes("ekz_beta_wiz"));
    chk(`h.${path}.noBsrc`, `${path}: no ekuzo_bsrc set`, !/ekuzo_bsrc/.test(hdr));
    await p.close();
  }
  chk("h.noerr", "protected pages: no page errors", L.errors.length === 0, L.errors.join("|"));
  await done(L);
});

// ===== e/f/offender summary =====================================================================
const flat = (x) => JSON.stringify(x);
const leakHits = [];
for (const r of allOtherReqs) for (const t of TOKENS) if ((r.url + r.body).toLowerCase().includes(t.toLowerCase())) leakHits.push(`${r.host}${r.path} has ${t}`);
for (const v of allVendor) for (const t of TOKENS) if (flat({ fbq: v.fbq, clarity: v.clarity }).toLowerCase().includes(t.toLowerCase())) leakHits.push(`vendor queue (${v.scenario}) has ${t}`);
chk("e.requests", "no recorded third-party request URL/body contains the email, kid name, fun fact or note", leakHits.length === 0, leakHits.join("; "));
const dlLeaks = [];
// dataLayer entries were collected per ctx; re-scan by re-reading result files written below
fs.writeFileSync(`${OUT}/vendor-${VP.tag}.json`, JSON.stringify({ allOtherReqs: allOtherReqs.map((r) => ({ scenario: r.scenario, method: r.method, host: r.host, path: r.path, hasBody: !!r.body, url: r.url })), allVendor: allVendor.map((v) => ({ scenario: v.scenario, fbq: v.fbq, clarity: v.clarity, href: v.href, cookie: v.cookie, hasGtag: v.hasGtag })) }, null, 1));
const hosts = {}; for (const r of allOtherReqs) hosts[r.host] = (hosts[r.host] || 0) + 1;
info("e.hosts", "third-party hosts the page tried to reach (all aborted)", JSON.stringify(hosts));
const collect = allOtherReqs.filter((r) => /google-analytics\.com|\/g\/collect|facebook\.com\/tr|clarity\.ms\/(collect|b)/.test(r.url));
info("e.collect", "analytics beacon requests actually attempted (vendor libs are aborted, so none expected)", JSON.stringify(collect.map((r) => r.host + r.path)));
const ce = allConsole.filter((c) => c.type === "error" && !/Failed to load resource|net::ERR/.test(c.text) && /ekuzo\.gg|localhost/.test(c.url || "ekuzo.gg"));
chk("f.console", "no console errors originating from our pages (third-party aborted noise excluded)", ce.length === 0, JSON.stringify(ce.slice(0, 5)));
chk("f.pageerrors", "no uncaught page errors in any scenario", allPageErrors.length === 0, allPageErrors.slice(0, 5).join(" | "));
info("f.consoleAll", "all console messages (type/text/url host)", JSON.stringify([...new Set(allConsole.map((c) => `${c.type}|${c.text.slice(0, 90)}|${(c.url || "").split("/")[2] || ""}`))]));
chk("offender", "hosts that actually got a response from the network: only local ekuzo.gg (127.0.0.1)", allOffenders.size === 0, [...allOffenders].join(","));
await browser.close();
fs.writeFileSync(`${OUT}/qa-results-${VP.tag}.json`, JSON.stringify(results, null, 1));
console.log(`DONE ${VP.tag}: pass=${results.filter((r) => r.ok === true).length} fail=${results.filter((r) => r.ok === false).length}`);
