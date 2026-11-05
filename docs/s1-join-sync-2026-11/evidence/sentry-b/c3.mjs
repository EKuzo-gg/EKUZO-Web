import { chromium, newCtx, stats } from "./common.mjs";
import fs from "fs";
const B = "http://localhost:3110";
const b = await chromium.launch();
const results = {};
const ck = (name, ok, detail) => { results[name] = { pass: !!ok, detail }; console.log(ok ? "PASS" : "FAIL", name, JSON.stringify(detail)); };
async function mk(mode = ["ok"], delay = 0) {
  const ctx = await newCtx(b, { viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage(); const posts = []; const st = { mode, idx: 0, delay };
  await page.route("**/api/season-one", async (route) => {
    const req = route.request(); if (req.method() !== "POST") return route.fulfill({ status: 405, body: "" });
    posts.push(JSON.parse(req.postData() || "{}"));
    const m = st.mode[Math.min(st.idx++, st.mode.length - 1)];
    if (st.delay) await new Promise((r) => setTimeout(r, st.delay));
    if (m === "abort") return route.abort("failed");
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(m === "repeat" ? { ok: true, repeat: true } : { ok: true }) });
  });
  return { ctx, page, posts, st };
}
const rec = (p) => p.evaluate(() => ({ ...window.__rec, ls: localStorage.getItem("ekuzo_s1_joined") }));
const lead = (r) => ({ fbq: r.fbq.filter((a) => a[1] === "Lead").length, gtag: r.gtag.filter((a) => a[1] === "generate_lead").length, clarity: r.clarity.filter((a) => a[1] === "event" && /lead|signup/.test(a[2])).length });
const popupInput = (p) => p.locator('[role="dialog"] input[type=email]');
// 3a auto popup timing
{ const { ctx, page } = await mk(); await page.goto(B + "/blog", { waitUntil: "load" });
  const t0 = Date.now();
  const early = await page.locator('[role="dialog"]').count();
  await popupInput(page).waitFor({ timeout: 8000 });
  ck("3a auto popup opens on /blog (mode on, delay 2.5 s)", early === 0, { earlyDialogs: early, openedAfterMs: Date.now() - t0 });
  // 3b repeat
  await page.route("**/api/season-one", async (r) => r.fallback());
  await popupInput(page).fill("qa-pop-rep@example.com");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1200);
  await ctx.close(); }
// repeat flow
{ const { ctx, page, posts } = await mk(["repeat"]); await page.goto(B + "/blog", { waitUntil: "load" });
  await popupInput(page).waitFor({ timeout: 8000 });
  await popupInput(page).fill("qa-pop-rep@example.com"); await page.keyboard.press("Enter");
  await page.waitForTimeout(1500);
  const r = await rec(page); const l = lead(r);
  const txt = await page.locator('[role="dialog"]').innerText();
  ck("3b repeat in popup: no Lead call anywhere, flag set, done state", posts.length === 1 && l.fbq === 0 && l.gtag === 0 && l.clarity === 0 && r.ls === "1", { posts: posts.length, lead: l, ls: r.ls, dialog: txt.slice(0, 80).replace(/\n/g, " | ") });
  await ctx.close(); }
// control: new -> Lead pair
{ const { ctx, page, posts } = await mk(["ok"]); await page.goto(B + "/blog", { waitUntil: "load" });
  await popupInput(page).waitFor({ timeout: 8000 });
  await popupInput(page).fill("qa-pop-new@example.com"); await page.keyboard.press("Enter");
  await page.waitForTimeout(1500);
  const r = await rec(page); const l = lead(r); const f = r.fbq.filter((a) => a[1] === "Lead");
  ck("3c control: new in popup fires Lead pair with posted eventId", l.fbq === 1 && l.gtag === 1 && f[0][3]?.eventID === posts[0].eventId && r.ls === "1", { lead: l, fbq: f[0], posted: posts[0].eventId });
  await ctx.close(); }
