// Sentry Phase 5 retest, repair cycle 2: confirm site mode is untouched.
// (a) source diff: every new class/branch in NewsletterPopup.tsx is gated
//     by isBlogPost or mode, and the site-mode JSX branch is byte-for-byte
//     the same content as the before tree (see sentry-output-cycle3-sitemode-diff.txt).
// (b) behavioral re-check on the current build: homepage popup (mode="site")
//     still opens with "Stay in the loop.", still writes the site-mode
//     storage key on dismiss, on 3002 (flag on); still shows nothing on
//     3001 (flag off).
import { AFTER, BEFORE, withPage, shot, makeRecorder } from "./sentry-common.mjs";

const { ok, summary } = makeRecorder();

async function main() {
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.goto(`${BEFORE}/`);
    await page.waitForSelector('[role="dialog"]', { timeout: 8000 }).catch(() => {});
    const dialog = page.locator('[role="dialog"]');
    const count = await dialog.count();
    ok("N2 (repair-cycle-2 recheck): / on 3002 (flag forced on) shows a dialog after 2.5s", count > 0, `count=${count}`);
    if (count > 0) {
      const headline = await dialog.locator("h3").first().innerText();
      ok('N2 (repair-cycle-2 recheck): headline is "Stay in the loop."', headline === "Stay in the loop.", headline);
      await shot(page, "sentry-cycle3-popup-site-1440-open");
    }
    await page.locator('[role="dialog"] button[aria-label="Close"]').click().catch(() => {});
    await page.waitForTimeout(150);
    const storageKey = await page.evaluate(() => window.localStorage.getItem("ekuzo_newsletter_dismissed"));
    ok('N2 (repair-cycle-2 recheck): dismissing sets storage key "ekuzo_newsletter_dismissed"', storageKey === "1", storageKey);
  });

  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.goto(`${AFTER}/`);
    await page.waitForTimeout(2800);
    const count = await page.locator('[role="dialog"]').count();
    ok("N2 (repair-cycle-2 recheck): / on 3001 (flag off) shows no dialog", count === 0, `count=${count}`);
  });

  const s = summary();
  process.exit(s.fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
