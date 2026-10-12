import { launchGuarded, mk, BASE, POST, S1, storage, events, evCount, fbqTrack, save, center, sleep, dismissS1 } from "./sentry-lib.mjs";
const R = []; const rec = (id, sev, note, extra) => { R.push({ id, sev, note, ...(extra ? { extra } : {}) }); console.log(`[${sev}] ${id}: ${String(note).slice(0, 500)}`); };
const browser = await launchGuarded();
const EMAIL = "team+gstest-1012-sentry@ekuzo.gg";
const lead = (ctx) => ({ ga: evCount(ctx, "generate_lead"), fb: fbqTrack(ctx).filter(e => e.name === "Lead").length });
const seasonPosts = (ctx) => ctx.qaCalls.posts.filter(p => p.key === "season");
// custom responder for /api/season-one, later route wins
async function responder(ctx, fn) {
  await ctx.route(/\/api\/season-one(\?|$)/, async (route) => {
    const req = route.request(); if (req.method() !== "POST") return route.continue();
    let body = null; try { body = JSON.parse(req.postData() || "null"); } catch { body = req.postData(); }
    ctx.qaCalls.posts.push({ t: Date.now(), key: "season", status: "custom", body });
    await fn(route, body);
  });
}
const openPopup = async (page, vp) => { await page.waitForSelector(S1, { timeout: 9000 }); };
const errText = (page) => page.locator("#s1-err").innerText().catch(() => "(none)");
// 1. rapid open/close/open (via sticky bar)
{
  const ctx = await mk(browser, "b-rapid", { vp: "1440" }); const page = await ctx.newPage(); const errs = []; page.on("pageerror", e => errs.push(String(e)));
  await page.goto(BASE + POST, { waitUntil: "load" }); await openPopup(page); await page.keyboard.press("Escape"); await page.waitForTimeout(300);
  await page.evaluate(() => scrollTo(0, 800)); await page.waitForTimeout(1000);
  const btn = page.locator("div.fixed.bottom-0", { hasText: /Join Season 01/ }).first().locator("button", { hasText: "Join Season 01" });
  let maxD = 0;
  for (let i = 0; i < 8; i++) { await btn.click({ timeout: 2000 }).catch(() => {}); await page.waitForTimeout(150); maxD = Math.max(maxD, await page.locator("[role=dialog]").count()); await page.keyboard.press("Escape"); }
  await btn.click(); await page.waitForTimeout(500); await btn.click({ timeout: 800, force: true }).catch(() => {});
  const d = await page.locator("[role=dialog]").count(); const ov = await page.evaluate(() => document.body.style.overflow);
  await page.keyboard.press("Escape"); await page.waitForTimeout(300);
  const ov2 = await page.evaluate(() => document.body.style.overflow); const closed = await page.locator("[role=dialog]").count();
  rec("rapid open/close/open x8 + double open", maxD <= 1 && d === 1 && closed === 0 && ov2 === "" && !errs.length ? "ok" : "FINDING", `max dialogs=${maxD}, dialogs after double open=${d}, body.overflow open="${ov}" after close="${ov2}", dialogs after Esc=${closed}, page errors=${errs.length} ${errs[0] || ""}, Leads=${JSON.stringify(lead(ctx))}, POSTs=${seasonPosts(ctx).length}`);
  await ctx.close();
}
// 2. Escape while submitting (hold response 2.5s)
{
  const ctx = await mk(browser, "b-esc-submitting", { vp: "1440" }); const page = await ctx.newPage(); const errs = []; page.on("pageerror", e => errs.push(String(e)));
  await responder(ctx, async (route) => { await sleep(2500); await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }).catch(() => {}); });
  await page.goto(BASE + POST); await openPopup(page);
  await page.locator(S1 + " input[type=email]").fill(EMAIL); await page.locator(S1 + " button[type=submit]").click(); await page.waitForTimeout(300);
  const btnTxt = await page.locator(S1 + " button[type=submit]").innerText(); await page.keyboard.press("Escape"); await page.waitForTimeout(300);
  const closedNow = await page.locator(S1).count(); await page.waitForTimeout(3000);
  const st = await storage(page); const L = lead(ctx);
  rec("Escape while submitting", errs.length === 0 && L.ga <= 1 ? "info" : "FINDING", `button during submit="${btnTxt}", dialog after Esc=${closedNow}, request still completes: Leads after response ga/fb=${L.ga}/${L.fb}, localStorage joined=${st.ls.ekuzo_s1_joined}, dismissed_at=${!!st.ls.ekuzo_s1_dismissed_at}, page errors=${errs.length} ${errs[0] || ""}, re-open after: ${await page.locator(S1).count()}`);
  await ctx.close();
}
// 3. email variants
const variants = [["empty", ""], ["whitespace", "     "], ["300 chars", "a".repeat(290) + "@x.com"], ["unicode local+idn", "tëst用户@exämple.com"], ["a@b", "a@b"], ['"><script>', '"><script>alert(1)</script>@x.co'], ["leading/trailing spaces", "  " + EMAIL + "  "], ["two @", "a@@b.co"]];
for (const [label, val] of variants) {
  const ctx = await mk(browser, "b-email", { vp: "1440" }); const page = await ctx.newPage(); let dlg = 0; page.on("dialog", d => { dlg++; d.dismiss(); });
  await page.goto(BASE + POST); await openPopup(page);
  const inp = page.locator(S1 + " input[type=email]"); await inp.fill(val).catch(async () => { await page.evaluate((v) => { const i = document.querySelector("[role=dialog] input[type=email]"); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(i, v); i.dispatchEvent(new Event("input", { bubbles: true })); }, val); });
  const sanitized = await inp.inputValue();
  await page.locator(S1 + " button[type=submit]").click(); await page.waitForTimeout(900);
  const sent = seasonPosts(ctx); const html5 = await inp.evaluate(i => i.validationMessage, null, { timeout: 500 }).catch(() => '(field gone: success state)');
  rec(`email "${label}"`, dlg ? "FINDING" : "info", `typed ${val.length} chars, field kept ${sanitized.length}; HTML5 validity="${html5.slice(0, 60)}"; POSTs=${sent.length}${sent[0] ? " body.email=" + JSON.stringify(String(sent[0].body.email).slice(0, 80)) + " len " + String(sent[0].body.email).length : ""}; UI error="${await errText(page)}"; dialog still open=${await page.locator(S1).count()}; Leads=${JSON.stringify(lead(ctx))}; alert dialogs=${dlg}`);
  await ctx.close();
}
// 4. double click, Enter+click
{
  const ctx = await mk(browser, "b-dbl", { vp: "1440" }); const page = await ctx.newPage();
  await responder(ctx, async (route) => { await sleep(500); await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }); });
  await page.goto(BASE + POST); await openPopup(page);
  const inp = page.locator(S1 + " input[type=email]"); await inp.fill(EMAIL); await inp.press("Enter"); await page.locator(S1 + " button[type=submit]").click({ force: true, timeout: 500 }).catch(() => {}); await page.locator(S1 + " button[type=submit]").dblclick({ force: true, timeout: 500 }).catch(() => {}); await page.waitForTimeout(2000);
  const L = lead(ctx); rec("Enter + click + dblclick submit", seasonPosts(ctx).length === 1 && L.ga === 1 && L.fb === 1 ? "ok" : "FINDING", `POSTs=${seasonPosts(ctx).length}, generate_lead=${L.ga}, fbq Lead=${L.fb}`);
  await ctx.close();
}
// 5. submit, back, forward, reload
{
  const ctx = await mk(browser, "b-nav", { vp: "1440" }); const page = await ctx.newPage();
  await page.goto(BASE + POST); await openPopup(page); await page.locator(S1 + " input[type=email]").fill(EMAIL); await page.locator(S1 + " button[type=submit]").click(); await page.waitForTimeout(1500);
  const L0 = lead(ctx); await page.locator(S1 + ' button[aria-label="Close"]').click().catch(() => {}); await page.waitForTimeout(300);
  await page.goto(BASE + "/blog"); await page.waitForTimeout(500); await page.goBack(); await page.waitForTimeout(3500); const a = await page.locator(S1).count();
  await page.goForward(); await page.waitForTimeout(3500); const b = await page.locator(S1).count();
  await page.goBack(); await page.waitForTimeout(500); await page.reload(); await page.waitForTimeout(5500); const c = await page.locator(S1).count(); const L1 = lead(ctx);
  rec("submit, back, forward, reload", L1.ga === 1 && L1.fb === 1 && a + b + c === 0 && seasonPosts(ctx).length === 1 ? "ok" : "FINDING", `Leads after submit=${JSON.stringify(L0)}, after nav=${JSON.stringify(L1)}, POSTs=${seasonPosts(ctx).length}, popup open after back/forward/reload=${a}/${b}/${c}`);
  await ctx.close();
}
// 6. server responses
const modes = [
  ["500 {ok:false}", async (route) => route.fulfill({ status: 500, contentType: "application/json", body: '{"ok":false,"error":"We couldn’t save that. Please try again."}' })],
  ["500 html body", async (route) => route.fulfill({ status: 500, contentType: "text/html", body: "<h1>Internal Server Error</h1>" })],
  ["200 malformed JSON", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: "not json{" })],
  ["200 {ok:false}", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":false}' })],
  ["network abort", async (route) => route.abort("failed")],
];
for (const [label, fn] of modes) {
  const ctx = await mk(browser, "b-resp", { vp: "1440" }); const page = await ctx.newPage(); const errs = []; page.on("pageerror", e => errs.push(String(e)));
  await responder(ctx, async (route) => fn(route));
  await page.goto(BASE + POST); await openPopup(page); await page.locator(S1 + " input[type=email]").fill(EMAIL); await page.locator(S1 + " button[type=submit]").click(); await page.waitForTimeout(1500);
  const err = await errText(page); const done = await page.locator(S1).innerText().then(t => /you.re on the list|on the list|thanks|got it|awesome|one more|games/i.test(t)).catch(() => false);
  const L = lead(ctx); const btnEn = await page.locator(S1 + " button[type=submit]").isEnabled().catch(() => null);
  const lead_should = false;
  rec(`response: ${label}`, (L.ga || L.fb || done) ? "FINDING" : "ok", `UI error text="${err}", success state shown=${done}, submit button enabled=${btnEn}, Leads=${JSON.stringify(L)}, page errors=${errs.length}, page usable (dialog closable)=${await page.locator(S1 + ' button[aria-label="Close"]').isVisible().catch(() => false)}`);
  await ctx.close();
}
// 30s hang then abort
{
  const ctx = await mk(browser, "b-hang", { vp: "1440" }); const page = await ctx.newPage(); const errs = []; page.on("pageerror", e => errs.push(String(e)));
  await responder(ctx, async (route) => { await sleep(30000); await route.abort("timedout").catch(() => {}); });
  await page.goto(BASE + POST); await openPopup(page); await page.locator(S1 + " input[type=email]").fill(EMAIL); await page.locator(S1 + " button[type=submit]").click();
  await page.waitForTimeout(8000); const at8 = { btn: await page.locator(S1 + " button[type=submit]").innerText(), en: await page.locator(S1 + " button[type=submit]").isEnabled(), err: await errText(page) };
  await page.waitForTimeout(24000); const at32 = { btn: await page.locator(S1 + " button[type=submit]").innerText().catch(() => "?"), en: await page.locator(S1 + " button[type=submit]").isEnabled().catch(() => null), err: await errText(page) };
  rec("response: 30 s hang then abort", at8.en === false && at8.btn.includes("Saving") ? "FINDING" : "info", `at 8 s: button="${at8.btn}" enabled=${at8.en} error="${at8.err}"; at 32 s (after abort): button="${at32.btn}" enabled=${at32.en} error="${at32.err}"; client has no fetch timeout (spinner persists as long as the request does; Esc/X still close); Leads=${JSON.stringify(lead(ctx))}; page errors=${errs.length}`);
  await ctx.close();
}
// honeypot
{
  const ctx = await mk(browser, "b-hp", { vp: "1440" }); const page = await ctx.newPage();
  await page.goto(BASE + POST); await openPopup(page);
  await page.evaluate(() => { const i = document.querySelector('[role=dialog] input[name=ekz_hp]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(i, "bot"); i.dispatchEvent(new Event("input", { bubbles: true })); });
  await page.locator(S1 + " input[type=email]").fill(EMAIL); await page.locator(S1 + " button[type=submit]").click(); await page.waitForTimeout(1500);
  const L = lead(ctx); rec("honeypot filled", L.ga === 0 && L.fb === 0 ? "ok" : "FINDING", `POST sent with ekz_hp="${seasonPosts(ctx)[0]?.body.ekz_hp}", Leads=${JSON.stringify(L)}, UI shows success=${(await page.locator(S1).innerText().catch(() => "")).slice(0, 60).replace(/\s+/g, " ")}, joined key=${(await storage(page)).ls.ekuzo_s1_joined}`);
  await ctx.close();
}
save("b1-results.json", R); await browser.close();
