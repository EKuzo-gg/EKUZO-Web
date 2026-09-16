import { AFTER, BLOG_POST, withPage, log } from "./sentry-common.mjs";

await withPage({ width: 375, height: 812 }, async (page) => {
  page.on("console", (msg) => log("[console]", msg.type(), msg.text()));
  await page.goto(`${AFTER}${BLOG_POST}`);
  await page.evaluate(() => {
    const link = document.querySelector("a") || document.body;
    link.setAttribute("data-sentry-focus-anchor", "1");
    link.tabIndex = link.tabIndex ?? 0;
    link.focus();
  });

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.55));
  await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
  const count0 = await page.locator('[role="dialog"]').count();
  log("count right after open:", count0);

  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
  }
  const count1 = await page.locator('[role="dialog"]').count();
  log("count after 12 tabs:", count1);

  await page.evaluate(() => {
    const dlgs = document.querySelectorAll('[role="dialog"]');
    const focusables = Array.from(
      dlgs[0].querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter((el) => el.offsetParent !== null);
    focusables[focusables.length - 1].focus();
  });
  await page.keyboard.press("Tab");
  const count2 = await page.locator('[role="dialog"]').count();
  log("count after forward-wrap tab:", count2);

  await page.evaluate(() => {
    const dlgs = document.querySelectorAll('[role="dialog"]');
    const focusables = Array.from(
      dlgs[0].querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter((el) => el.offsetParent !== null);
    focusables[0].focus();
  });
  await page.keyboard.press("Shift+Tab");
  const count3 = await page.locator('[role="dialog"]').count();
  log("count after backward-wrap shift+tab:", count3);

  const htmls = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[role="dialog"]')).map((d) => d.outerHTML.slice(0, 300))
  );
  htmls.forEach((h, i) => log(`dialog[${i}]:`, h));
});
