// Sentry Phase 4: P5 - 20 fresh contexts see both variants; within one
// context, popup variant == sticky bar utm_campaign.
import { AFTER, BLOG_POST, withBrowser, makeRecorder, log } from "./sentry-common.mjs";

const { ok, summary } = makeRecorder();

async function main() {
  const seenVariants = new Set();
  const mismatches = [];

  await withBrowser(async (browser) => {
    for (let i = 0; i < 20; i++) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();

      let stickyBody = null;
      await page.route("**/api/newsletter", async (route) => {
        stickyBody = JSON.parse(route.request().postData() || "{}");
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
      });

      await page.goto(`${AFTER}${BLOG_POST}`);
      await page.waitForTimeout(300);
      const variant = await page.evaluate(() => window.localStorage.getItem("ekuzo_nl_variant"));
      seenVariants.add(variant);

      // Trigger the popup (50% scroll) to read its aria-label / copy variant,
      // then submit the sticky bar to read its utm_campaign, and cross-check.
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.5));
      await page.waitForSelector('[role="dialog"]', { timeout: 2000 }).catch(() => {});
      const popupHeadline = await page
        .locator('[role="dialog"] h3')
        .first()
        .innerText()
        .catch(() => null);
      const popupVariant =
        popupHeadline === "One email after you read this. Then you decide." ? "thumbs" : popupHeadline === "For parents of gamers, once a week." ? "classic" : null;

      // Close popup so it doesn't block the sticky bar's submit button.
      await page.locator('[role="dialog"] button[aria-label="Close"]').click().catch(() => {});
      await page.waitForTimeout(150);

      const bar = page.locator("div.fixed.bottom-0.left-0.right-0.z-40").first();
      await bar.locator('input[type="email"]').fill(`reader${i}@example.com`);
      await bar.locator('button[type="submit"]').click();
      await page.waitForTimeout(200);

      if (variant !== popupVariant || variant !== stickyBody?.utm_campaign) {
        mismatches.push({ i, variant, popupVariant, stickyCampaign: stickyBody?.utm_campaign });
      }

      await context.close();
    }
  });

  ok(
    "P5: 20 fresh contexts saw both variants (thumbs and classic)",
    seenVariants.has("thumbs") && seenVariants.has("classic"),
    `seen: ${[...seenVariants].join(",")}`
  );
  ok(
    "P5: within each context, stored variant == popup variant == sticky utm_campaign",
    mismatches.length === 0,
    JSON.stringify(mismatches)
  );

  const s = summary();
  process.exit(s.fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
