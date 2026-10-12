import { launchGuarded, mk, closeCtx, BASE, POST, S1, NL_TEXT, nlState, storage, events, evCount, allCalls, dismissS1, scrollSteps, cdpTouch, save, center, sleep } from "./sentry-lib.mjs";
const MON = (txts) => {
  const m = { nlHit: false, maxDialogs: 0, adds: [], nlHits: [] }; window.__mon = m;
  const scan = () => { try { const b = document.body && document.body.innerText || ""; for (const t of txts) if (b.toLowerCase().includes(t.toLowerCase())) { m.nlHit = true; if (!m.nlHits.includes(t)) m.nlHits.push(t); } const d = document.querySelectorAll("[role=dialog]").length; if (d > m.maxDialogs) m.maxDialogs = d; } catch {} };
  setInterval(scan, 50);
  const att = () => new MutationObserver(ms => { for (const mu of ms) for (const n of mu.addedNodes) { if (n.nodeType !== 1) continue; const ds = n.matches && n.matches("[role=dialog]") ? [n] : [...n.querySelectorAll ? n.querySelectorAll("[role=dialog]") : []]; for (const d of ds) m.adds.push({ t: Date.now(), label: d.getAttribute("aria-labelledby") }); } }).observe(document.documentElement, { childList: true, subtree: true });
  if (document.documentElement) att(); else document.addEventListener("DOMContentLoaded", att);
};
const R = []; const rec = (id, vp, pass, notes, extra) => { R.push({ id, vp, pass, notes, ...(extra ? { extra } : {}) }); console.log(pass ? "PASS" : "FAIL", id, vp, notes); };
const browser = await launchGuarded();
const slugs = { post: POST, fortnite: "/blog/should-you-ban-fortnite" };
async function mon(page) { return page.evaluate(() => window.__mon); }
for (const [tag, path] of Object.entries(slugs)) for (const vp of ["1440", "375"]) {
  const idp = tag === "post" ? "" : "JR-10 ";
  const ctx = await mk(browser, `${tag}-pb-${vp}`, { vp }); await ctx.addInitScript(MON, NL_TEXT);
  const page = await ctx.newPage();
  await page.goto(BASE + path, { waitUntil: "load" });
  const samples = [];
  await page.waitForTimeout(1800); samples.push({ at: "1.8s", s1: await page.locator(S1).count() });
  await page.waitForSelector(S1, { timeout: 9000 }).catch(() => {});
  const t_open = await page.locator(S1).count();
  await dismissS1(page, "x");
  const steps = await scrollSteps(page, [0.25, 0.5, 0.75, 1], 1000, nlState);
  const m = await mon(page);
  const dialogsSeen = m.adds;
  rec(`${idp}PB-1/MN-1`, vp, !m.nlHit && steps.every(s => s.state.nlDialogs.length === 0 && s.state.fixedEmailInputs === 0) && m.maxDialogs <= 1, `no newsletter copy ever in DOM (hits=${JSON.stringify(m.nlHits)}), non-S1 dialogs at 25/50/75/100%: ${steps.map(s => s.state.nlDialogs.length).join(",")}, fixed non-S1 email inputs: ${steps.map(s => s.state.fixedEmailInputs).join(",")}, case-insensitive copy match, maxDialogs=${m.maxDialogs}`, { steps });
  rec(`${idp}PB-5/MN-2`, vp, t_open === 1 && dialogsSeen.length === 1 && dialogsSeen[0].label === "s1-title", `dialogs that opened without a tap in the page view: ${dialogsSeen.length} (${JSON.stringify(dialogsSeen.map(d => d.label))}); S1 open at ~3-9s: ${t_open}; S1 at 1.8s: ${samples[0].s1}`);
  // PB-2
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300); await page.evaluate(() => scrollTo(0, 800)); await page.waitForTimeout(1200);
  const bar = page.locator("div.fixed.bottom-0", { hasText: /Join Season 01/ }).first();
  const barHtml = (await bar.count()) ? await bar.evaluate(e => e.outerHTML) : "";
  const barInputs = (await bar.count()) ? await bar.locator("input").count() : -1;
  const barText = (await bar.count()) ? (await bar.innerText()).replace(/\s+/g, " ") : "";
  const btn = bar.locator("button", { hasText: "Join Season 01" });
  const before = await page.locator(S1).count();
  if (vp === "375") await page.touchscreen.tap(...Object.values(await center(btn))); else await btn.click();
  await page.waitForSelector(S1, { timeout: 3000 }).catch(() => {});
  const after = await page.locator(S1).count();
  rec(`${idp}PB-2`, vp, (await bar.count()) === 1 && barInputs === 0 && /Join Season 01/.test(barText) && before === 0 && after === 1 && !/One email/.test(barText), `bar text="${barText}", inputs in bar=${barInputs}, S1 before tap=${before}, after tap=${after}`);
  save(`html/${tag}-${vp}-stickybar.html`, barHtml);
  const st = await storage(page); const nlKeys = Object.keys(st.ls).filter(k => /^ekuzo_nl_|ekuzo_newsletter/.test(k));
  rec(`${idp}PB-3`, vp, nlKeys.length === 0 && evCount(ctx, "newsletter_impression") === 0, `ekuzo_nl_*/newsletter keys: ${JSON.stringify(nlKeys)}; newsletter_impression count=${evCount(ctx, "newsletter_impression")}; localStorage keys=${JSON.stringify(Object.keys(st.ls))}; gtag events seen=${JSON.stringify(events(ctx).map(e => e.name))}`);
  if (tag === "post") {
    // MN-8a: no second auto-open in same page view
    await dismissS1(page, "esc"); await page.waitForTimeout(6000);
    const m2 = await mon(page);
    rec("MN-8a same-view", vp, m2.adds.length === 2 && (await page.locator(S1).count()) === 0, `after dismissing the tap-opened dialog and waiting 6s: total dialog adds=${m2.adds.length} (1 auto + 1 tap), open now=${await page.locator(S1).count()}`);
    // MN-8b new page load within window
    await page.goto(BASE + POST, { waitUntil: "load" }); await page.waitForTimeout(6000);
    const a = await page.locator(S1).count();
    await page.goto(BASE + "/", { waitUntil: "load" }); await page.waitForTimeout(6000);
    const b2 = await page.locator(S1).count();
    rec("MN-8b new-load", vp, a === 0 && b2 === 0, `post reload S1=${a}; / load S1=${b2} after dismiss`);
    // JR-5 reload then sticky tap
    await page.goto(BASE + POST, { waitUntil: "load" }); await page.waitForTimeout(4500);
    const noAuto = await page.locator(S1).count();
    await page.evaluate(() => scrollTo(0, 800)); await page.waitForTimeout(1200);
    const btn2 = page.locator("div.fixed.bottom-0", { hasText: /Join Season 01/ }).first().locator("button", { hasText: "Join Season 01" });
    if (vp === "375") await page.touchscreen.tap(...Object.values(await center(btn2))); else await btn2.click();
    await page.waitForSelector(S1, { timeout: 3000 }).catch(() => {});
    rec("JR-5", vp, noAuto === 0 && (await page.locator(S1).count()) === 1, `dismissed (Esc) then reload: auto S1=${noAuto}; sticky bar tap then opens: ${await page.locator(S1).count()}`);
  }
  save(`json/${tag}-${vp}-pb-calls.json`, { calls: allCalls(ctx), posts: ctx.qaCalls.posts, unexpected: ctx.qaCalls.unexpected, mon: await mon(page).catch(() => null) });
  await page.close(); await closeCtx(ctx);
}
// JR-5 boundaries and backdrop/X dismissal
for (const vp of ["1440"]) {
  for (const [label, days, expectOpen] of [["6d ago", 6, false], ["8d ago", 8, true]]) {
    const ctx = await mk(browser, `jr5-${label}`, { vp }); await ctx.addInitScript((d) => { try { localStorage.setItem("ekuzo_s1_dismissed_at", String(Date.now() - d * 86400000)); } catch {} }, days);
    const page = await ctx.newPage(); await page.goto(BASE + POST); await page.waitForTimeout(6500);
    const o = (await page.locator(S1).count()) === 1; rec(`JR-5 boundary ${label}`, vp, o === expectOpen, `dismissed_at=${label}: auto-open=${o}, expected=${expectOpen}`); await ctx.close();
  }
  for (const how of ["x", "backdrop"]) {
    const ctx = await mk(browser, `jr5-${how}`, { vp }); const page = await ctx.newPage(); await page.goto(BASE + POST); await page.waitForSelector(S1, { timeout: 9000 });
    await dismissS1(page, how); const st = await storage(page);
    await page.reload(); await page.waitForTimeout(5000);
    rec(`JR-5 dismiss via ${how}`, vp, !!st.ls.ekuzo_s1_dismissed_at && (await page.locator(S1).count()) === 0, `closed=${(await page.locator(S1).count()) === 0} dismissed_at written=${!!st.ls.ekuzo_s1_dismissed_at}; after reload S1=${await page.locator(S1).count()}; Lead events=${evCount(ctx, "generate_lead")}`);
    await ctx.close();
  }
}
// MN-9 and MN-8d touch (phone)
{
  const ctx = await mk(browser, "mn9", { vp: "375", suppressPopup: true }); await ctx.addInitScript(MON, NL_TEXT);
  const page = await ctx.newPage(); await page.goto(BASE + POST, { waitUntil: "load" }); await page.waitForTimeout(1500);
  // touch scrolls anywhere, popup dismissed
  await page.evaluate(() => scrollTo(0, 100)); await page.waitForTimeout(300);
  for (const [fy, ty] of [[500, 200], [300, 600], [600, 300]]) { await cdpTouch(ctx, page, { x: 187, y: fy }, { x: 187, y: ty }); await page.waitForTimeout(400); }
  const afterAny = await page.locator(S1).count();
  await page.evaluate(() => scrollTo(0, 800)); await page.waitForTimeout(1200);
  const btn = page.locator("div.fixed.bottom-0", { hasText: /Join Season 01/ }).first().locator("button", { hasText: "Join Season 01" });
  const c = await center(btn); const sy0 = await page.evaluate(() => scrollY);
  await cdpTouch(ctx, page, c, { x: c.x, y: c.y - 300 }, 10); await page.waitForTimeout(800);
  const afterSwipeUp = await page.locator(S1).count(); const sy1 = await page.evaluate(() => scrollY);
  await page.evaluate(() => scrollTo(0, 800)); await page.waitForTimeout(800);
  const c2 = await center(btn);
  await cdpTouch(ctx, page, c2, { x: c2.x, y: c2.y + 250 }, 10); await page.waitForTimeout(800);
  const afterSwipeDown = await page.locator(S1).count();
  await page.evaluate(() => scrollTo(0, 800)); await page.waitForTimeout(800);
  const c3 = await center(btn); await page.touchscreen.tap(c3.x, c3.y); await page.waitForSelector(S1, { timeout: 3000 }).catch(() => {});
  const afterTap = await page.locator(S1).count();
  rec("MN-9", "375", afterSwipeUp === 0 && afterSwipeDown === 0 && afterTap === 1, `touch swipe starting on bar button: up 300px -> S1=${afterSwipeUp} (scrollY ${sy0}->${sy1}), down 250px -> S1=${afterSwipeDown}; positive control tap -> S1=${afterTap}`);
  rec("MN-8d touch", "375", afterAny === 0, `three touch scroll gestures on page body with popup dismissed: S1=${afterAny}`);
  save("json/mn9-calls.json", { calls: allCalls(ctx), posts: ctx.qaCalls.posts });
  await ctx.close();
}
// MN-8c after sign-up (intercepted)
for (const vp of ["1440", "375"]) {
  const ctx = await mk(browser, `mn8c-${vp}`, { vp }); const page = await ctx.newPage();
  await page.goto(BASE + POST); await page.waitForSelector(S1, { timeout: 9000 });
  await page.locator(S1 + ' input[type=email]').fill("team+gstest-1012-sentry@ekuzo.gg"); await page.locator(S1 + ' button[type=submit]').click();
  await page.waitForFunction(() => document.body.innerText.includes("Awesome") || document.body.innerText.length > 0, null, { timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const st = await storage(page); const done = await page.locator(S1).innerText().catch(() => "");
  // close with the done-state close (X)
  await page.locator(S1 + ' button[aria-label="Close"]').click().catch(() => {}); await page.waitForTimeout(500);
  await page.waitForTimeout(5000); const a = await page.locator(S1).count();
  await page.goto(BASE + POST); await page.waitForTimeout(5500); const b = await page.locator(S1).count();
  await page.goto(BASE + "/"); await page.waitForTimeout(5500); const c = await page.locator(S1).count();
  rec("MN-8c after sign-up", vp, st.ls.ekuzo_s1_joined === "1" && a === 0 && b === 0 && c === 0, `joined=${st.ls.ekuzo_s1_joined}, POSTs=${ctx.qaCalls.posts.length}, S1 5s after close=${a}, post reload=${b}, / load=${c}; done text="${done.replace(/\s+/g, " ").slice(0, 80)}"`);
  await ctx.close();
}
// JR-6 featured card
{
  const ctx = await mk(browser, "jr6", { vp: "1440", suppressPopup: true }); const page = await ctx.newPage();
  await page.goto(BASE + "/blog", { waitUntil: "load" }); await page.waitForTimeout(1000);
  const cards = await page.locator(`a[href="${POST}"]`).count();
  await page.locator(`a[href="${POST}"]`).first().click(); await page.waitForURL("**" + POST, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1200);
  rec("JR-6", "1440", page.url().endsWith(POST) && (await page.locator("h1").innerText()).length > 5, `cards linking to post on /blog: ${cards}; landed ${page.url()}; h1="${(await page.locator("h1").innerText()).replace(/\s+/g, " ")}"; own console errors: ${ctx.qaRec.consoleErrors.filter(e => !/ERR_BLOCKED|torn%20paper/.test(e.text + e.loc)).length}`);
  await ctx.close();
}
await browser.close();
save("results-pb.json", R);
