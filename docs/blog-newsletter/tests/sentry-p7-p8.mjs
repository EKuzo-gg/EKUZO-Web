// Sentry Phase 4: P7 (popup submit contract + storage on success/dismiss)
// and P8 (accessibility: role, aria-modal, aria-label, focus in/out, Escape).
import { AFTER, BLOG_POST, withPage, shot, makeRecorder, log } from "./sentry-common.mjs";

const { ok, summary } = makeRecorder();

async function openPopup(page) {
  await page.goto(`${AFTER}${BLOG_POST}`);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.55));
  await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
  await page.waitForTimeout(150);
}

async function main() {
  // ---- P7: success path ----
  await withPage({ width: 1440, height: 900 }, async (page) => {
    let body = null;
    await page.route("**/api/newsletter", async (route) => {
      body = JSON.parse(route.request().postData() || "{}");
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
    });
    await openPopup(page);
    const dialog = page.locator('[role="dialog"]');
    await dialog.locator('input[type="email"]').fill("reader@example.com");
    await dialog.locator('button[type="submit"]').click();
    await page.waitForTimeout(300);

    ok("P7: request body has email", body?.email === "reader@example.com");
    ok("P7: request body utm_source=blog", body?.utm_source === "blog");
    ok("P7: request body utm_medium=popup", body?.utm_medium === "popup");
    ok("P7: request body utm_campaign is thumbs/classic", ["thumbs", "classic"].includes(body?.utm_campaign));
    await shot(page, "sentry-p7-popup-success-pending");

    // success closes after 800ms and sets the 365-day suppression key
    await page.waitForTimeout(900);
    const dialogCountAfter = await page.locator('[role="dialog"]').count();
    ok("P7: dialog closes ~800ms after success", dialogCountAfter === 0, `count=${dialogCountAfter}`);
    const subscribedAt = await page.evaluate(() => window.localStorage.getItem("ekuzo_nl_blog_subscribed_at"));
    ok("P7: ekuzo_nl_blog_subscribed_at set after success", !!subscribedAt && !Number.isNaN(Number(subscribedAt)), subscribedAt);
  });

  // ---- P7: error path (mocked 500), assert JSON body still correct ----
  await withPage({ width: 1440, height: 900 }, async (page) => {
    let body = null;
    await page.route("**/api/newsletter", async (route) => {
      body = JSON.parse(route.request().postData() || "{}");
      await route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "Failed to subscribe. Please try again." }) });
    });
    await openPopup(page);
    const dialog = page.locator('[role="dialog"]');
    await dialog.locator('input[type="email"]').fill("reader@example.com");
    await dialog.locator('button[type="submit"]').click();
    await page.waitForTimeout(300);
    ok("P7: error path request body still carries the same contract fields", body?.utm_source === "blog" && body?.utm_medium === "popup");
    const dialogStillOpen = await page.locator('[role="dialog"]').count();
    ok("P7: dialog stays open on error (not auto-closed)", dialogStillOpen > 0);
    const subscribedAt = await page.evaluate(() => window.localStorage.getItem("ekuzo_nl_blog_subscribed_at"));
    ok("P7: ekuzo_nl_blog_subscribed_at NOT set on error", subscribedAt === null, subscribedAt);
  });

  // ---- P7: dismiss via X ----
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await openPopup(page);
    await page.locator('[role="dialog"] button[aria-label="Close"]').click();
    await page.waitForTimeout(150);
    const count = await page.locator('[role="dialog"]').count();
    ok("P7: dismiss via X closes the dialog", count === 0);
    const dismissedAt = await page.evaluate(() => window.localStorage.getItem("ekuzo_nl_blog_dismissed_at"));
    ok("P7: ekuzo_nl_blog_dismissed_at set after X dismiss", !!dismissedAt, dismissedAt);
  });

  // ---- P7: dismiss via Escape ----
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await openPopup(page);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(150);
    const count = await page.locator('[role="dialog"]').count();
    ok("P7: dismiss via Escape closes the dialog", count === 0);
    const dismissedAt = await page.evaluate(() => window.localStorage.getItem("ekuzo_nl_blog_dismissed_at"));
    ok("P7: ekuzo_nl_blog_dismissed_at set after Escape dismiss", !!dismissedAt, dismissedAt);
  });

  // ---- P7: dismiss via outside-form (backdrop) click ----
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await openPopup(page);
    // Click the left purple brand pane, which is outside <form>.
    const leftPane = page.locator('[role="dialog"] > div').first();
    await leftPane.click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(150);
    const count = await page.locator('[role="dialog"]').count();
    ok("P7: dismiss via outside-form click closes the dialog", count === 0);
    const dismissedAt = await page.evaluate(() => window.localStorage.getItem("ekuzo_nl_blog_dismissed_at"));
    ok("P7: ekuzo_nl_blog_dismissed_at set after backdrop dismiss", !!dismissedAt, dismissedAt);
  });

  // ---- P8: role, aria-modal, aria-label, focus-in within 200ms, Escape returns focus ----
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.goto(`${AFTER}${BLOG_POST}`);
    // Put focus on a known element before the popup opens (a link in the article).
    await page.evaluate(() => {
      const link = document.querySelector("a") || document.body;
      (link).setAttribute("data-sentry-focus-anchor", "1");
      (link).tabIndex = link.tabIndex ?? 0;
      (link).focus();
    });
    const beforeId = await page.evaluate(() => document.activeElement?.tagName + "|" + document.activeElement?.getAttribute("data-sentry-focus-anchor"));

    const t0 = Date.now();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.55));
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });

    const dialog = page.locator('[role="dialog"]');
    const role = await dialog.getAttribute("role");
    const ariaModal = await dialog.getAttribute("aria-modal");
    const ariaLabel = await dialog.getAttribute("aria-label");
    ok("P8: dialog has role=dialog", role === "dialog", role);
    ok("P8: dialog has aria-modal=true", ariaModal === "true", ariaModal);
    ok("P8: dialog has a non-empty aria-label", !!ariaLabel && ariaLabel.trim().length > 0, ariaLabel);

    // Poll for activeElement inside dialog within 200ms of open.
    let insideWithin200 = false;
    const deadline = Date.now() + 200;
    while (Date.now() < deadline) {
      insideWithin200 = await page.evaluate(() => {
        const dlg = document.querySelector('[role="dialog"]');
        return !!dlg && dlg.contains(document.activeElement);
      });
      if (insideWithin200) break;
      await page.waitForTimeout(10);
    }
    ok("P8: document.activeElement is inside the dialog within 200ms of open", insideWithin200);

    await page.keyboard.press("Escape");
    await page.waitForTimeout(150);
    const afterId = await page.evaluate(() => document.activeElement?.tagName + "|" + document.activeElement?.getAttribute("data-sentry-focus-anchor"));
    ok("P8: Escape closes the dialog", (await page.locator('[role="dialog"]').count()) === 0);
    ok("P8: focus returns to the previously focused element after Escape", afterId === beforeId, `before=${beforeId} after=${afterId}`);
  });

  const s = summary();
  process.exit(s.fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
