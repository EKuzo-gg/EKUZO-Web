// Sentry browser QA of the beta restart link (/season1/beta/start with the ekuzo_brf flag).
// Fail-closed harness: Chrome maps every host to 127.0.0.1; every request not to the local server is recorded
// and aborted (vendor hosts are answered with an empty script by host regex, still recorded);
// /api/season-one and /api/season1-beta/restore are answered inside the harness by route interception.
// Run: node qa.mjs [mobile|desktop]
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire("/opt/npm-tools/node_modules/");
const { chromium } = require("playwright");

const OUT = "/home/claude/ekuzo-web/docs/beta-restart-link-2026-11/evidence/sentry";
const SHOTS = OUT + "/screenshots";
fs.mkdirSync(SHOTS, { recursive: true });
const WHICH = process.argv[2] || "desktop";
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const VP = WHICH === "mobile"
  ? { tag: "390", touch: true, opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, userAgent: IPHONE } }
  : { tag: "1440", touch: false, opts: { viewport: { width: 1440, height: 900 } } };
const BASE = "http://ekuzo.gg:3100";
const HTTPS_BASE = "https://ekuzo.gg:3101";
const EMAIL = `sentry+${VP.tag}@example.com`;
const MASK = "s•••@example.com";
const KID = { name: "Zephyrine", age: 13, fact: "Knows every flag zq7", note: "NOTE-mx42-private" };
const CANARY = "AAAAAAAAAAAAAAAAAAAAAACANARYCANARYCANARYCANARYCANARYCANARYCANARYA".slice(0, 65); // 65 chars, our fake token
const SID = "sess-restored-" + VP.tag + "-0001";
const LEAK = [KID.name, KID.fact, KID.note, "zq7", "mx42", EMAIL, encodeURIComponent(EMAIL), "sentry+", CANARY];

const results = [];
const chk = (id, what, ok, detail = "") => { results.push({ id: `${VP.tag}.${id}`, what, ok: !!ok, detail: String(detail).slice(0, 600) }); console.log(`${ok ? "PASS" : "FAIL"} ${VP.tag}.${id} ${what}${detail ? " :: " + String(detail).slice(0, 400) : ""}`); };
const info = (id, what, detail) => { results.push({ id: `${VP.tag}.${id}`, what, ok: null, detail: String(detail).slice(0, 800) }); console.log(`INFO ${VP.tag}.${id} ${what} :: ${String(detail).slice(0, 600)}`); };

const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--host-resolver-rules=MAP * 127.0.0.1", "--no-sandbox", "--no-proxy-server", "--ignore-certificate-errors"] });
const allOffenders = new Set(); const allOther = []; const allConsole = []; const allPageErrors = []; const allLocalUrls = []; const allVendorReqs = [];
const VENDOR_RE = /(^|\.)(googletagmanager\.com|google-analytics\.com|facebook\.net|facebook\.com|clarity\.ms|doubleclick\.net)$/;

// restore answers
const R = {
  none: () => ({ status: 200, body: { ok: true, state: "none" } }),
  done: () => ({ status: 200, body: { ok: true, state: "done" } }),
  resume: (stage) => (b) => {
    if (b.clear) return { status: 200, body: { ok: true, state: "none" } };
    if (b.confirm) {
      const answers = {};
      if (stage >= 1) answers.expectations = ["No toxicity", "Positive mindset", "Winning attitude"];
      if (stage >= 2) Object.assign(answers, { playerName: KID.name, playerAge: KID.age, playsOn: ["Console", "Tablet"], teamSports: "Plays, not their thing", superpowers: ["Quick thinker"], funFact: KID.fact });
      return { status: 200, body: { ok: true, state: "resume", email: EMAIL, sessionId: SID, stage, answers } };
    }
    return { status: 200, body: { ok: true, state: "resume", emailMask: MASK, step: stage + 1 } };
  },
};

