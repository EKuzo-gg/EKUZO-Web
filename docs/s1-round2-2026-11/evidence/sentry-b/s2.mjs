import { chromium, newCtx, STUBS, mobile, AFTER, stats } from "./lib.mjs";
import fs from "fs";
const TXT = "We couldn't save this one from here. Text our founder at (832) 271-0150 and we'll add you by hand.";
const browser = await chromium.launch();
const R = [];
const log = (name, ok, detail) => { R.push({ name, ok, detail }); console.log(ok ? "PASS" : "FAIL", name, detail || ""); };
async function open(url, stub) {
  const ctx = await newCtx(browser, mobile);
  await ctx.addInitScript(STUBS);
  const page = await ctx.newPage();
  const posts = [];
  await page.route("**/api/season-one", async (route) => {
    const req = route.request();
    if (req.method() !== "POST") return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    let body = {}; try { body = JSON.parse(req.postData() || "{}"); } catch (_) {}
    posts.push(body);
    const s = typeof stub === "function" ? stub(body, posts.length) : stub;
    return route.fulfill({ status: s.status || 200, contentType: "application/json", body: JSON.stringify(s.body) });
  });
  await page.goto(url, { waitUntil: "load" });
  return { ctx, page, posts };
}
const calls = (p) => p.evaluate(() => window.__calls);
const isLead = (c) => (c[0] === "fbq" && c[1][0] === "track" && c[1][1] === "Lead") || (c[0] === "gtag" && c[1][1] === "generate_lead") || (c[0] === "clarity" && c[1][0] === "event" && (c[1][1] === "signup" || c[1][1] === "generate_lead"));
const EM = "qa.sentry+one@example.com";

