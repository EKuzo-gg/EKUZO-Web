// Sentry Phase 4: P4 - blog popup trigger cadence.
import { AFTER, BLOG_POST, withPage, shot, makeRecorder, log } from "./sentry-common.mjs";

const { ok, summary } = makeRecorder();

async function dialogCount(page) {
  return page.locator('[role="dialog"]').count();
}

async function main() {
  // Fresh context, load post, wait 5s at top: no dialog.
  // Then scroll to 50%: dialog appears within 1s.
  // Then reload: no dialog (dismissed timestamp not set yet, but no
  // dismissal happened either -- reload without re-scrolling should show
  // no dialog because the page starts scrolled to top again).
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.goto(`${AFTER}${BLOG_POST}`);
    await page.waitForTimeout(5000);
    ok("P4: no dialog after 5s at top of a fresh context", (await dialogCount(page)) === 0);

    const t0 = Date.now();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.5));
    await page.waitForSelector('[role="dialog"]', { timeout: 1000 }).catch(() => {});
    const elapsed = Date.now() - t0;
    const count = await dialogCount(page);
    ok("P4: dialog appears within 1s of reaching 50% scroll", count > 0 && elapsed <= 1500, `count=${count} elapsed=${elapsed}ms`);
    await shot(page, "sentry-p4-popup-at-50pct");

    // Dismiss it via close button so we can test the reload-without-dismiss
    // case cleanly using recordDismiss's own semantics: actually the spec
    // says "Reload: no dialog (dismissed timestamp stored)" -- meaning the
    // reader must dismiss it first for the dismissed timestamp to exist.
    await page.locator('[role="dialog"] button[aria-label="Close"]').click();
    await page.waitForTimeout(200);
    ok("P4: dialog closes after clicking X", (await dialogCount(page)) === 0);

    await page.reload();
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.6));
    await page.waitForTimeout(1000);
    ok("P4: reload after dismiss shows no dialog even after scrolling to 50%+", (await dialogCount(page)) === 0);

    // Set stored dismissed timestamp to 31 days ago; reload and scroll: dialog appears again.
    const THIRTY_ONE_DAYS_MS = 31 * 24 * 60 * 60 * 1000;
    await page.evaluate((ms) => {
      window.localStorage.setItem("ekuzo_nl_blog_dismissed_at", String(Date.now() - ms));
    }, THIRTY_ONE_DAYS_MS);
    await page.reload();
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.6));
    await page.waitForTimeout(1000);
    ok("P4: dismissed_at set to 31 days ago -> dialog appears again on reload+scroll", (await dialogCount(page)) > 0);
    await shot(page, "sentry-p4-popup-after-31-days");
  });

  // /blog (index), / , and /blog/author/karlin-oei: scrolled to bottom, no dialog, ever.
  for (const route of ["/blog", "/", "/blog/author/karlin-oei"]) {
    await withPage({ width: 1440, height: 900 }, async (page) => {
      await page.goto(`${AFTER}${route}`);
      await page.waitForTimeout(500);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(1500);
      const count = await dialogCount(page);
      ok(`P4: no dialog on ${route} even scrolled to bottom`, count === 0, `dialog count=${count}`);
    });
  }

  const s = summary();
  process.exit(s.fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
