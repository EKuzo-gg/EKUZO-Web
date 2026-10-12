import { launchGuarded, mk, BASE, POST } from "./sentry-lib.mjs";
const OUT = "/Users/jamiefitch/Projects/ekuzo-web/.claude/worktrees/gaming-study-ship/docs/gaming-study-ship/screenshots";
const browser = await launchGuarded(); const ctx = await mk(browser, "fixblog", { vp: "375", suppressPopup: true }); const page = await ctx.newPage();
await page.goto(BASE + "/blog", { waitUntil: "load" }); await page.waitForTimeout(1500);
const bottom = await page.evaluate((P) => { const a = document.querySelector(`a[href="${P}"]`); a.scrollIntoView(); scrollTo(0, 0); document.querySelectorAll("div.fixed.bottom-0").forEach(d => d.style.display = "none"); return Math.round(a.getBoundingClientRect().bottom + scrollY); }, POST);
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/blog-375-top.png`, fullPage: true, clip: { x: 0, y: 0, width: 375, height: bottom + 24 } });
console.log("blog-375-top clip height", bottom + 24, "(sticky bar hidden for this capture)"); await browser.close();
