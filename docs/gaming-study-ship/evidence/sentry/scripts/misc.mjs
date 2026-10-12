import fs from "node:fs";
import { launchGuarded, mk, closeCtx, BASE, POST, S1, storage, events, evCount, fbqTrack, save, center, sleep, EV } from "./sentry-lib.mjs";
const R = []; const rec = (id, vp, pass, notes, extra) => { R.push({ id, vp, pass, notes, ...(extra ? { extra } : {}) }); console.log(pass ? "PASS" : "FAIL", id, vp, notes.slice(0, 700)); };
const browser = await launchGuarded();
const AXE = "/Users/jamiefitch/Projects/ekuzo-web/.claude/worktrees/gaming-study-ship/node_modules/axe-core/axe.min.js";
// NR-5
async function contact(vp, path, how) {
  const ctx = await mk(browser, `nr5-${vp}`, { vp, suppressPopup: true }); const page = await ctx.newPage(); await page.goto(BASE + path, { waitUntil: "load" }); await page.waitForTimeout(1200);
  const triggers = await page.evaluate(() => [...document.querySelectorAll("button,a")].filter(e => /Talk to Humans|Start a conversation/i.test(e.textContent)).map(e => ({ t: e.textContent.trim(), vis: !!(e.offsetWidth || e.offsetHeight) })));
  if (how === "menu") { await page.getByRole("button", { name: "Toggle menu" }).click(); await page.waitForTimeout(500); await page.getByRole("button", { name: /Talk to Humans/ }).click(); }
  else await page.getByRole("button", { name: /Start a conversation|Talk to Humans/ }).first().click();
  await page.waitForSelector("#contact-heard-about", { timeout: 4000 }).catch(() => {});
  const sel = await page.locator("#contact-heard-about").count();
  if (!sel) { rec("NR-5", vp, false, `select not found on ${path}; triggers=${JSON.stringify(triggers)}`); await ctx.close(); return; }
  const opts = await page.locator("#contact-heard-about option").evaluateAll(os => os.map(o => [o.value, o.textContent]));
  await page.locator('input[name="name"]').fill("QA Sentry Test"); await page.locator('input[name="organization"]').fill("QA Test Org").catch(() => {});
  await page.locator('input[name="email"]').fill("team+gstest-1012-sentry@ekuzo.gg"); await page.locator('textarea[name="message"]').fill("QA test only. Intercepted in browser, never sent.");
  const pick = opts.find(o => o[0])[0]; await page.locator("#contact-heard-about").selectOption(pick); await page.screenshot({ path: `${EV}/nr5-contact-modal-${vp}.png` });
  await page.locator('form button[type=submit]').last().click(); await page.waitForTimeout(1500);
  const b = ctx.qaCalls.posts.find(p => p.key === "contact")?.body;
  rec(`NR-5${how === "menu" ? "" : " (alt page " + path + ")"}`, vp, !!b && b.heardAbout === pick, `opened from ${path} via ${how}; label present=${await page.getByText("How did you hear about us?").count() > 0}; select options=${JSON.stringify(opts)}; chosen=${pick}; intercepted /api/contact body=${JSON.stringify(b)}; triggers seen on page=${JSON.stringify(triggers)}; Lead events after contact success (intercepted, existing behavior)=${evCount(ctx, "generate_lead")}`, { b, opts });
  save(`json/nr5-${vp}-${path.replace(/\W/g, "_")}.json`, { b, opts, triggers });
  await ctx.close();
}
await contact("375", POST, "menu");
{ const ctx = await mk(browser, "nr5-desktop-probe", { vp: "1440", suppressPopup: true }); const page = await ctx.newPage(); await page.goto(BASE + POST, { waitUntil: "load" }); await page.waitForTimeout(1000);
  const t = await page.evaluate(() => [...document.querySelectorAll("button,a")].filter(e => /Talk to Humans|Start a conversation/i.test(e.textContent)).map(e => [e.textContent.trim(), !!(e.offsetWidth || e.offsetHeight)]));
  rec("NR-5 desktop trigger probe", "1440", true, `contact triggers on the post at 1440 in Season 01 mode: ${JSON.stringify(t)} (informational)`); await ctx.close(); }
await contact("1440", "/methodology", "button");
// TG-4
const tg4 = [];
for (const vp of ["1440", "1024", "768", "375"]) {
  const ctx = await mk(browser, `tg4-${vp}`, { vp }); const page = await ctx.newPage(); await page.goto(BASE + POST, { waitUntil: "load" });
  await page.waitForTimeout(4500); try { await dismissOrNot(page); } catch {} 
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); }); await page.waitForTimeout(1200);
  const isV = t => /ERR_BLOCKED_BY_CLIENT|googletagmanager|facebook\.net|clarity\.ms/.test(t);
  const own = ctx.qaRec.consoleErrors.filter(e => !isV(e.text) && !isV(e.loc || "")); const vend = ctx.qaRec.consoleErrors.length - own.length;
  tg4.push({ vp, own, pageErrors: ctx.qaRec.pageErrors, http: ctx.qaRec.failed404, vendorBlocked: vend });
  await ctx.close();
}
async function dismissOrNot(page) { if (await page.locator(S1).count()) await page.locator(S1 + ' button[aria-label="Close"]').click(); }
rec("TG-4", "all", tg4.every(t => t.own.filter(e => !/torn%20paper/.test(e.text + e.loc)).length === 0 && t.pageErrors.length === 0), tg4.map(t => `${t.vp}: own console errors=${t.own.length}, pageerrors=${t.pageErrors.length}, local http>=400=${JSON.stringify(t.http.map(h => h.status + " " + h.url.replace(BASE, "")))}, vendor blocked=${t.vendorBlocked}`).join(" | "), { tg4 });
save("json/tg4.json", tg4);
// TG-9 axe
for (const [tag, path] of [["post", POST], ["fortnite", "/blog/should-you-ban-fortnite"]]) for (const vp of ["1440", "375"]) {
  const ctx = await mk(browser, `axe-${tag}-${vp}`, { vp, suppressPopup: true }); const page = await ctx.newPage(); await page.goto(BASE + path, { waitUntil: "load" }); await page.waitForTimeout(2500);
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 100)); } scrollTo(0, 0); }); await page.waitForTimeout(800);
  await page.addScriptTag({ path: AXE });
  const res = await page.evaluate(async () => { const r = await axe.run(document, { resultTypes: ["violations"] }); return { version: axe.version, violations: r.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map(n => ({ target: n.target, html: n.html.slice(0, 160), summary: n.failureSummary?.slice(0, 200) })) })) }; });
  save(`json/axe-${tag}-${vp}.json`, res); fs.writeFileSync(`${EV}/json/axe-${tag}-${vp}.summary.txt`, res.violations.map(v => `${v.impact} ${v.id}: ${v.nodes.length} nodes: ${v.help}`).join("\n") + "\n");
  console.log(`axe ${tag} ${vp}:`, res.violations.map(v => `${v.impact}:${v.id}(${v.nodes.length})`).join(", ") || "none");
  await ctx.close();
}
await browser.close(); save("results-misc.json", R);
