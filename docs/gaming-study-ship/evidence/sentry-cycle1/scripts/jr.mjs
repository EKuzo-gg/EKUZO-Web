import { launchGuarded, mk, closeCtx, BASE, POST, S1, storage, events, evCount, fbqTrack, allCalls, dismissS1, cdpTouch, save, center, sleep } from "./sentry-lib.mjs";
const EMAIL = "team+gstest-1012-sentry@ekuzo.gg";
const R = []; const rec = (id, vp, pass, notes, extra) => { R.push({ id, vp, pass, notes, ...(extra ? { extra } : {}) }); console.log(pass ? "PASS" : "FAIL", id, vp, notes.slice(0, 600)); };
const browser = await launchGuarded();
const UTM = "?utm_source=x&utm_medium=social&utm_campaign=gaming-study&utm_content=karlin";
async function signUp(page) { await page.locator(S1 + " input[type=email]").fill(EMAIL); await page.locator(S1 + " button[type=submit]").click(); await page.waitForTimeout(1800); }
const leadSummary = (ctx) => ({ generate_lead: events(ctx).filter(e => e.name === "generate_lead"), fbLead: fbqTrack(ctx).filter(e => e.name === "Lead") });
async function journey(id, vp, url, expect, label) {
  const ctx = await mk(browser, `${id}-${vp}`, { vp }); const page = await ctx.newPage();
  await page.goto(BASE + url, { waitUntil: "load" }); await page.waitForTimeout(1800);
  const early = await page.locator(S1).count();
  await page.waitForSelector(S1, { timeout: 9000 }); await signUp(page);
  const body = ctx.qaCalls.posts.find(p => p.body && p.body.source)?.body; const L = leadSummary(ctx); const st = await storage(page);
  const att = body?.attribution || {};
  const ok = !!body && body.source === "site-popup" && body.attributionFrom === expect.from && body.page === expect.page && !!body.eventId && (expect.ad === undefined || body.ad === expect.ad)
    && Object.entries(expect.utm || {}).every(([k, v]) => att[k] === v)
    && L.generate_lead.length === 1 && L.generate_lead[0].params.source === "season_one_popup"
    && L.fbLead.length === 1 && L.fbLead[0].params.content_name === "season_one_popup" && L.fbLead[0].opts.eventID === body.eventId
    && ctx.qaCalls.posts.filter(p => p.key === "season").length === 1 && early === 0;
  rec(id, vp, ok, `${label}: popup at 1.8s=${early}; source=${body?.source} from=${body?.attributionFrom} page=${body?.page} ad=${body?.ad} eventId=${body?.eventId} utm=${JSON.stringify(att)}; generate_lead=${JSON.stringify(L.generate_lead.map(e => e.params))} fbq Lead=${JSON.stringify(L.fbLead.map(e => [e.params, e.opts]))}; storage joined=${st.ls.ekuzo_s1_joined} ss.attr=${st.ss.ekuzo_attribution || "absent"} nl keys=${Object.keys(st.ls).filter(k => /nl_/.test(k)).length}; POSTs=${ctx.qaCalls.posts.length}`, { body, L, st });
  save(`json/${id.replace(/\W+/g, "_")}-${vp}.json`, { body, leads: L, storage: st, bodies: ctx.qaCalls.posts, calls: allCalls(ctx) });
  await ctx.close(); return body;
}
for (const vp of ["1440", "375"]) {
  const pre = vp === "375" ? "JR-7 (JR-1 on phone)" : "JR-1";
  await journey(pre, vp, POST + UTM, { from: "url", page: POST + UTM, ad: "karlin", utm: { utm_source: "x", utm_medium: "social", utm_campaign: "gaming-study", utm_content: "karlin" } }, "UTM arrival");
  await journey(vp === "375" ? "JR-2 phone" : "JR-2", vp, POST, { from: "none", page: POST, ad: "", utm: {} }, "no UTMs");
}
// JR-8
for (const [src, med] of [["instagram", "social"], ["linkedin", "social"], ["email", "email"]]) {
  const q = `?utm_source=${src}&utm_medium=${med}&utm_campaign=gaming-study&utm_content=ekuzo`;
  await journey(`JR-8 ${src}`, "1440", POST + q, { from: "url", page: POST + q, ad: "ekuzo", utm: { utm_source: src, utm_medium: med, utm_campaign: "gaming-study", utm_content: "ekuzo" } }, `utm_source=${src}`);
}
// JR-4 variants
async function jr4(label, mode) {
  const ctx = await mk(browser, `jr4-${mode}`, { vp: "1440" }); const page = await ctx.newPage();
  await page.goto(BASE + POST + UTM, { waitUntil: "load" }); await page.waitForTimeout(800);
  const ss0 = (await storage(page)).ss.ekuzo_attribution;
  let path = "/";
  if (mode === "client-nav-before-popup") { await page.locator('header a[href="/"], nav a[href="/"]').first().click(); await page.waitForURL(BASE + "/"); await page.waitForSelector(S1, { timeout: 9000 }); }
  else if (mode === "full-goto-before-popup") { await page.goto(BASE + "/", { waitUntil: "load" }); await page.waitForSelector(S1, { timeout: 9000 }); }
  else if (mode === "dismiss-then-nav-button") { await page.waitForSelector(S1, { timeout: 9000 }); await dismissS1(page, "x"); await page.locator('header a[href="/"], nav a[href="/"]').first().click(); await page.waitForURL(BASE + "/"); await page.waitForTimeout(800); await page.getByRole("button", { name: "Join Season 01" }).first().click(); await page.waitForSelector(S1, { timeout: 4000 }); }
  else if (mode === "new-utm-on-home") { await page.waitForSelector(S1, { timeout: 9000 }); await dismissS1(page, "x"); await page.goto(BASE + "/?utm_source=other", { waitUntil: "load" }); path = "/?utm_source=other"; await page.waitForTimeout(800); await page.getByRole("button", { name: "Join Season 01" }).first().click(); await page.waitForSelector(S1, { timeout: 4000 }); }
  await signUp(page);
  const body = ctx.qaCalls.posts[0]?.body; const att = body?.attribution || {};
  const exp = mode === "new-utm-on-home" ? "url" : "session";
  const ok = !!body && body.attributionFrom === exp && body.page === path && (mode === "new-utm-on-home" ? att.utm_source === "other" : (att.utm_source === "x" && att.utm_medium === "social" && att.utm_campaign === "gaming-study" && att.utm_content === "karlin"));
  rec(`JR-4 ${label}`, "1440", ok, `session record on post=${ss0}; body from=${body?.attributionFrom} page=${body?.page} ad=${body?.ad} attribution=${JSON.stringify(att)}`, { body });
  save(`json/JR-4-${mode}.json`, { body, ss0, bodies: ctx.qaCalls.posts });
  await ctx.close();
}
await jr4("client nav to / before popup (auto-open on /)", "client-nav-before-popup");
await jr4("full goto / before popup", "full-goto-before-popup");
await jr4("dismiss on post, client nav to /, Nav button", "dismiss-then-nav-button");
await jr4("variant: / has its own utm (current URL wins, informational)", "new-utm-on-home");
// JR-9
{
  const c1 = await mk(browser, "jr9-a", { vp: "1440" }); const p1 = await c1.newPage();
  await p1.goto(BASE + POST + UTM, { waitUntil: "load" }); await p1.waitForSelector(S1, { timeout: 9000 }); await dismissS1(p1, "x");
  const st1 = await storage(p1); await c1.close();
  const c2 = await mk(browser, "jr9-b", { vp: "1440", suppressPopup: false }); await c2.addInitScript((ls) => { try { for (const [k, v] of Object.entries(ls)) localStorage.setItem(k, v); } catch {} }, st1.ls);
  const p2 = await c2.newPage(); await p2.goto(BASE + POST, { waitUntil: "load" }); await p2.waitForTimeout(4500);
  const auto = await p2.locator(S1).count(); const ss = (await storage(p2)).ss;
  await p2.getByRole("button", { name: "Join Season 01" }).first().click(); await p2.waitForSelector(S1, { timeout: 4000 }); await signUp(p2);
  const body = c2.qaCalls.posts[0]?.body;
  rec("JR-9", "1440", body?.attributionFrom === "none" && Object.values(body.attribution).every(v => v === ""), `copied localStorage keys=${JSON.stringify(Object.keys(st1.ls))}; new-session sessionStorage=${JSON.stringify(ss)}; auto-open=${auto}; body from=${body?.attributionFrom} page=${body?.page} attribution=${JSON.stringify(body?.attribution)}`, { body });
  save("json/JR-9.json", { st1, body, bodies: c2.qaCalls.posts }); await c2.close();
}
// MN-5 / MN-10
for (const vp of ["1440", "375"]) {
  const phone = vp === "375";
  const ctx = await mk(browser, `mn5-${vp}`, { vp }); const page = await ctx.newPage();
  const lead = () => ({ ga: evCount(ctx, "generate_lead"), fb: fbqTrack(ctx).filter(e => e.name === "Lead").length });
  const timeline = []; const snap = (step) => timeline.push({ step, ...lead(), posts: ctx.qaCalls.posts.length });
  ctx.qaApi.season.push(502); // first sign-up attempt fails, then 200
  await page.goto(BASE + POST, { waitUntil: "load" }); await page.waitForTimeout(1500); snap("page load 1.5s");
  const base = { events: events(ctx).map(e => e.name), fbq: ctx.qaCalls.fbq.map(e => e.a), clarity: ctx.qaCalls.clarity.length };
  await page.waitForSelector(S1, { timeout: 9000 }); await page.waitForTimeout(800); snap("popup open (auto, programmatic focus)");
  const callsAfterOpen = allCalls(ctx);
  const focused = await page.evaluate(() => document.activeElement && (document.activeElement.type || document.activeElement.tagName));
  await page.locator(S1 + " input[type=email]").focus(); await page.waitForTimeout(300); snap("email field focus()");
  await page.evaluate(() => { const i = document.querySelector('[role=dialog] input[type=email]'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; set.call(i, "team+gstest-1012-sentry@ekuzo.gg"); i.dispatchEvent(new Event("input", { bubbles: true })); i.dispatchEvent(new Event("change", { bubbles: true })); });
  await page.waitForTimeout(800); snap("script-set value + input/change events, no submit");
  const callsAfterSet = allCalls(ctx);
  if (phone) {
    const inp = page.locator(S1 + " input[type=email]"); const sb = page.locator(S1 + " button[type=submit]");
    await inp.scrollIntoViewIfNeeded(); const c1 = await center(inp); await cdpTouch(ctx, page, c1, { x: c1.x, y: c1.y - 200 }, 8); await page.waitForTimeout(500); snap("touch scroll starting on email field");
    await sb.scrollIntoViewIfNeeded(); const c2 = await center(sb); await cdpTouch(ctx, page, c2, { x: c2.x, y: c2.y - 200 }, 8); await page.waitForTimeout(500); snap("touch scroll starting on submit button");
    const val = await inp.inputValue(); timeline.push({ step: "email value after touch scrolls", val });
  }
  await dismissS1(page, "x"); await page.waitForTimeout(400); snap("dismiss via X");
  // reopen via sticky/nav to test Escape
  await page.evaluate(() => scrollTo(0, 800)); await page.waitForTimeout(1000);
  const btn = page.locator("div.fixed.bottom-0", { hasText: /Join Season 01/ }).first().locator("button", { hasText: "Join Season 01" });
  if (phone) { const c = await center(btn); await page.touchscreen.tap(c.x, c.y); } else await btn.click();
  await page.waitForSelector(S1, { timeout: 3000 }); await dismissS1(page, "esc"); await page.waitForTimeout(400); snap("reopen by tap, dismiss via Escape");
  // backdrop: popup is a full-viewport dialog, outside click not applicable
  // reopen, failed attempt then retry
  if (phone) { const c = await center(btn); await page.touchscreen.tap(c.x, c.y); } else await btn.click();
  await page.waitForSelector(S1, { timeout: 3000 });
  await page.locator(S1 + " input[type=email]").fill("team+gstest-1012-sentry@ekuzo.gg"); await page.locator(S1 + " button[type=submit]").click(); await page.waitForTimeout(1500); snap("after FAILED attempt (502)");
  const errTxt = await page.locator("#s1-err").innerText().catch(() => "(no error element)");
  await page.locator(S1 + " button[type=submit]").click(); await page.waitForTimeout(1800); snap("after retry (200)");
  const ids = ctx.qaCalls.posts.filter(p => p.body?.eventId).map(p => p.body.eventId); const L = { ga: events(ctx).filter(e => e.name === "generate_lead"), fb: fbqTrack(ctx).filter(e => e.name === "Lead") };
  const zeroBefore = timeline.filter(t => t.step !== "after retry (200)" && t.ga !== undefined).every(t => t.ga === 0 && t.fb === 0);
  const final = timeline[timeline.length - 1];
  const idOk = ids.length === 2 && ids[0] === ids[1] && L.fb[0]?.opts.eventID === ids[0];
  rec("MN-5", vp, zeroBefore && final.ga === 1 && final.fb === 1 && idOk, `Lead counts (ga/fb) per step: ${timeline.filter(t => t.ga !== undefined).map(t => `${t.step}=${t.ga}/${t.fb}`).join("; ")}; request eventIds=${JSON.stringify(ids)}; fb eventID=${L.fb[0]?.opts.eventID}; error text after 502="${errTxt}"; POST statuses=${JSON.stringify(ctx.qaCalls.posts.map(p => p.status))}`, { timeline });
  const nonBase = (calls) => ({ gtag: calls.gtag.filter(a => !(a[0] === "js" || a[0] === "config")), fbq: calls.fbq.filter(a => !(a[0] === "set" || a[0] === "init" || (a[0] === "track" && a[1] === "PageView"))), clarity: calls.clarity });
  const o = nonBase(callsAfterOpen), s = nonBase(callsAfterSet);
  rec("MN-10", vp, o.gtag.length === 0 && o.fbq.length === 0 && s.gtag.length === 0 && s.fbq.length === 0, `after popup open+programmatic focus (focused element type=${focused}) and script-set value: non-baseline gtag calls=${JSON.stringify(s.gtag)}, non-baseline fbq calls=${JSON.stringify(s.fbq)}, clarity=${JSON.stringify(s.clarity)}. Full call list saved.`, { callsAfterOpen, callsAfterSet });
  save(`json/mn5-${vp}.json`, { timeline, ids, posts: ctx.qaCalls.posts, calls: allCalls(ctx), callsAfterOpen, callsAfterSet, baselineAtLoad: base });
  await ctx.close();
}
// double-click / Enter spam
for (const vp of ["1440"]) {
  const ctx = await mk(browser, `spam-${vp}`, { vp }); const page = await ctx.newPage(); await page.goto(BASE + POST); await page.waitForSelector(S1, { timeout: 9000 });
  await page.locator(S1 + " input[type=email]").fill("team+gstest-1012-sentry@ekuzo.gg"); await page.locator(S1 + " button[type=submit]").dblclick(); await page.keyboard.press("Enter"); await page.keyboard.press("Enter"); await page.waitForTimeout(2000);
  rec("MN-5 double-click/Enter spam", vp, ctx.qaCalls.posts.filter(p => p.key === "season").length === 1 && evCount(ctx, "generate_lead") === 1, `season POSTs=${ctx.qaCalls.posts.filter(p => p.key === "season").length} generate_lead=${evCount(ctx, "generate_lead")} Lead=${fbqTrack(ctx).filter(e => e.name === "Lead").length}`);
  await ctx.close();
}
await browser.close(); save("results-jr.json", R);
