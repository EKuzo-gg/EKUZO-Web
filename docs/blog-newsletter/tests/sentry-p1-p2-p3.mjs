// Sentry Phase 4: P1, P2, P3 - sticky bar on the gaming-study post.
import { AFTER, BLOG_POST, withPage, shot, makeRecorder, log } from "./sentry-common.mjs";

const { ok, summary } = makeRecorder();

async function findBar(page) {
  // Fixed bottom bar per StickyCTA: fixed bottom-0 left-0 right-0 z-40
  return page.locator("div.fixed.bottom-0.left-0.right-0.z-40").first();
}

async function main() {
  // ---- P1: bar is a newsletter bar, no Enroll/Talk to Humans ----
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.goto(`${AFTER}${BLOG_POST}`);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(400);
    const bar = await findBar(page);
    const emailInput = bar.locator('input[type="email"]');
    ok("P1: input[type=email] present in bar (1440)", (await emailInput.count()) > 0);
    const barText = await bar.innerText();
    ok("P1: no 'Enroll my gamer' text in bar", !barText.includes("Enroll my gamer"), barText);
    ok("P1: no 'Talk to Humans' text in bar", !barText.includes("Talk to Humans"), barText);
    await shot(page, "sentry-p1-sticky-blog-bar-1440");
  });

  await withPage({ width: 375, height: 800 }, async (page) => {
    await page.goto(`${AFTER}${BLOG_POST}`);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(400);
    const bar = await findBar(page);
    const emailInput = bar.locator('input[type="email"]');
    ok("P1: input[type=email] present in bar (375)", (await emailInput.count()) > 0);
    const barText = await bar.innerText();
    ok("P1: no 'Enroll my gamer' text in bar (375)", !barText.includes("Enroll my gamer"));
    ok("P1: no 'Talk to Humans' text in bar (375)", !barText.includes("Talk to Humans"));
    // The requirement's own prose says the bar is "one line of copy, an
    // email input, a submit button" -- check the copy line is actually
    // VISIBLE at mobile width, not merely present in the DOM.
    const lineSpan = bar.locator("span").first();
    const lineVisible = await lineSpan.isVisible().catch(() => false);
    const lineDisplay = await lineSpan.evaluate((el) => getComputedStyle(el).display).catch(() => "n/a");
    ok(
      "P1: the bar's line of copy is visible at 375px (not display:none)",
      lineVisible && lineDisplay !== "none",
      `isVisible=${lineVisible} display=${lineDisplay}`
    );
    await shot(page, "sentry-p1-sticky-blog-bar-375");
  });

  // ---- P2: hidden at top, present mid-page, absent when footer visible ----
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.goto(`${AFTER}${BLOG_POST}`);
    await page.waitForTimeout(300);
    let bar = await findBar(page);
    let transform = await bar.evaluate((el) => getComputedStyle(el).transform);
    let cls = await bar.getAttribute("class");
    ok("P2: bar has translate-y-full class at top (hidden)", cls.includes("translate-y-full"), cls);

    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(400);
    bar = await findBar(page);
    cls = await bar.getAttribute("class");
    ok("P2: bar has translate-y-0 class mid-page (visible)", cls.includes("translate-y-0"), cls);

    // Scroll to the very bottom so the footer intersects the viewport.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(500);
    bar = await findBar(page);
    cls = await bar.getAttribute("class");
    ok("P2: bar hidden when footer is in view (translate-y-full)", cls.includes("translate-y-full"), cls);
  });

  // ---- P3: submit posts correct JSON; success/error states ----
  await withPage({ width: 1440, height: 900 }, async (page, context) => {
    let capturedBody = null;
    await page.route("**/api/newsletter", async (route) => {
      capturedBody = JSON.parse(route.request().postData() || "{}");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });
    await page.goto(`${AFTER}${BLOG_POST}`);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(400);
    const bar = await findBar(page);
    await bar.locator('input[type="email"]').fill("reader@example.com");
    await bar.locator('button[type="submit"]').click();
    await page.waitForTimeout(300);

    ok("P3: request body has email", capturedBody?.email === "reader@example.com", JSON.stringify(capturedBody));
    ok("P3: request body utm_source=blog", capturedBody?.utm_source === "blog");
    ok("P3: request body utm_medium=sticky", capturedBody?.utm_medium === "sticky");
    ok(
      "P3: request body utm_campaign is thumbs or classic",
      capturedBody?.utm_campaign === "thumbs" || capturedBody?.utm_campaign === "classic",
      capturedBody?.utm_campaign
    );

    const barText = (await (await findBar(page)).innerText()).toUpperCase();
    const successStrings = ["Got it. Look for it tomorrow.", "You're on the list."];
    ok(
      "P3: success state text visible after mocked 200 (case-insensitive; the line renders through a CSS uppercase transform)",
      successStrings.some((s) => barText.includes(s.toUpperCase())),
      barText
    );
    await shot(page, "sentry-p3-sticky-success-1440");
  });

  await withPage({ width: 375, height: 800 }, async (page) => {
    let capturedBody = null;
    await page.route("**/api/newsletter", async (route) => {
      capturedBody = JSON.parse(route.request().postData() || "{}");
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Failed to subscribe. Please try again." }),
      });
    });
    await page.goto(`${AFTER}${BLOG_POST}`);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(400);
    const bar = await findBar(page);
    await bar.locator('input[type="email"]').fill("reader@example.com");
    const urlBefore = page.url();
    await bar.locator('button[type="submit"]').click();
    await page.waitForTimeout(300);

    ok("P3: request body captured on error path too", !!capturedBody);
    const barTextRaw = await (await findBar(page)).innerText();
    const barText = barTextRaw.toUpperCase();
    ok(
      "P3: error text inline after mocked 500 (checked at 375px, the width this case mocks)",
      barText.includes("THAT DIDN'T GO THROUGH. TRY ONCE MORE."),
      barTextRaw
    );
    ok("P3: no navigation away on error", page.url() === urlBefore, page.url());
    await shot(page, "sentry-p3-sticky-error-375");
  });

  // P3 error text, re-checked at 1440px where the "hidden sm:block" class
  // does not suppress the line (isolates the 375px-only failure above).
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.route("**/api/newsletter", (route) =>
      route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "x" }) })
    );
    await page.goto(`${AFTER}${BLOG_POST}`);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(400);
    const bar = await findBar(page);
    await bar.locator('input[type="email"]').fill("reader@example.com");
    await bar.locator('button[type="submit"]').click();
    await page.waitForTimeout(300);
    const barText = (await (await findBar(page)).innerText()).toUpperCase();
    ok(
      "P3: error text inline after mocked 500, at 1440px (line span not hidden here)",
      barText.includes("THAT DIDN'T GO THROUGH. TRY ONCE MORE."),
      barText
    );
    await shot(page, "sentry-p3-sticky-error-1440");
  });

  const s = summary();
  process.exit(s.fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
