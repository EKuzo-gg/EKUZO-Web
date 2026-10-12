import { launchGuarded, mk, BASE, POST, S1, NL_TEXT, nlState, storage, events, evCount, fbqTrack, save, sleep, scrollSteps } from "./sentry-lib.mjs";
const R = []; const rec = (id, sev, note, extra) => { R.push({ id, sev, note, ...(extra ? { extra } : {}) }); console.log(`[${sev}] ${id}: ${String(note).slice(0, 700)}`); };
const browser = await launchGuarded();
const EMAIL = "team+gstest-1012-sentry@ekuzo.gg";
const lead = (ctx) => ({ ga: evCount(ctx, "generate_lead"), fb: fbqTrack(ctx).filter(e => e.name === "Lead").length });
const seasonPosts = (ctx) => ctx.qaCalls.posts.filter(p => p.key === "season");
async function responder(ctx, fn) { await ctx.route(/\/api\/season-one(\?|$)/, async (route) => { const req = route.request(); if (req.method() !== "POST") return route.continue(); let body = null; try { body = JSON.parse(req.postData() || "null"); } catch {} ctx.qaCalls.posts.push({ t: Date.now(), key: "season", status: "custom", body }); await fn(route, body); }); }
// hang timeline
{
  const ctx = await mk(browser, "b-hang2", { vp: "1440" }); const page = await ctx.newPage();
  await responder(ctx, async (route) => { await sleep(30000); await route.abort("timedout").catch(() => {}); });
  await page.goto(BASE + POST); await page.waitForSelector(S1); await page.locator(S1 + " input[type=email]").fill(EMAIL); await page.locator(S1 + " button[type=submit]").click();
  const tl = []; const t0 = Date.now();
  for (let i = 0; i < 17; i++) { await page.waitForTimeout(2000); tl.push(`${Math.round((Date.now() - t0) / 1000)}s btn="${await page.locator(S1 + " button[type=submit]").innerText().catch(() => "?")}" err="${await page.locator("#s1-err").innerText().catch(() => "-")}"`); }
  rec("hang timeline", "info", tl.filter((_, i) => [0, 2, 4, 6, 8, 12, 14, 15, 16].includes(i)).join(" | "));
  await ctx.close();
}
// storage failures
const THROW_METHODS = () => { for (const m of ["getItem", "setItem", "removeItem", "clear", "key"]) Storage.prototype[m] = function () { throw new DOMException("QA storage blocked", "SecurityError"); }; };
const THROW_ACCESSOR = () => { for (const n of ["localStorage", "sessionStorage"]) Object.defineProperty(window, n, { configurable: true, get() { throw new DOMException("QA storage blocked", "SecurityError"); } }); };
for (const [label, init] of [["Storage.prototype methods throw", THROW_METHODS], ["window.localStorage/sessionStorage getters throw", THROW_ACCESSOR]]) {
  for (const vp of ["1440", "375"]) {
    const ctx = await mk(browser, "b-store", { vp, suppressPopup: false }); await ctx.addInitScript(init);
    const page = await ctx.newPage(); const errs = []; page.on("pageerror", e => errs.push(String(e).slice(0, 160)));
    await page.goto(BASE + POST, { waitUntil: "load" }); await page.waitForTimeout(6000);
    const h1 = await page.locator("h1").innerText().catch(() => "(no h1)"); const popup = await page.locator(S1).count();
    let signup = "n/a";
    if (popup) { await page.locator(S1 + " input[type=email]").fill(EMAIL); await page.locator(S1 + " button[type=submit]").click(); await page.waitForTimeout(1500); signup = `POSTs=${seasonPosts(ctx).length} Leads=${JSON.stringify(lead(ctx))} done=${/on the list/i.test(await page.locator(S1).innerText().catch(() => ""))}`; await page.keyboard.press("Escape"); await page.waitForTimeout(300); }
    const barVisible = await (async () => { await page.evaluate(() => scrollTo(0, 800)); await page.waitForTimeout(1000); return page.locator("div.fixed.bottom-0", { hasText: /Join Season 01/ }).count(); })();
    await page.goto(BASE + POST, { waitUntil: "load" }); await page.waitForTimeout(5500); const popup2 = await page.locator(S1).count();
    await ctx.close();
    // ai_referral
    const c2 = await mk(browser, "b-store-ai", { vp, suppressPopup: false }); await c2.addInitScript(init); const p2 = await c2.newPage(); const e2 = []; p2.on("pageerror", e => e2.push(String(e).slice(0, 160)));
    await p2.goto(BASE + POST, { referer: "https://chatgpt.com/", waitUntil: "load" }); await p2.waitForTimeout(4000); await p2.reload({ waitUntil: "load", }).catch(() => {}); await p2.waitForTimeout(4000);
    const ai = events(c2).filter(e => e.name === "ai_referral").length;
    rec(`storage blocked: ${label} @${vp}`, errs.length || e2.length ? "FINDING" : "info", `page renders h1="${h1.slice(0, 40)}...", uncaught page errors=${errs.length} ${errs[0] || ""} / ai run ${e2.length}; popup auto-opens=${popup}; sign-up in popup -> ${signup}; sticky bar present=${barVisible}; popup on a second page load=${popup2} (no dismiss memory, shows each load); ai_referral events across load+reload (chatgpt referer)=${ai} (contract: may fire each page view when storage blocked, known)`);
    await c2.close();
  }
}
// URL abuse
const enc = encodeURIComponent;
const urlCases = [
  ["3000-char utm_content", `?utm_source=x&utm_medium=social&utm_campaign=c&utm_content=${"A".repeat(3000)}`],
  ["utm_source html payload", `?utm_source=${enc("<img src=x onerror=alert(1)>")}&utm_medium=social&utm_campaign=c&utm_content=k`],
  ["duplicate utm_source", `?utm_source=first&utm_source=second&utm_medium=social&utm_content=k`],
  ["utm_source javascript payload", `?utm_source=${enc("\"'><script>window.__xss=1</script>")}&utm_term=${enc("javascript:alert(1)")}`],
  ["?join=season-one", `?join=season-one`],
  ["?join=anything", `?join=anything`],
  ["?join (empty)", `?join=`],
];
for (const [label, q] of urlCases) {
  const ctx = await mk(browser, "b-url", { vp: "1440" }); await ctx.addInitScript(() => { window.__xss = 0; const a = window.alert; window.alert = function () { window.__xss++; }; });
  const page = await ctx.newPage(); let dlg = 0; page.on("dialog", d => { dlg++; d.dismiss(); }); const errs = []; page.on("pageerror", e => errs.push(String(e).slice(0, 120)));
  // suppressPopup default false in mk, but newCtx sets dismissed unless suppressPopup false: mk passes false
  await page.goto(BASE + POST + q, { waitUntil: "load" }); const early = await page.locator(S1).count(); await page.waitForTimeout(500);
  const opened = await page.waitForSelector(S1, { timeout: 7000 }).then(() => true).catch(() => false);
  let bodyInfo = "popup not open";
  if (opened) { await page.locator(S1 + " input[type=email]").fill(EMAIL); await page.locator(S1 + " button[type=submit]").click(); await page.waitForTimeout(1500); const b = seasonPosts(ctx)[0]?.body; const att = b?.attribution || {}; bodyInfo = `body.ad len ${String(b?.ad ?? "").length}; attribution lengths ${JSON.stringify(Object.fromEntries(Object.entries(att).map(([k, v]) => [k, String(v).length])))}; from=${b?.attributionFrom}; page len ${String(b?.page ?? "").length}; eventSourceUrl len ${String(b?.eventSourceUrl ?? "").length}; utm_source sample=${JSON.stringify(String(att.utm_source ?? "").slice(0, 60))}`; }
  const xss = await page.evaluate(() => window.__xss || 0); const injected = await page.evaluate(() => !!document.querySelector("img[src=x], script:not([src]):not([id]):not([type])") && [...document.querySelectorAll("img[src=x]")].length);
  const maxLen = Math.max(0, ...Object.values(seasonPosts(ctx)[0]?.body?.attribution || {}).map(v => String(v).length));
  rec(`URL: ${label}`, xss || dlg || errs.length ? "FINDING" : "info", `popup auto-open early(<1s)=${early}, opened by 8s=${opened}; script execution flag=${xss}, alert dialogs=${dlg}, injected <img src=x> in DOM=${injected}, page errors=${errs.length}; ${bodyInfo}; max attribution value length=${maxLen} (contract cap 200)`);
  await ctx.close();
}
// ?join=anything after joined / dismissed: does it re-open
{
  const ctx = await mk(browser, "b-join-dismissed", { vp: "1440", suppressPopup: true }); await ctx.addInitScript(() => { try { localStorage.setItem("ekuzo_s1_joined", "1"); } catch {} });
  const page = await ctx.newPage(); await page.goto(BASE + POST + "?join=x"); await page.waitForTimeout(3500);
  rec("?join=x for an already-joined visitor", "info", `popup opens=${await page.locator(S1).count()} (documented: ?join always opens)`); await ctx.close();
}
// dormancy with thumbs variant
for (const vp of ["1440", "375"]) {
  const ctx = await mk(browser, "b-thumbs", { vp, suppressPopup: true }); await ctx.addInitScript(() => { try { localStorage.setItem("ekuzo_nl_variant", "thumbs"); } catch {} });
  const page = await ctx.newPage(); await page.goto(BASE + POST, { waitUntil: "load" }); await page.waitForSelector(S1, { timeout: 1000 }).catch(() => {});
  const steps = await scrollSteps(page, [0.2, 0.45, 0.5, 0.6, 0.75, 1], 1200, nlState);
  const st = await storage(page);
  const bad = steps.some(s => s.state.nlDialogs.length || s.state.fixedEmailInputs || s.state.hits.length);
  rec(`dormancy with ekuzo_nl_variant=thumbs @${vp}`, bad || evCount(ctx, "newsletter_impression") ? "FINDING" : "ok", `newsletter copy/dialog/bar-email at 20/45/50/60/75/100%: ${JSON.stringify(steps.map(s => [s.state.hits.length, s.state.nlDialogs.length, s.state.fixedEmailInputs]))}; newsletter_impression=${evCount(ctx, "newsletter_impression")}; localStorage=${JSON.stringify(st.ls)}`);
  await ctx.close();
}
save("b2-results.json", R); await browser.close();
