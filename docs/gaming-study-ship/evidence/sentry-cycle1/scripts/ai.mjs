import { launchGuarded, mk, closeCtx, BASE, POST, events, evCount, storage, save, sleep } from "./sentry-lib.mjs";
const R = []; const rec = (id, vp, pass, notes, extra) => { R.push({ id, vp, pass, notes, ...(extra ? { extra } : {}) }); console.log(pass ? "PASS" : "FAIL", id, vp, notes.slice(0, 500)); };
const browser = await launchGuarded();
const ai = (ctx) => events(ctx).filter(e => e.name === "ai_referral");
async function waitAi(ctx, ms = 9000) { const t = Date.now(); while (Date.now() - t < ms) { if (ai(ctx).length) return; await sleep(200); } }
const positives = [["https://chatgpt.com/", "ai_chatgpt", "chatgpt.com"], ["https://claude.ai/", "ai_claude", "claude.ai"], ["https://www.perplexity.ai/", "ai_perplexity", "www.perplexity.ai"]];
for (const vp of ["1440", "375"]) for (const [ref, origin, host] of positives) {
  const ctx = await mk(browser, `ai-${origin}-${vp}`, { vp, suppressPopup: true }); const page = await ctx.newPage();
  await page.goto(BASE + POST, { referer: ref, waitUntil: "load" }); await waitAi(ctx); await page.waitForTimeout(1500);
  const first = ai(ctx).map(e => e.params); const docRef = await page.evaluate(() => document.referrer);
  const ck = (await ctx.cookies()).find(c => c.name === "ekuzo_origin")?.value; const ss = (await storage(page)).ss.ekuzo_ai_referral;
  await page.reload({ waitUntil: "load" }); await page.waitForTimeout(4000); const afterReload = ai(ctx).length;
  // client navigation
  const link = page.locator('header a[href="/blog"], nav a[href="/blog"]').first();
  if (await link.count() && await link.isVisible()) await link.click(); else await page.evaluate(() => { const a = document.querySelector('a[href="/blog"]'); a && a.click(); });
  await page.waitForURL("**/blog", { timeout: 6000 }).catch(() => {}); await page.waitForTimeout(3500); const afterNav = ai(ctx).length; const navUrl = page.url();
  await page.goBack({ waitUntil: "load" }).catch(() => {}); await page.waitForTimeout(3500); const afterBack = ai(ctx).length;
  const ok = first.length === 1 && first[0].origin === origin && first[0].referrer_host === host && first[0].detected_via === "referrer" && first[0].landing_path === POST && afterReload === 1 && afterNav === 1 && afterBack === 1;
  rec(`JR-3/MN-6 ${origin}`, vp, ok, `referer=${ref} document.referrer=${docRef}; first beacon params=${JSON.stringify(first)}; ekuzo_origin cookie=${ck}; sessionStorage key=${ss}; ai_referral count after reload=${afterReload}, after client nav to ${navUrl}=${afterNav}, after back=${afterBack}`, { first });
  save(`json/ai-${origin}-${vp}.json`, { first, docRef, ck, ss, afterReload, afterNav, afterBack, allEvents: events(ctx) });
  await ctx.close();
}
const negatives = [["https://www.google.com/", null], [null, null], ["https://x.com/", null], ["https://t.co/", null], ["https://www.facebook.com/", null], ["https://duckduckgo.com/", null], ["https://www.bing.com/", null]];
for (const [ref] of negatives) {
  const ctx = await mk(browser, `ai-neg`, { vp: "1440", suppressPopup: true }); const page = await ctx.newPage();
  await page.goto(BASE + POST, ref ? { referer: ref, waitUntil: "load" } : { waitUntil: "load" }); await page.waitForTimeout(5000);
  const ck = (await ctx.cookies()).find(c => c.name === "ekuzo_origin")?.value; const ss = (await storage(page)).ss.ekuzo_ai_referral;
  rec(`MN-6 negative referer=${ref || "none"}`, "1440", ai(ctx).length === 0 && !ss, `ai_referral count=${ai(ctx).length}; ekuzo_origin cookie=${ck}; session key=${ss || "absent"}`);
  await ctx.close();
}
for (const [label, url, ref] of [["utm_source=x (JR-1 URL), no referer", POST + "?utm_source=x&utm_medium=social", null], ["EXTRA utm_source=chatgpt.com no referer (expected fire via utm)", POST + "?utm_source=chatgpt.com", null], ["INFO lookalike referer chatgpt.com.example", POST, "https://chatgpt.com.example/"], ["INFO lookalike referer notclaude.ai", POST, "https://notclaude.ai/"]]) {
  const ctx = await mk(browser, "ai-extra", { vp: "1440", suppressPopup: true }); const page = await ctx.newPage();
  await page.goto(BASE + url, ref ? { referer: ref, waitUntil: "load" } : { waitUntil: "load" }); await page.waitForTimeout(5500);
  const n = ai(ctx).length; const exp = label.startsWith("EXTRA") ? 1 : 0;
  const info = label.startsWith("INFO");
  rec(`MN-6 ${label}`, "1440", info ? true : n === exp, `ai_referral count=${n} params=${JSON.stringify(ai(ctx).map(e => e.params))}${info ? " (informational: ai-lookalike hosts " + (n ? "DO" : "do not") + " fire)" : ""}`, { n });
  await ctx.close();
}
await browser.close(); save("results-ai.json", R);