// ---------- Landing ----------
for (const [label, stub, mode] of [
  ["landing control {ok:true} (Lead expected)", { body: { ok: true } }, "new"],
  ["landing quiet {ok:true,quiet:true}", { body: { ok: true, quiet: true } }, "quiet"],
  ["landing repeat {ok:true,repeat:true}", { body: { ok: true, repeat: true } }, "quiet"],
  ["landing 429", { status: 429, body: { ok: false, error: TXT } }, "429"],
]) {
  const { ctx, page, posts } = await open(`${AFTER}/season1?ad=d2&hero=none&utm_source=meta`, stub);
  await page.fill("#join-top input[name=email]", EM);
  await page.click("#join-top button[type=submit]");
  await page.waitForTimeout(mode === "429" ? 5000 : 2500);
  const c = await calls(page), leads = c.filter(isLead);
  const joined = await page.evaluate(() => localStorage.getItem("ekuzo_s1_joined"));
  const confVisible = await page.evaluate(() => !document.getElementById("conf").hidden);
  if (mode === "new") log(label, leads.length >= 3 && posts.length === 1, `leads=${leads.length} calls=${JSON.stringify(leads.map((x) => x[0] + ":" + x[1].slice(0, 2).join("/")))} posts=${posts.length} joined=${joined}`);
  else if (mode === "quiet") log(label, leads.length === 0 && confVisible && joined === "1" && posts.length === 1, `leads=${leads.length} conf=${confVisible} joined=${joined} posts=${posts.length}`);
  else {
    const err = await page.textContent("#join-top .err"), errHidden = await page.evaluate(() => document.querySelector("#join-top .err").hidden);
    const btn = await page.evaluate(() => { const b = document.querySelector("#join-top button[type=submit]"); return [b.disabled, b.textContent]; });
    log(label, err === TXT && !errHidden && btn[0] === false && posts.length === 1 && !confVisible && joined === null && leads.length === 0, `err=${JSON.stringify(err)} hidden=${errHidden} btn=${JSON.stringify(btn)} posts=${posts.length} conf=${confVisible} joined=${joined} leads=${leads.length}`);
    await page.screenshot({ path: "/home/claude/wt-build/docs/s1-round2-2026-11/screenshots/sentry-b-landing-429.png" });
  }
  await ctx.close();
}
// ---------- Landing steps: games hero, then text-karlin ----------
{
  const { ctx, page, posts } = await open(`${AFTER}/season1?ad=d2&hero=games&utm_source=meta`, { body: { ok: true } });
  await page.click(".ih-opt:has-text('Fortnite')");
  await page.waitForTimeout(600);
  await page.fill("#em-top", EM);
  await page.click("#join-top button[type=submit]");
  await page.waitForSelector("#tk-form", { state: "visible", timeout: 8000 });
  await page.waitForTimeout(1200);
  const signup = posts.find((p) => !p.step), games = posts.find((p) => p.step === "games");
  log("steps: games POST carries sign-up eventId+email", !!signup && !!games && games.eventId === signup.eventId && games.email === EM && !!signup.eventId, JSON.stringify({ signupId: signup?.eventId, games }));
  await page.fill("#tk-form input[name=phone]", "5125550142");
  await page.click("#tk-form button");
  await page.waitForTimeout(1500);
  const tk = posts.find((p) => p.step === "text-karlin");
  log("steps: text-karlin POST carries sign-up eventId+email", !!tk && tk.eventId === signup.eventId && tk.email === EM, JSON.stringify(tk ? { ...tk, phone: "(redacted)" } : null));
  log("steps: total POSTs = signup + games + text-karlin", posts.length === 3, `posts=${posts.length}`);
  await ctx.close();
}
// text-karlin on a default hero (no games)
{
  const { ctx, page, posts } = await open(`${AFTER}/season1?ad=d4&hero=none&utm_source=meta`, { body: { ok: true } });
  await page.fill("#join-top input[name=email]", EM); await page.click("#join-top button[type=submit]");
  await page.waitForSelector("#tk-form", { state: "visible", timeout: 8000 });
  await page.fill("#tk-form input[name=phone]", "5125550142"); await page.click("#tk-form button"); await page.waitForTimeout(1200);
  const su = posts.find((p) => !p.step), tk = posts.find((p) => p.step === "text-karlin");
  log("steps: text-karlin (default hero) eventId+email", !!tk && tk.eventId === su.eventId && tk.email === EM, `posts=${posts.length}`);
  await ctx.close();
}
// ---------- Popup ----------
async function popupSubmit(page) {
  await page.waitForSelector("#s1-email", { timeout: 10000 });
  await page.fill("#s1-email", EM);
  await page.click("[role=dialog] form button[type=submit]");
}
for (const [label, stub, mode] of [
  ["popup control {ok:true} (Lead expected)", { body: { ok: true } }, "new"],
  ["popup quiet {ok:true,quiet:true}", { body: { ok: true, quiet: true } }, "quiet"],
  ["popup 429", { status: 429, body: { ok: false, error: TXT } }, "429"],
]) {
  const { ctx, page, posts } = await open(`${AFTER}/blog?join=season-one`, stub);
  await popupSubmit(page);
  await page.waitForTimeout(mode === "429" ? 5000 : 2000);
  const c = await calls(page), leads = c.filter(isLead);
  const joined = await page.evaluate(() => localStorage.getItem("ekuzo_s1_joined"));
  const done = await page.locator("text=Keep looking around").count();
  if (mode === "new") log(label, leads.length >= 2 && posts.length === 1, `leads=${JSON.stringify(leads.map((x) => x[0] + ":" + x[1].slice(0, 2).join("/")))} posts=${posts.length} joined=${joined}`);
  else if (mode === "quiet") { log(label, leads.length === 0 && done === 1 && joined === "1" && posts.length === 1, `leads=${leads.length} done=${done} joined=${joined} posts=${posts.length}`);
    // games step from popup
    const chip = page.locator("[role=group] button").first(); await chip.click(); await page.waitForTimeout(1800);
    const su = posts.find((p) => !p.step), g = posts.find((p) => p.step === "games");
    log("popup step games carries sign-up eventId+email", !!g && g.eventId === su.eventId && g.email === EM, JSON.stringify(g));
  } else {
    const err = await page.locator("#s1-err").textContent().catch(() => null);
    const btn = await page.evaluate(() => { const b = document.querySelector("[role=dialog] form button[type=submit]"); return b ? [b.disabled, b.textContent] : null; });
    log(label, err === TXT && btn && btn[0] === false && posts.length === 1 && done === 0 && joined === null && leads.length === 0, `err=${JSON.stringify(err)} btn=${JSON.stringify(btn)} posts=${posts.length} joined=${joined} leads=${leads.length}`);
    await page.screenshot({ path: "/home/claude/wt-build/docs/s1-round2-2026-11/screenshots/sentry-b-popup-429.png" });
  }
  await ctx.close();
}
fs.writeFileSync("s2.json", JSON.stringify({ R, blocked: stats.blocked }, null, 1));
await browser.close();