// popup double tap + retry + different email
{ const { ctx, page, posts } = await mk(["abort", "ok", "ok"], 500); await page.goto(B + "/blog", { waitUntil: "load" });
  await popupInput(page).waitFor({ timeout: 8000 });
  await popupInput(page).fill("qa-p1@example.com");
  const sub = page.locator('[role="dialog"] button[type=submit]');
  await sub.dispatchEvent("click"); await sub.dispatchEvent("click"); await sub.dispatchEvent("click");
  await page.waitForTimeout(1500);
  ck("3d popup burst of 3 taps -> 1 POST", posts.length === 1, { posts: posts.length });
  await sub.click(); await page.waitForTimeout(1500);
  const r = await rec(page); const f = r.fbq.filter((a) => a[1] === "Lead");
  ck("3e popup retry same email: same eventId, one Lead, eventID matches", posts.length === 2 && posts[0].eventId === posts[1].eventId && f.length === 1 && f[0][3].eventID === posts[1].eventId, { ids: posts.map((p) => p.eventId), leads: f.length });
  await ctx.close(); }
{ const { ctx, page, posts } = await mk(["abort", "ok"]); await page.goto(B + "/blog", { waitUntil: "load" });
  await popupInput(page).waitFor({ timeout: 8000 });
  await popupInput(page).fill("qa-p2@example.com"); await page.keyboard.press("Enter"); await page.waitForTimeout(800);
  await popupInput(page).fill("qa-p3@example.com"); await page.keyboard.press("Enter"); await page.waitForTimeout(1200);
  const r = await rec(page); const f = r.fbq.filter((a) => a[1] === "Lead");
  ck("3f popup different email after failure: new eventId, own Lead", posts.length === 2 && posts[0].eventId !== posts[1].eventId && f.length === 1 && f[0][3].eventID === posts[1].eventId, { ids: posts.map((p) => p.eventId) });
  await ctx.close(); }
// ?join=season-one path
{ const { ctx, page, posts } = await mk(["repeat"]); await page.goto(B + "/blog?join=season-one", { waitUntil: "load" });
  const t0 = Date.now(); await popupInput(page).waitFor({ timeout: 8000 });
  ck("3g ?join=season-one opens immediately", Date.now() - t0 < 2300, { ms: Date.now() - t0 });
  await ctx.close(); }
// J2: landing sign-up then /blog => no auto popup
for (const mode of ["ok", "repeat"]) {
  const { ctx, page, posts } = await mk([mode]);
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(B + "/season1?ad=d19&utm_source=meta&utm_content=d19-qa", { waitUntil: "load" });
  await page.waitForFunction(() => document.getElementById("hero")?.children.length > 0, null, { timeout: 30000 });
  await page.waitForTimeout(800);
  await page.fill("#em-top", "qa-j2@example.com");
  await page.locator("#join-top form button").first().click({ noWaitAfter: true });
  await page.waitForFunction(() => !document.getElementById("conf").hidden, null, { timeout: 5000 });
  await page.goto(B + "/blog", { waitUntil: "load" });
  await page.waitForTimeout(5000);
  const dlg = await page.locator('[role="dialog"]').count(); const ls = await page.evaluate(() => localStorage.getItem("ekuzo_s1_joined"));
  ck(`j2 landing sign-up (${mode}) then /blog: no auto popup in 5 s, flag set`, dlg === 0 && ls === "1", { dialogs: dlg, ls });
  // control: clearing the flag shows it
  await page.evaluate(() => localStorage.removeItem("ekuzo_s1_joined")); await page.goto(B + "/blog", { waitUntil: "load" });
  const ok = await popupInput(page).waitFor({ timeout: 8000 }).then(() => true).catch(() => false);
  ck(`j2 control (${mode}): without the flag the popup does open`, ok, ok);
  await ctx.close();
}
await b.close();
console.log("blocked", stats.blocked);
fs.writeFileSync(process.argv[2], JSON.stringify({ blocked: stats.blocked, results }, null, 1));