async function mk(o = {}) {
  const allowed = new Set(["ekuzo.gg"]);
  const ctx = await browser.newContext({ ...VP.opts, timezoneId: o.tz || "America/Chicago", locale: "en-US", ignoreHTTPSErrors: true, ...(o.storageState ? { storageState: o.storageState } : {}) });
  const L = { api: [], restore: [], other: [], urls: [], continued: new Set(), remote: new Set(), errors: [], cons: [], dl: [], vend: [], restoreMode: o.restore || R.none, apiMode: o.api || (() => ({ status: 200, body: { ok: true } })), name: o.name || "", cookieHdrs: [] };
  await ctx.exposeBinding("__rec", (_s, k, v) => { L.dl.push(JSON.parse(v)); });
  await ctx.addInitScript(() => {
    var dl = []; var orig = Array.prototype.push;
    dl.push = function (a) { try { window.__rec("dl", JSON.stringify(Array.from(a))); } catch (e) {} return orig.apply(this, arguments); };
    window.dataLayer = dl;
  });
  if (o.flag !== false && o.flag !== "none") {
    await ctx.addCookies([{ name: "ekuzo_brf", value: "1", domain: "ekuzo.gg", path: "/season1/beta", httpOnly: false, secure: false, sameSite: "Lax" }]);
  }
  if (o.token) await ctx.addCookies([{ name: "ekuzo_brt", value: CANARY, domain: "ekuzo.gg", path: "/api/season1-beta", httpOnly: true, secure: false, sameSite: "Lax" }]);
  await ctx.route("**/*", async (route) => {
    const req = route.request(); const u = new URL(req.url());
    if (VENDOR_RE.test(u.hostname)) {
      const rec = { host: u.hostname, path: u.pathname, url: u.toString(), body: req.postData() || "", scenario: L.name };
      L.other.push(rec); allVendorReqs.push(rec);
      return route.fulfill({ status: 200, contentType: "application/javascript", body: "/* stub */" });
    }
    if (!allowed.has(u.hostname)) {
      const rec = { host: u.hostname, path: u.pathname, method: req.method(), url: u.toString(), body: req.postData() || "", scenario: L.name };
      L.other.push(rec); allOther.push(rec);
      return route.abort();
    }
    L.urls.push(u.toString()); allLocalUrls.push({ url: u.toString(), scenario: L.name });
    if (u.pathname === "/api/season-one" && req.method() === "POST") {
      let body = null; try { body = JSON.parse(req.postData()); } catch (_) { body = { _raw: req.postData() }; }
      try { L.cookieHdrs.push({ path: u.pathname, cookie: (await req.allHeaders()).cookie || "" }); } catch (_) {}
      L.api.push(body);
      const r = await L.apiMode(body, L.api.length);
      if (r === "abort") return route.abort("connectionreset");
      return route.fulfill({ status: r.status, contentType: "application/json", body: JSON.stringify(r.body) });
    }
    if (u.pathname === "/api/season1-beta/restore") {
      let body = null; try { body = JSON.parse(req.postData()); } catch (_) { body = { _raw: req.postData() }; }
      let hdr = {}; try { hdr = await req.allHeaders(); } catch (_) {}
      L.restore.push({ method: req.method(), body, cookie: hdr.cookie || "", t: Date.now() });
      const r = await L.restoreMode(body, L.restore.length);
      if (r === "abort") return route.abort("connectionreset");
      if (r.delay) await new Promise((res) => setTimeout(res, r.delay));
      return route.fulfill({ status: r.status, contentType: "application/json", body: JSON.stringify(r.body) });
    }
    if (u.pathname.startsWith("/api/")) { L.other.push({ host: u.hostname, path: u.pathname, method: req.method(), url: u.toString(), body: "" }); return route.abort(); }
    try { const h = await req.allHeaders(); L.cookieHdrs.push({ path: u.pathname, cookie: h.cookie || "" }); } catch (_) {}
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
  for (const h of L.continued) if (!["ekuzo.gg"].includes(h)) allOffenders.add(h);
  for (const ip of L.remote) if (ip && !["127.0.0.1", "::1"].includes(ip)) allOffenders.add("ip:" + ip);
  await L.ctx.close();
}
const evs = (L, n) => L.dl.filter((x) => x[0] === "event" && x[1] === n);
const evNames = (L) => L.dl.filter((x) => x[0] === "event").map((x) => x[1]);
const tap = (loc) => (VP.touch ? loc.tap() : loc.click());
const cont = (page) => page.locator("#wiz [data-step]:not([hidden]) [data-next]");
const idx = (page) => page.evaluate(() => [...document.querySelectorAll("#wiz [data-step]")].findIndex((s) => !s.hidden));
const wait = (page, ms = 1100) => page.waitForTimeout(ms);
async function open(L, path = "/season1/beta/start", base = BASE) { const p = await L.ctx.newPage(); await p.goto(base + path, { waitUntil: "domcontentloaded" }); await p.waitForTimeout(1200); return p; }
async function shot(page, state) { await page.screenshot({ path: `${SHOTS}/${state}-${VP.tag}.png`, fullPage: true }); }
const form = (p) => p.evaluate(() => {
  const f = document.getElementById("wiz"); const c = (n) => [...f.querySelectorAll(`[name="${n}"]:checked`)].map((x) => x.value);
  return { email: f.email.value, pname: f.pname.value, age: f.age.value, plays: c("plays"), sports: c("sports"), power: c("power"), fact: f.fact.value, vow: c("vow"), tz: f.tz.value, times: c("times"), note: f.note.value };
});
const ls = (p) => p.evaluate(() => { try { return localStorage.getItem("ekz_beta_wiz"); } catch (e) { return "THROWS"; } });
const panel = (p) => p.evaluate(() => { const s = document.querySelector('#wiz [data-step="start"] [role="status"]'); return s ? { text: s.innerText, buttons: [...s.querySelectorAll("button")].map((b) => ({ t: b.textContent, c: b.className })), html: s.outerHTML } : null; });
const ga = (L) => L.dl.filter((x) => x[0] === "event").map((x) => ({ n: x[1], p: x[2] || {} }));
const activeId = (p) => p.evaluate(() => { const a = document.activeElement; return a ? { tag: a.tagName, id: a.id, name: a.name || "" } : null; });
async function doEmail(p, email = EMAIL) { await p.fill("#email", email); await tap(cont(p)); await wait(p, 600); }
async function doVows(p) { for (const v of ["No toxicity", "Positive mindset", "Winning attitude"]) if (!(await p.locator(`input[name=vow][value="${v}"]`).isChecked())) await tap(p.locator(`label:has(input[name=vow][value="${v}"])`)); }
async function doPlayer(p) {
  await p.fill("#pname", KID.name); await p.selectOption("select[name=age]", String(KID.age));
  for (const v of ["Console", "Tablet"]) await tap(p.locator(`label:has(input[name=plays][value="${v}"])`));
  await tap(p.locator(`label:has(input[name=sports][value="Plays, not their thing"])`));
  await tap(p.locator(`label:has(input[name=power][value="Quick thinker"])`));
  await p.fill("#fact", KID.fact);
}
async function doAvail(p) { for (const v of ["Weekday evenings", "Weekend afternoons"]) await tap(p.locator(`label:has(input[name=times][value="${v}"])`)); await p.fill("#note", KID.note); }
async function scenario(name, fn) { try { console.log("--- " + name); await fn(); } catch (e) { chk(`${name}.harness`, `${name} ran without a harness error`, false, e.stack || e); } }
const pageBodyHasKid = (p) => p.evaluate((toks) => { const h = document.documentElement.outerHTML + " " + [...document.querySelectorAll("input,textarea,select")].map((e) => e.value).join(" "); return toks.filter((t) => h.includes(t)); }, [KID.name, KID.fact, KID.note, "zq7", "mx42"]);

// ===== 0. plain first screen, no link ================================================================
await scenario("plain", async () => {
  const L = await mk({ name: "plain", flag: false });
  const p = await open(L);
  await shot(p, "first-screen-plain");
  chk("1.noflag.calls", "1. no flag cookie: zero calls to the restore endpoint (M8)", L.restore.length === 0, `restore calls=${L.restore.length}`);
  chk("1.noflag.panel", "1. no flag: no panel, no status region", (await panel(p)) === null);
  chk("1.noflag.posts", "1. no flag: no progress post, no GA beta_wizard_* event on load", L.api.length === 0 && !evNames(L).some((n) => /^beta_wizard/.test(n)), JSON.stringify(ga(L)));
  await p.reload(); await wait(p, 600);
  chk("1.noflag.reload", "1. no flag, after reload: still zero restore calls", L.restore.length === 0);
  await done(L);
});

// ===== 2. resume, stages 0, 1, 2 =====================================================================
for (const stage of [0, 1, 2]) {
  await scenario("resume" + stage, async () => {
    const L = await mk({ name: "resume" + stage, restore: R.resume(stage), token: true });
    const p = await open(L);
    const pn = await panel(p);
    if (stage === 0) await shot(p, "panel");
    chk(`2.s${stage}.panel`, `2. stage ${stage}: panel shows masked email and the two buttons`, pn && pn.text.includes(MASK) && pn.text.includes("Welcome back.") && JSON.stringify(pn.buttons.map((b) => b.t)) === JSON.stringify(["Start fresh", "Pick up where I left off"]), JSON.stringify(pn && { text: pn.text, b: pn.buttons }));
    chk(`2.s${stage}.role`, `2. stage ${stage}: panel container has role=status`, pn && /^<div role="status"/.test(pn.html), pn && pn.html.slice(0, 80));
    chk(`2.s${stage}.nokid`, `2. stage ${stage}: nothing about the player in the DOM or fields before the tap`, (await pageBodyHasKid(p)).length === 0, JSON.stringify(await pageBodyHasKid(p)));
    chk(`2.s${stage}.pre`, `2. stage ${stage}: before tap exactly one call ({}), no progress post, no GA event`, L.restore.length === 1 && JSON.stringify(L.restore[0].body) === "{}" && L.api.length === 0 && ga(L).filter((e) => /^beta_wizard/.test(e.n)).length === 0, JSON.stringify({ r: L.restore.map((r) => r.body), api: L.api.length, ga: ga(L) }));
    chk(`2.s${stage}.cookieSent`, `2. stage ${stage}: the HttpOnly token cookie is sent to the restore endpoint`, L.restore[0].cookie.includes("ekuzo_brt="), L.restore[0].cookie.replace(CANARY, "<canary>"));
    chk(`2.s${stage}.docCookie`, `2. stage ${stage}: document.cookie does not expose the token`, !(await p.evaluate(() => document.cookie)).includes("ekuzo_brt"));
    // keyboard: Tab order and focus
    await p.evaluate(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0); });
    const order = []; for (let i = 0; i < 6; i++) { await p.keyboard.press("Tab"); order.push(await p.evaluate(() => { const a = document.activeElement; return a ? (a.id || a.textContent.trim().slice(0, 30) || a.tagName) : ""; })); }
    if (stage === 0) info("13.tab", "13. Tab order from page top (first 6 stops)", JSON.stringify(order));
    if (stage === 0) chk("13.tabOrder", "13. Tab reaches 'Start fresh' then 'Pick up' before the email field", (() => { const a = order.indexOf("Start fresh"), b = order.indexOf("Pick up where I left off"), c = order.indexOf("email"); return a >= 0 && b > a && c > b; })(), JSON.stringify(order));
    // tap Pick up
    const before = Date.now();
    await tap(p.locator('#wiz [role="status"] button', { hasText: "Pick up where I left off" })); await wait(p, 1500);
    chk(`2.s${stage}.confirm`, `2. stage ${stage}: tap sends exactly one confirm call`, L.restore.length === 2 && JSON.stringify(L.restore[1].body) === '{"confirm":true}', JSON.stringify(L.restore.map((r) => r.body)));
    const i = await idx(p); const f = await form(p);
    chk(`2.s${stage}.step`, `2. stage ${stage}: lands on screen ${stage + 1}`, i === stage + 1, `idx=${i}`);
    const filledOk = stage === 0 ? f.email === EMAIL : stage === 1 ? f.email === EMAIL && f.vow.length === 3 : f.email === EMAIL && f.vow.length === 3 && f.pname === KID.name && f.age === String(KID.age) && f.fact === KID.fact && f.plays.length === 2 && f.sports[0] === "Plays, not their thing" && f.power[0] === "Quick thinker";
    chk(`2.s${stage}.fields`, `2. stage ${stage}: fields filled`, filledOk, JSON.stringify(f));
    chk(`2.s${stage}.noPost`, `2. stage ${stage}: NO progress post and NO beta_wizard_step on the restore (M2)`, L.api.length === 0 && evs(L, "beta_wizard_step").length === 0, JSON.stringify({ api: L.api.length, ga: ga(L) }));
    const rs = evs(L, "beta_wizard_resume");
    const expectStep = ["email", "expectations", "player_card"][stage];
    chk(`2.s${stage}.resumeEv`, `2. stage ${stage}: beta_wizard_resume {step:${expectStep}, via:link} exactly once, nothing else`, rs.length === 1 && JSON.stringify(rs[0][2]) === JSON.stringify({ step: expectStep, via: "link" }), JSON.stringify(ga(L)));
    chk(`2.s${stage}.focus`, `2. stage ${stage}: focus lands on a field after the tap`, await p.evaluate(() => /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName)), JSON.stringify(await activeId(p)));
    chk(`2.s${stage}.panelGone`, `2. stage ${stage}: panel removed`, (await panel(p)) === null);
    const lsv = JSON.parse((await ls(p)) || "null");
    chk(`2.s${stage}.sid`, `2. stage ${stage}: saved run holds the session the restore returned`, lsv && lsv.sid === SID && lsv.stage === stage && lsv.tzSet === false, JSON.stringify(lsv && { sid: lsv.sid, stage: lsv.stage, tzSet: lsv.tzSet, g: lsv.g }));
    if (stage === 2) await shot(p, "after-resume");
    if (stage === 1) await shot(p, "after-resume-stage1");
    if (stage === 0) {
      // move forward: tick vows, continue -> stage 1 post with the restored sid
      await doVows(p); await tap(cont(p)); await wait(p, 900);
      const posts = L.api.filter((b) => b.step === "beta-progress");
      chk("2.s0.next", "2. stage 0: next step posts stage 1 with the restored session id, once", posts.length === 1 && posts[0].stage === 1 && posts[0].sessionId === SID, JSON.stringify(posts.map((b) => [b.stage, b.sessionId])));
      chk("2.s0.stepEv", "2. stage 0: beta_wizard_step fires only for the newly completed step (expectations; email was already counted)", evs(L, "beta_wizard_step").map((e) => e[2].step).join() === "expectations", JSON.stringify(ga(L)));
    }
    if (stage === 1) {
      await doPlayer(p); await tap(cont(p)); await wait(p, 900);
      const posts = L.api.filter((b) => b.step === "beta-progress");
      chk("2.s1.next", "2. stage 1: next step posts stage 2 with the restored session id, once", posts.length === 1 && posts[0].stage === 2 && posts[0].sessionId === SID && posts[0].answers.playerName === KID.name, JSON.stringify(posts.map((b) => [b.stage, b.sessionId])));
      await doAvail(p); await tap(p.locator("#send")); await wait(p, 1200);
      const fin = L.api.filter((b) => b.step === "beta-wizard");
      chk("2.s1.final", "2. stage 1: final beta-wizard post sent once; end screen shown", fin.length === 1 && (await idx(p)) === 4, `finals=${fin.length} idx=${await idx(p)}`);
      chk("2.s1.complete", "2. stage 1: beta_wizard_complete fires once", evs(L, "beta_wizard_complete").length === 1, JSON.stringify(ga(L).map((e) => e.n)));
      chk("2.s1.lsCleared", "2. stage 1: saved run removed after the send", (await ls(p)) === null);
      fs.writeFileSync(`${OUT}/bodies-resume1-${VP.tag}.json`, JSON.stringify({ api: L.api, restore: L.restore.map((r) => r.body) }, null, 2));
    }
    chk(`11.s${stage}.errors`, `11. stage ${stage}: no page errors, no console errors from our pages`, L.errors.length === 0 && L.cons.filter((c) => c.type === "error" && /ekuzo\.gg/.test(c.url) && !/Failed to load resource/.test(c.text)).length === 0, L.errors.join("|") + JSON.stringify(L.cons.filter((c) => /ekuzo\.gg/.test(c.url))));
    await done(L);
  });
}

