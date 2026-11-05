import { chromium, newCtx, stats, UA_IG } from "./common.mjs";
import fs from "fs";
const B = "http://localhost:3110"; const B4 = "http://localhost:3101"; const b = await chromium.launch(); const results = {};
const ck = (name, ok, detail) => { results[name] = { pass: !!ok, detail }; console.log(ok ? "PASS" : "FAIL", name, JSON.stringify(detail)); };
// J1
{ const ctx = await newCtx(b, { viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA_IG });
  const page = await ctx.newPage(); const posts = [];
  await page.route("**/api/season-one", async (r) => { if (r.request().method() === "POST") posts.push(JSON.parse(r.request().postData())); return r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }); });
  await page.goto(B + "/season1?ad=d19&utm_source=meta&utm_content=d19-qa", { waitUntil: "load" });
  await page.waitForFunction(() => document.getElementById("hero")?.children.length > 0, null, { timeout: 30000 });
  await page.waitForTimeout(800);
  await page.fill("#em-top", "qa-j1@example.com");
  await page.locator("#join-top form button").first().click({ noWaitAfter: true });
  await page.waitForFunction(() => !document.getElementById("conf").hidden, null, { timeout: 5000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "/home/claude/wt-build/docs/s1-join-sync-2026-11/screenshots/sentry-j1-375-confirmation-inapp.png" });
  await page.fill("#tk-form input[name=phone], #tk-form input", "5125550123");
  await page.locator("#tk-form button").click({ noWaitAfter: true });
  await page.waitForTimeout(1200);
  const tk = posts.find((p) => p.step === "text-karlin"); const main = posts.find((p) => !p.step);
  ck("j1 main sign-up body ad d19, attribution utm_content d19-qa, source ad-landing", main.ad === "d19" && main.attribution?.utm_content === "d19-qa" && main.source === "ad-landing", { ad: main.ad, utm: main.attribution, hero: main.hero });
  ck("j1 Text Karlin step POST carries ad:d19", tk && tk.ad === "d19" && tk.email === "qa-j1@example.com", tk && { ad: tk.ad, step: tk.step, hero: tk.hero, phoneShape: /^\+1\d{10}$/.test(tk.phone) });
  const done = await page.locator("#tk .tk-done").isVisible();
  ck("j1 Text Karlin done state visible", done, done);
  await ctx.close(); }
// J4
{ const ctx = await newCtx(b, { viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(B4 + "/season1/join?src=email&utm_source=klaviyo&utm_medium=email&utm_campaign=s1&utm_content=email-b", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  const url = page.url();
  const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
  const su = hrefs.filter((h) => h.includes("/season1/join/signup"));
  const allHave = su.length > 0 && su.every((h) => /[?&]src=email(&|$)/.test(h));
  ck("j4 address bar keeps src + UTMs after load", /src=email/.test(url) && /utm_content=email-b/.test(url) && /utm_source=klaviyo/.test(url), url);
  ck("j4 every sign-up CTA href carries src=email", allHave, { count: su.length, sample: [...new Set(su)] });
  const other = hrefs.filter((h) => /signup|register|checkout/.test(h) && !h.includes("/season1/join/signup"));
  console.log("other CTA-ish hrefs", [...new Set(other)]);
  // follow first CTA
  const href = su[0]; const resp = await page.goto(B4 + href, { waitUntil: "load" });
  ck("j4 signup page loads 200", resp.status() === 200, { status: resp.status(), url: page.url() });
  const hp = await page.evaluate(() => ({ named: document.querySelector('input[name="ekz_hp"]') ? "ekz_hp" : (document.querySelector('input[name="company"]') ? "company" : "none") }));
  ck("j4 signup honeypot field is ekz_hp (hotfix present)", hp.named === "ekz_hp", hp);
  // src whitelist: junk dropped
  await page.goto(B4 + "/season1/join?src=evil%22%3E&utm_content=x", { waitUntil: "load" });
  const h2 = await page.$$eval("a[href*='/season1/join/signup']", (as) => as.map((a) => a.getAttribute("href")));
  ck("j4b non-whitelisted src dropped from CTA", h2.length > 0 && h2.every((h) => !/src=/.test(h)), [...new Set(h2)].slice(0, 3));
  await ctx.close(); }
await b.close(); console.log("blocked", stats.blocked);
fs.writeFileSync(process.argv[2], JSON.stringify({ blocked: stats.blocked, results }, null, 1));
