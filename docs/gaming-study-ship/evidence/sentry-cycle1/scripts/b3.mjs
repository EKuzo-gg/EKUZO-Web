import { launchGuarded, mk, BASE, POST, S1, sleep } from "./sentry-lib.mjs";
const browser = await launchGuarded();
const ctx = await mk(browser, "b-hang3", { vp: "1440" }); const page = await ctx.newPage(); const t0 = { v: 0 }; const log = [];
page.on("requestfailed", r => { if (r.url().includes("season-one")) log.push(`${Math.round((Date.now() - t0.v) / 1000)}s requestfailed ${r.failure()?.errorText}`); });
await ctx.route(/\/api\/season-one/, async (route) => { if (route.request().method() !== "POST") return route.continue(); log.push(`${Math.round((Date.now() - t0.v) / 1000)}s request received, holding 30s`); await sleep(30000); await route.abort("timedout").catch(() => {}); });
await page.goto(BASE + POST); await page.waitForSelector(S1); await page.locator(S1 + " input[type=email]").fill("team+gstest-1012-sentry@ekuzo.gg");
t0.v = Date.now(); await page.locator(S1 + " button[type=submit]").click();
for (let i = 0; i < 18; i++) { await sleep(2000); const s = await page.evaluate(() => ({ btn: document.querySelector('[role=dialog] button[type=submit]')?.textContent, dis: document.querySelector('[role=dialog] button[type=submit]')?.disabled, err: document.querySelector("#s1-err")?.textContent || "" })); log.push(`${Math.round((Date.now() - t0.v) / 1000)}s ${JSON.stringify(s)}`); }
console.log(log.join("\n")); await browser.close();