// ===== 3. Start fresh ================================================================================
await scenario("fresh", async () => {
  const L = await mk({ name: "fresh", restore: R.resume(1), token: true });
  const p = await open(L);
  await tap(p.locator('#wiz [role="status"] button', { hasText: "Start fresh" })); await wait(p, 1200);
  chk("3.clear", "3. Start fresh: one clear call sent", L.restore.length === 2 && JSON.stringify(L.restore[1].body) === '{"clear":true}', JSON.stringify(L.restore.map((r) => r.body)));
  chk("3.panelGone", "3. Start fresh: panel gone", (await panel(p)) === null);
  chk("3.first", "3. Start fresh: wizard on its first screen, usable (email field focused)", (await idx(p)) === 0 && (await activeId(p)).id === "email", JSON.stringify(await activeId(p)));
  chk("3.nothingLoaded", "3. Start fresh: nothing loaded, no post, no GA event", L.api.length === 0 && (await ls(p)) === null && !evNames(L).some((n) => /^beta_wizard/.test(n)), JSON.stringify(ga(L)));
  await doEmail(p); await doVows(p); await tap(cont(p)); await wait(p, 800);
  const s1 = L.api.map((b) => b.sessionId);
  chk("3.usable", "3. wizard usable: posts stage 0 and 1 with one fresh session id (not the saved one)", L.api.length === 2 && s1[0] === s1[1] && s1[0] !== SID, JSON.stringify(s1));
  await p.close();
  // later run: new session? complete this one, reload, run again
  await done(L);
});

