import { launchGuarded, mk, BASE, POST, S1, storage, events, evCount, save, EV, sleep, center } from "./sentry-lib.mjs";
const R = []; const rec = (id, vp, pass, notes, extra) => { R.push({ id, vp, pass, notes, ...(extra ? { extra } : {}) }); console.log(pass ? "PASS" : "FAIL", id, vp, notes.slice(0, 900)); };
const browser = await launchGuarded();
const runs = [["375", null], ["1440", null], ["1440", "classic"], ["1440", "thumbs"], ["375", "classic"], ["375", "thumbs"]];
for (const [vp, force] of runs) {
  const tag = `${vp}-${force || "random"}`;
  // A: sticky bar
  {
    const ctx = await mk(browser, `pb4a-${tag}`, { vp }); if (force) await ctx.addInitScript((v) => { try { localStorage.setItem("ekuzo_nl_variant", v); } catch {} }, force);
    const page = await ctx.newPage(); await page.goto(BASE + POST, { waitUntil: "load" }); await page.waitForTimeout(1500);
    const navTxt = await page.evaluate(() => [...document.querySelectorAll("header button, nav button, header a")].map(e => e.textContent.trim()).filter(Boolean).slice(0, 12));
    await page.evaluate(() => scrollTo(0, 800)); await page.waitForTimeout(1500);
    const bar = page.locator("div.fixed.bottom-0", { has: page.locator("input[type=email]") }).first();
    const hasBar = await bar.count(); const st = await storage(page); const variant = st.ls.ekuzo_nl_variant;
    const barText = hasBar ? (await bar.innerText()).replace(/\s+/g, " ") : "";
    await page.screenshot({ path: `${EV}/pb4-bar-${tag}.png` });
    let body = null;
    if (hasBar) { await bar.locator("input[type=email]").fill("team+gstest-1012-sentry@ekuzo.gg"); await bar.locator("button[type=submit], button").last().click(); await page.waitForTimeout(1500); body = ctx.qaCalls.posts.find(p => p.key === "newsletter")?.body; }
    const s1 = await page.locator(S1).count();
    await page.waitForTimeout(3500); const s1b = await page.locator(S1).count();
    rec(`PB-4 bar ${tag}`, vp, hasBar === 1 && !!variant && body?.utm_source === "blog" && body?.utm_medium === "sticky" && body?.utm_campaign === variant && s1 === 0 && s1b === 0 && !Object.keys(st.ls).some(k => /^ekuzo_s1_/.test(k) && k !== "ekuzo_s1_dismissed_at"), `nav/header texts=${JSON.stringify(navTxt)}; bar present=${hasBar} text="${barText}"; ekuzo_nl_variant=${variant}; intercepted /api/newsletter body=${JSON.stringify(body)}; S1 popup count at 1.5s after scroll=${s1}, later=${s1b}; storage keys=${JSON.stringify(Object.keys(st.ls))}; gtag events=${JSON.stringify(events(ctx).map(e => e.name + ":" + JSON.stringify(e.params)))}`);
    save(`json/pb4-bar-${tag}.json`, { body, st, events: events(ctx) }); await ctx.close();
  }
  // B: popup at 50%
  {
    const ctx = await mk(browser, `pb4b-${tag}`, { vp }); if (force) await ctx.addInitScript((v) => { try { localStorage.setItem("ekuzo_nl_variant", v); } catch {} }, force);
    const page = await ctx.newPage(); await page.goto(BASE + POST, { waitUntil: "load" }); await page.waitForTimeout(1500);
    const seen = [];
    for (const f of [0.1, 0.25, 0.35, 0.45, 0.55, 0.7]) {
      await page.evaluate((f) => { const h = document.documentElement.scrollHeight; scrollTo(0, Math.max(0, f * h - innerHeight * (f < 0.5 ? 1 : 0.5) )); }, f); await page.waitForTimeout(1300);
      const info = await page.evaluate(() => ({ pop: /one email after you read this|for parents of gamers, once a week/i.test(document.body.innerText), pct: Math.round(100 * (scrollY + innerHeight) / document.documentElement.scrollHeight) }));
      seen.push(info); if (info.pop) break;
    }
    const opened = seen.find(s => s.pop); const st = await storage(page);
    await page.screenshot({ path: `${EV}/pb4-popup-${tag}.png` });
    let body = null; const variant = st.ls.ekuzo_nl_variant;
    if (opened) {
      const btn = page.getByRole("button", { name: /Send me the one email|Join the weekly/ }).first(); const form = btn.locator("xpath=ancestor::form[1]");
      await form.locator("input[type=email]").fill("team+gstest-1012-sentry@ekuzo.gg"); await btn.click(); await page.waitForTimeout(1500); body = ctx.qaCalls.posts.find(p => p.key === "newsletter")?.body;
    }
    await page.waitForTimeout(3000); const s1 = await page.locator(S1).count();
    const imp = events(ctx).filter(e => e.name === "newsletter_impression").map(e => e.params);
    rec(`PB-4 popup ${tag}`, vp, !!opened && opened.pct >= 50 && seen.slice(0, -1).every(s => !s.pop) && !!variant && body?.utm_source === "blog" && body?.utm_medium === "popup" && body?.utm_campaign === variant && s1 === 0 && imp.length === 1, `scroll samples (pct of page seen at bottom edge)=${JSON.stringify(seen)}; opened at ${opened ? opened.pct + "%" : "never"}; ekuzo_nl_variant=${variant}; body=${JSON.stringify(body)}; S1 popup=${s1}; newsletter_impression=${JSON.stringify(imp)}; all events=${JSON.stringify(events(ctx).map(e => e.name))}`);
    save(`json/pb4-popup-${tag}.json`, { body, st, seen, events: events(ctx) }); await ctx.close();
  }
}
// Nav sentinel via DOM
{ const ctx = await mk(browser, "pb4-nav", { vp: "1440", suppressPopup: true }); const page = await ctx.newPage(); await page.goto(BASE + "/", { waitUntil: "load" }); await page.waitForTimeout(1500);
  const n = await page.evaluate(() => ({ join: /Join Season 01/.test(document.body.innerText), enroll: /Enroll my gamer/.test(document.body.innerText) })); rec("PB-7 nav sentinel (DOM)", "1440", !n.join && n.enroll, JSON.stringify(n)); await ctx.close(); }
await browser.close(); save("results-pb4.json", R);
