import { launchGuarded, mk, BASE, POST } from "./sentry-lib.mjs";
const browser = await launchGuarded(); const out = [];
for (const path of [POST, "/", "/faq"]) {
  const ctx = await mk(browser, "b-footer768", { vp: "768", suppressPopup: true }); const page = await ctx.newPage(); await page.goto(BASE + path, { waitUntil: "load" }); await page.waitForTimeout(800);
  const r = await page.evaluate(() => { const f = [...document.querySelectorAll("form")].find(f => /Sign up/i.test(f.textContent) || f.querySelector('input[type=email]')); if (!f) return null; f.scrollIntoView({ block: "center" }); const b = f.getBoundingClientRect(); const btn = f.querySelector("button"); const bb = btn.getBoundingClientRect(); return { formRight: Math.round(b.right), btnRight: Math.round(bb.right), iw: innerWidth, btnVisible: bb.right <= innerWidth + 1 }; });
  out.push(path + " " + JSON.stringify(r));
  if (path === POST) { await page.waitForTimeout(400); await page.screenshot({ path: "/Users/jamiefitch/Projects/ekuzo-web/.claude/worktrees/gaming-study-ship/docs/gaming-study-ship/evidence/sentry-cycle1/footer-768.png" }); }
  await ctx.close();
}
console.log(out.join("\n")); await browser.close();