// ===== 4. typing before a slow answer ================================================================
await scenario("slow", async () => {
  const L = await mk({ name: "slow-type", restore: (b) => ({ ...R.resume(1)(b), delay: 3000 }), token: true });
  const p = await L.ctx.newPage(); await p.goto(BASE + "/season1/beta/start", { waitUntil: "domcontentloaded" }); await p.waitForTimeout(400);
  await p.fill("#email", "typed@example.com"); await wait(p, 4200);
  chk("4.typed.nopanel", "4. typed in email before the slow answer: panel never appears", (await panel(p)) === null);
  chk("4.typed.kept", "4. typed email not overwritten, still on the first screen", (await form(p)).email === "typed@example.com" && (await idx(p)) === 0, JSON.stringify(await form(p)));
  chk("4.typed.noposts", "4. no posts, no GA resume", L.api.length === 0 && evs(L, "beta_wizard_resume").length === 0);
  await done(L);
  const L2 = await mk({ name: "slow-leave", restore: (b) => ({ ...R.resume(1)(b), delay: 3000 }), token: true });
  const p2 = await L2.ctx.newPage(); await p2.goto(BASE + "/season1/beta/start", { waitUntil: "domcontentloaded" }); await p2.waitForTimeout(400);
  await p2.fill("#email", "other@example.com"); await tap(cont(p2)); await wait(p2, 4200);
  chk("4.left.nopanel", "4. left the first screen before the answer: panel never appears, wizard not moved back", (await panel(p2)) === null && (await idx(p2)) === 1, `idx=${await idx(p2)}`);
  chk("4.left.email", "4. email still the typed one", (await form(p2)).email === "other@example.com");
  // slow done answer after typing
  await done(L2);
  const L3 = await mk({ name: "slow-done", restore: () => ({ ...R.done(), delay: 3000 }), token: true });
  const p3 = await L3.ctx.newPage(); await p3.goto(BASE + "/season1/beta/start", { waitUntil: "domcontentloaded" }); await p3.waitForTimeout(400);
  await p3.fill("#email", "typed3@example.com"); await wait(p3, 4200);
  chk("4.done.ignored", "4. slow 'done' answer after typing does nothing", (await idx(p3)) === 0 && (await form(p3)).email === "typed3@example.com" && evs(L3, "beta_wizard_resume").length === 0, `idx=${await idx(p3)}`);
  await done(L3);
  const L4 = await mk({ name: "slow-none", restore: () => ({ ...R.none(), delay: 3000 }), token: true });
  const p4 = await L4.ctx.newPage(); await p4.goto(BASE + "/season1/beta/start", { waitUntil: "domcontentloaded" }); await p4.waitForTimeout(400);
  await p4.fill("#email", "typed4@example.com"); await wait(p4, 4200);
  chk("4.none.ignored", "4. slow 'none' answer after typing: no dead-link line over the typing", (await panel(p4)) === null);
  await done(L4);
  // Late confirm answer: parent taps pick up, answer is slow, parent types meanwhile
  const L5 = await mk({ name: "slow-confirm", restore: (b) => (b.confirm ? { ...R.resume(1)(b), delay: 3000 } : R.resume(1)(b)), token: true });
  const p5 = await open(L5);
  await tap(p5.locator('#wiz [role="status"] button', { hasText: "Pick up where I left off" }));
  await p5.waitForTimeout(300);
  await p5.fill("#email", "typed5@example.com").catch(() => {});
  await wait(p5, 4000);
  info("4.confirmTyped", "4. (extra) typed into email while a slow confirm is in flight, then the answer lands", JSON.stringify({ idx: await idx(p5), email: (await form(p5)).email }));
  await done(L5);
});

