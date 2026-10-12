import fs from "node:fs";
import { startProxy, LOG } from "./proxy.mjs";
import { launchGuarded, newCtx, closeCtx, BASE, POST } from "./lib.mjs";
fs.writeFileSync(LOG, "");
const srv = startProxy();
const browser = await launchGuarded();
const S1 = "[role=dialog]";
const runs = [
  { id: "JR-1", url: BASE + POST + "?utm_source=x&utm_medium=social&utm_campaign=gaming-study&utm_content=karlin", email: "team+gstest-1012-jr1@ekuzo.gg" },
  { id: "JR-2", url: BASE + POST, email: "team+gstest-1012-jr2@ekuzo.gg" },
];
const out = [];
for (const r of runs) {
  const ctx = await newCtx(browser, r.id, { vp: "1440", suppressPopup: false });
  const page = await ctx.newPage();
  const posts = [];
  page.on("request", (q) => { if (q.url().includes("/api/season-one")) posts.push({ at: new Date().toISOString(), method: q.method(), body: q.postData() }); });
  page.on("response", async (s) => { if (s.url().includes("/api/season-one")) { const p = posts[posts.length - 1]; if (p) { p.status = s.status(); p.resp = await s.text().catch(() => ""); } } });
  await page.goto(r.url, { waitUntil: "load" });
  await page.waitForSelector(S1, { timeout: 9000 });
  await page.waitForTimeout(500);
  await page.locator(S1 + " input[type=email]").fill(r.email);
  await page.locator(S1 + " button[type=submit]").click();
  let done = false;
  try { await page.waitForSelector(S1 + " [role=group]", { timeout: 8000 }); done = true; } catch {}
  await page.waitForTimeout(800);
  out.push({ id: r.id, email: r.email, url: r.url, confirmation: done, posts, external: ctx.qaRec.external.length, consoleErrors: ctx.qaRec.consoleErrors });
  console.log(r.id, "confirmation", done, JSON.stringify(posts));
  await closeCtx(ctx);
  if (!done || posts.some(p => p.status !== 200)) { console.log("STOP: not clean"); break; }
}
await browser.close(); srv.close();
fs.writeFileSync("kvproof-result.json", JSON.stringify(out, null, 2));