// ===== 5. done =======================================================================================
await scenario("done", async () => {
  const L = await mk({ name: "done", restore: R.done, token: true });
  const p = await open(L);
  const txt = await p.locator("#wiz").innerText();
  chk("5.endScreen", "5. done: the end screen shows (last section only)", (await idx(p)) === 4 && /Got it\./i.test(txt), `idx=${await idx(p)}`);
  chk("5.nokid", "5. done: no player name or card content anywhere", (await pageBodyHasKid(p)).length === 0 && (await p.locator("#pc2").innerText()).trim() === "" && !/Thanks for/i.test(txt), JSON.stringify({ pc2: await p.locator("#pc2").innerText(), kid: await pageBodyHasKid(p) }));
  chk("5.noComplete", "5. done: no beta_wizard_complete", evs(L, "beta_wizard_complete").length === 0);
  chk("5.noPosts", "5. done: no posts at all", L.api.length === 0);
  const rs = evs(L, "beta_wizard_resume");
  chk("5.ev", "5. done: beta_wizard_resume {step:done, via:link} once", rs.length === 1 && JSON.stringify(rs[0][2]) === '{"step":"done","via":"link"}', JSON.stringify(ga(L)));
  const dots = await p.evaluate(() => [...document.querySelectorAll("#dots li")].map((d) => d.className + (d.hasAttribute("aria-current") ? "!cur" : "")));
  chk("5.dots", "5. done: progress dots in final state (all 'was', none current)", dots.every((c) => /was/.test(c) && !/on|cur/.test(c)), JSON.stringify(dots));
  chk("5.nostored", "5. done: nothing stored in the browser", (await ls(p)) === null);
  chk("5.restoreCalls", "5. done: exactly one restore call ({}), none with confirm", L.restore.length === 1 && JSON.stringify(L.restore[0].body) === "{}");
  await shot(p, "done");
  // reaction pad still works? just check the control exists and is visible
  info("5.pad", "5. reaction pad visible on the done screen", String(await p.locator("#pad").isVisible()));
  await done(L);
});

// ===== 6. none =======================================================================================
await scenario("none", async () => {
  const L = await mk({ name: "none", restore: R.none, token: true });
  const p = await open(L);
  const pn = await panel(p);
  chk("6.line", "6. none: dead-link line on the first screen", pn && /That link has run out\. Start below and your answers will save as you go\./.test(pn.text), JSON.stringify(pn && pn.text));
  chk("6.role", "6. none: line sits in a role=status container", pn && /^<div role="status"/.test(pn.html));
  chk("6.usable", "6. none: wizard usable from the first screen", (await idx(p)) === 0);
  await shot(p, "none");
  await doEmail(p); chk("6.advance", "6. none: can continue to screen 2 and a progress post goes", (await idx(p)) === 1 && L.api.length === 1);
  chk("6.noEv", "6. none: no beta_wizard_resume event", evs(L, "beta_wizard_resume").length === 0);
  await done(L);
});

// ===== 7. 503 handling ===============================================================================
await scenario("retry", async () => {
  const L = await mk({ name: "503-then-200", restore: (b, n) => (n === 1 ? { status: 503, body: { ok: false } } : R.resume(1)(b)), token: true });
  const t0 = Date.now(); const p = await open(L); await wait(p, 1500);
  const pn = await panel(p);
  chk("7.retry", "7. 503 then 200: exactly one retry, panel appears", L.restore.length === 2 && pn && pn.text.includes(MASK), JSON.stringify({ calls: L.restore.map((r) => r.body), gapMs: L.restore[1] && L.restore[1].t - L.restore[0].t }));
  info("7.gap", "7. gap between the two calls (ms)", L.restore[1] && L.restore[1].t - L.restore[0].t);
  await done(L);
  const L2 = await mk({ name: "503-503", restore: () => ({ status: 503, body: { ok: false } }), token: true });
  const p2 = await open(L2); await wait(p2, 2500);
  const body = await p2.locator("body").innerText();
  chk("7.twice.calls", "7. 503 twice: two calls only", L2.restore.length === 2, `calls=${L2.restore.length}`);
  chk("7.twice.noerr", "7. 503 twice: no error shown, no panel, wizard usable", (await panel(p2)) === null && !/error|went wrong|try again|couldn|didn.t/i.test(body) && (await idx(p2)) === 0, body.slice(0, 200));
  chk("7.twice.flag", "7. 503 twice: flag cookie still present", (await p2.evaluate(() => document.cookie)).includes("ekuzo_brf=1"), await p2.evaluate(() => document.cookie));
  await p2.reload(); await wait(p2, 1500);
  chk("7.reload.again", "7. reload after the double 503: asks again (flag kept)", L2.restore.length >= 3, `calls=${L2.restore.length}`);
  await done(L2);
  const L3 = await mk({ name: "network-fail", restore: (b, n) => (n === 1 ? "abort" : R.resume(1)(b)), token: true });
  const p3 = await open(L3); await wait(p3, 1500);
  chk("7.net", "7. dropped connection then 200: retried once, panel appears", L3.restore.length === 2 && !!(await panel(p3)));
  await done(L3);
  const L4 = await mk({ name: "429", restore: () => ({ status: 429, body: { ok: false } }), token: true });
  const p4 = await open(L4); await wait(p4, 2000);
  chk("7.429", "7. 429: one call, no retry, no error shown, flag kept", L4.restore.length === 1 && (await panel(p4)) === null && (await p4.evaluate(() => document.cookie)).includes("ekuzo_brf=1"), `calls=${L4.restore.length}`);
  await done(L4);
});

// ===== 8. local run wins =============================================================================
await scenario("localwins", async () => {
  const L = await mk({ name: "localwins", flag: false });
  let p = await open(L);
  await doEmail(p, "local@example.com"); await doVows(p); await tap(cont(p)); await wait(p, 700);
  await p.close();
  await L.ctx.addCookies([{ name: "ekuzo_brf", value: "1", domain: "ekuzo.gg", path: "/season1/beta", httpOnly: false, secure: false, sameSite: "Lax" }]);
  L.restoreMode = R.resume(2); L.api.length = 0; L.dl.length = 0;
  p = await open(L); await wait(p, 800);
  chk("8.clear", "8. saved local run plus flag: exactly one restore call, {clear:true}", L.restore.length === 1 && JSON.stringify(L.restore[0].body) === '{"clear":true}', JSON.stringify(L.restore.map((r) => r.body)));
  chk("8.nopanel", "8. no panel", (await panel(p)) === null);
  const f = await form(p);
  chk("8.local", "8. the local run won: local email, on the player card, nothing from the link", f.email === "local@example.com" && (await idx(p)) === 2 && f.pname === "", JSON.stringify({ idx: await idx(p), f }));
  const rs = evs(L, "beta_wizard_resume");
  chk("8.via", "8. resume event is via:device", rs.length === 1 && rs[0][2].via === "device", JSON.stringify(ga(L)));
  await done(L);
});

// ===== 9. same-device resume =========================================================================
await scenario("device", async () => {
  const L = await mk({ name: "device", flag: false });
  let p = await open(L);
  await doEmail(p); await doVows(p); await tap(cont(p)); await wait(p, 600);
  await doPlayer(p); await tap(cont(p)); await wait(p, 700);
  await p.close(); L.api.length = 0; L.dl.length = 0;
  p = await open(L);
  const f = await form(p);
  chk("9.restored", "9. same device, no flag: reopens on availability with answers", (await idx(p)) === 3 && f.pname === KID.name && f.email === EMAIL && f.vow.length === 3, JSON.stringify({ idx: await idx(p), f }));
  const rs = evs(L, "beta_wizard_resume");
  chk("9.via", "9. resume event is {step:player_card, via:device} once", rs.length === 1 && JSON.stringify(rs[0][2]) === '{"step":"player_card","via":"device"}', JSON.stringify(ga(L)));
  chk("9.norestore", "9. zero restore calls without the flag", L.restore.length === 0);
  info("9.posts", "9. posts after a device restore (existing behaviour: one repost of the last done stage)", JSON.stringify(L.api.map((b) => [b.step, b.stage, b.sessionId])));
  await done(L);
});

// ===== 10. time zone =================================================================================
const ZONES = { "America/Toronto": "Eastern", "America/Vancouver": "Pacific", "America/Edmonton": "Mountain", "America/Winnipeg": "Central", "America/Regina": "Central", "America/Halifax": "Other", "America/St_Johns": "Other", "America/Boise": "Mountain", "America/Indiana/Tell_City": "Central", "America/Mexico_City": "Other", "America/Puerto_Rico": "Other", "America/New_York": "Eastern", "Europe/London": "Other" };
await scenario("zones", async () => {
  const seen = {};
  for (const [z, want] of Object.entries(ZONES)) {
    const L = await mk({ name: "tz-" + z, tz: z, flag: false });
    const p = await open(L);
    const got = await p.evaluate(() => ({ v: document.getElementById("tz").value, zone: Intl.DateTimeFormat().resolvedOptions().timeZone }));
    seen[z] = got.v;
    chk(`10.zone.${z}`, `10. ${z}: select reads ${want}`, got.v === want, JSON.stringify(got));
    await done(L);
  }
  // hand pick persistence (the select lives on the availability screen)
  const L = await mk({ name: "tz-hand", tz: "America/Toronto", flag: false });
  let p = await open(L);
  await doEmail(p); await doVows(p); await tap(cont(p)); await wait(p, 500);
  await doPlayer(p); await tap(cont(p)); await wait(p, 700);
  chk("10.hand.guess", "10. Toronto guess on the availability screen reads Eastern", (await form(p)).tz === "Eastern");
  await p.selectOption("#tz", "Pacific"); await wait(p, 300);
  await tap(p.locator("#wiz [data-step]:not([hidden]) [data-back]")); await wait(p, 400); await tap(cont(p)); await wait(p, 500);
  chk("10.hand.nav", "10. hand-picked Pacific survives Back and forward", (await form(p)).tz === "Pacific");
  await p.reload(); await wait(p, 900);
  chk("10.hand.reload", "10. same-device restore after reload: hand-picked Pacific back in the select (guess was Eastern)", (await form(p)).tz === "Pacific" && (await idx(p)) === 3, JSON.stringify(await form(p)));
  await doAvail(p); await tap(p.locator("#send")); await wait(p, 1000);
  const fin = L.api.filter((b) => b.step === "beta-wizard")[0];
  chk("10.hand.final", "10. final post sends timeZone Pacific and tz America/Toronto", fin && fin.timeZone === "Pacific" && fin.tz === "America/Toronto", JSON.stringify(fin && { tz: fin.timeZone, z: fin.tz }));
  await done(L);
  // unguessed: Toronto run saved without a hand pick, reopened in Vancouver
  const La = await mk({ name: "tz-guess-a", tz: "America/Toronto", flag: false });
  const pa = await open(La); await doEmail(pa); await doVows(pa); await tap(cont(pa)); await wait(pa, 600);
  const lsA = JSON.parse(await ls(pa)); const state = await La.ctx.storageState();
  chk("10.guess.saved", "10. a guess that was never hand-picked is saved with tzSet unset", !lsA.tzSet && lsA.a.timeZone === "Eastern", JSON.stringify({ tzSet: lsA.tzSet, tz: lsA.a.timeZone }));
  await done(La);
  const Lb = await mk({ name: "tz-guess-b", tz: "America/Vancouver", flag: false, storageState: state });
  const pb = await open(Lb);
  chk("10.guess.new", "10. reopened in Vancouver: the saved Eastern guess is NOT restored over the new Pacific guess", (await form(pb)).tz === "Pacific" && (await idx(pb)) === 2, JSON.stringify({ tz: (await form(pb)).tz, idx: await idx(pb) }));
  await doPlayer(pb); await tap(cont(pb)); await wait(pb, 700);
  await pb.selectOption("#tz", "Alaska"); await wait(pb, 400); const state2 = await Lb.ctx.storageState(); await done(Lb);
  const Lc = await mk({ name: "tz-guess-c", tz: "America/New_York", flag: false, storageState: state2 });
  const pc = await open(Lc);
  chk("10.hand.crossZone", "10. hand-picked Alaska restored on a New York browser", (await form(pc)).tz === "Alaska", JSON.stringify(await form(pc)));
  await done(Lc);
  // link restore never sets zone: tzSet false and select keeps the guess
  const Ld = await mk({ name: "tz-link", tz: "America/Denver", restore: R.resume(2), token: true });
  const pd = await open(Ld); await tap(pd.locator('#wiz [role="status"] button', { hasText: "Pick up where I left off" })); await wait(pd, 1200);
  chk("10.link.nozone", "10. link restore keeps the browser guess (Mountain) and does not set tzSet", (await form(pd)).tz === "Mountain" && JSON.parse(await ls(pd)).tzSet === false, JSON.stringify({ tz: (await form(pd)).tz }));
  await done(Ld);
});

// ===== 12/13. screenshots + keyboard extras ==========================================================
await scenario("a11y", async () => {
  const L = await mk({ name: "a11y", restore: R.resume(1), token: true });
  const p = await open(L);
  const info1 = await p.evaluate(() => { const s = document.querySelector('#wiz [role="status"]'); const bs = [...s.querySelectorAll("button")]; return { statusCount: document.querySelectorAll('[role="status"]').length, buttonTypes: bs.map((b) => b.type), accessible: bs.map((b) => b.textContent), live: s.getAttribute("aria-live"), inFirstSection: !!s.closest('[data-step="start"]'), firstChildOfSection: s.parentElement.firstElementChild === s }; });
  info("13.dom", "13. panel structure", JSON.stringify(info1));
  chk("13.status", "13. exactly one role=status region, inside the first screen, above its content, buttons type=button", info1.statusCount === 1 && info1.inFirstSection && info1.firstChildOfSection && info1.buttonTypes.every((t) => t === "button"), JSON.stringify(info1));
  const cs = await p.evaluate(() => { const b = document.querySelector('#wiz [role="status"] button.btn:not(.back)'); const r = b.getBoundingClientRect(); const c = getComputedStyle(b); return { w: Math.round(r.width), h: Math.round(r.height), font: c.fontSize }; });
  info("13.target", "13. 'Pick up' button size (px)", JSON.stringify(cs));
  chk("13.targetSize", "13. both panel buttons at least 44px tall (touch target)", await p.evaluate(() => [...document.querySelectorAll('#wiz [role="status"] button')].every((b) => b.getBoundingClientRect().height >= 44)), JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#wiz [role="status"] button')].map((b) => Math.round(b.getBoundingClientRect().height)))));
  // Enter on Pick up via keyboard
  await p.evaluate(() => document.querySelector('#wiz [role="status"] button.btn:not(.back)').focus());
  await p.keyboard.press("Enter"); await wait(p, 1300);
  chk("13.kbd", "13. keyboard Enter on 'Pick up' works and focus lands on a field", L.restore.length === 2 && (await idx(p)) === 2 && /^(INPUT|SELECT|TEXTAREA)$/.test((await activeId(p)).tag), JSON.stringify({ calls: L.restore.length, idx: await idx(p), a: await activeId(p) }));
  await done(L);
  const L2 = await mk({ name: "a11y2", restore: R.resume(1), token: true });
  const p2 = await open(L2);
  await p2.evaluate(() => document.querySelector('#wiz [role="status"] button.back').focus());
  await p2.keyboard.press("Space"); await wait(p2, 900);
  chk("13.kbdFresh", "13. keyboard Space on 'Start fresh' works; focus on email", L2.restore.length === 2 && JSON.stringify(L2.restore[1].body) === '{"clear":true}' && (await activeId(p2)).id === "email", JSON.stringify(await activeId(p2)));
  await done(L2);
});

// ===== 11. cookie/URL/vendor leakage check across what was recorded ==================================
await scenario("leak", async () => {
  const badUrl = allLocalUrls.filter((u) => LEAK.some((t) => u.url.includes(t)));
  chk("11.urls", "11. no request to the local server carries the kid's name, fun fact, note, the email or the token in its URL", badUrl.length === 0, JSON.stringify(badUrl.slice(0, 3)));
  const vend = allVendorReqs.concat(allOther);
  const badVend = vend.filter((v) => LEAK.some((t) => (v.url + v.body).includes(t)));
  chk("11.vendor", "11. no vendor/other request (GA4, Pixel, Clarity hosts) carries them or the token", badVend.length === 0, JSON.stringify(badVend.slice(0, 3)));
  info("11.vendorCount", "11. vendor/other requests recorded and answered by stub or aborted", JSON.stringify({ vendor: allVendorReqs.length, other: allOther.length, hosts: [...new Set(vend.map((v) => v.host))] }));
});

await scenario("dlLeak", async () => {
  // all GA events across every scenario already checked per case; here re-scan the GA params of a full resume run for leaks
  const L = await mk({ name: "dlLeak", restore: R.resume(2), token: true });
  const p = await open(L); await tap(p.locator('#wiz [role="status"] button', { hasText: "Pick up where I left off" })); await wait(p, 1300);
  await doAvail(p); await tap(p.locator("#send")); await wait(p, 1100);
  const dl = JSON.stringify(L.dl);
  chk("11.dl", "11. nothing in the dataLayer (GA4 events and config) carries name, fun fact, note, email or token", !LEAK.some((t) => dl.includes(t)), dl.slice(0, 500));
  chk("11.dlShapes", "11. GA events are only beta_wizard_resume, beta_wizard_step, beta_wizard_complete with step/via params", ga(L).every((e) => ["beta_wizard_resume", "beta_wizard_step", "beta_wizard_complete"].includes(e.n) && Object.keys(e.p).every((k) => ["step", "via"].includes(k))), JSON.stringify(ga(L)));
  const hdrs = L.cookieHdrs.filter((h) => h.cookie.includes("ekuzo_brt"));
  chk("11.cookieScope", "11. the token cookie is sent to no request other than the restore endpoint (checked on page, script and /api/season-one requests)", hdrs.length === 0, JSON.stringify(hdrs.map((h) => h.path)));
  await done(L);
});

// ===== 14. end to end over TLS: real 302, real Secure cookies, flag deleted after a 200 ==============
await scenario("tls", async () => {
  const L = await mk({ name: "tls", restore: R.resume(1), flag: false });
  const p = await L.ctx.newPage();
  const T = "A".repeat(22) + "B".repeat(42) + "A";
  const nav = [];
  let setCk = [];
  p.on("response", async (r) => { const u = new URL(r.url()); if (u.pathname.startsWith("/season1/beta")) { nav.push({ url: u.pathname.slice(0, 24), status: r.status() }); if (r.status() === 302) { try { setCk = (await r.headersArray()).filter((h) => h.name.toLowerCase() === "set-cookie").map((h) => h.value); } catch (_) {} } } });
  await p.goto(`${HTTPS_BASE}/season1/beta/r/${T}`, { waitUntil: "domcontentloaded" }); await p.waitForTimeout(2000);
  const finalUrl = new URL(p.url());
  chk("14.redirect", "14. real 302 lands on /season1/beta/start with no token and no query", finalUrl.pathname === "/season1/beta/start" && finalUrl.search === "" && !p.url().includes(T), JSON.stringify({ url: p.url(), nav }));
  const all = await L.ctx.cookies();
  info("14.cookies", "14. Set-Cookie headers of the 302 and cookies Chrome still holds", JSON.stringify({ setCk: setCk.map((c) => c.replace(T, "<tok>")), held: all.filter((c) => /ekuzo_br/.test(c.name)).map((c) => c.name) }));
  const sb = setCk.find((c) => c.startsWith("ekuzo_brt=")) || "", sf = setCk.find((c) => c.startsWith("ekuzo_brf=")) || "";
  chk("14.cookieAttrs", "14. 302 sets the token cookie (HttpOnly, Secure, Lax, Path=/api/season1-beta, Max-Age=1800) and the flag (Secure, Lax, Path=/season1/beta, Max-Age=1800, not HttpOnly)", /Path=\/api\/season1-beta/.test(sb) && /HttpOnly/.test(sb) && /Secure/.test(sb) && /SameSite=Lax/.test(sb) && /Max-Age=1800/.test(sb) && /Path=\/season1\/beta;/.test(sf) && !/HttpOnly/.test(sf) && /Secure/.test(sf) && /Max-Age=1800/.test(sf), JSON.stringify(setCk.map((c) => c.replace(T, "<tok>"))));
  chk("14.askedOnce", "14. the page read the flag at the real path and asked the restore endpoint ({}) with the token cookie", L.restore.length >= 1 && JSON.stringify(L.restore[0].body) === "{}" && L.restore[0].cookie.includes("ekuzo_brt=" + T), JSON.stringify(L.restore.map((r) => [r.body, r.cookie.replace(T, "<tok>")])));
  chk("14.flagDeleted", "14. flag cookie deleted by the script after the 200 (real Secure delete)", !(await L.ctx.cookies()).some((c) => c.name === "ekuzo_brf"), JSON.stringify((await L.ctx.cookies()).map((c) => c.name)));
  chk("14.panel", "14. panel shown", !!(await panel(p)));
  await p.reload(); await wait(p, 1200);
  chk("14.reload", "14. reload after the flag was deleted: no second restore call (token cookie alone does nothing)", L.restore.length === 1, `calls=${L.restore.length}`);
  info("14.nav", "14. server responses seen", JSON.stringify(nav));
  await done(L);
});

// ===== summary ======================================================================================
const fails = results.filter((r) => r.ok === false);
console.log(`\nSUMMARY ${VP.tag}: pass=${results.filter((r) => r.ok === true).length} fail=${fails.length} info=${results.filter((r) => r.ok === null).length}`);
console.log("OFFENDERS (hosts answered from the network, minus localhost):", JSON.stringify([...allOffenders]));
const other = {}; for (const o of allOther) other[o.host] = (other[o.host] || 0) + 1;
console.log("OTHER-HOST REQUESTS aborted:", JSON.stringify(other));
console.log("PAGE ERRORS:", JSON.stringify(allPageErrors));
console.log("CONSOLE (our pages, error/warn):", JSON.stringify(allConsole.filter((c) => /ekuzo\.gg/.test(c.url)).slice(0, 10)));
fs.writeFileSync(`${OUT}/qa-results-${VP.tag}.json`, JSON.stringify({ results, offenders: [...allOffenders], other, pageErrors: allPageErrors, console: allConsole }, null, 2));
fs.writeFileSync(`${OUT}/vendor-${VP.tag}.json`, JSON.stringify(allVendorReqs.map((v) => ({ host: v.host, path: v.path, scenario: v.scenario })), null, 1));
await browser.close();
