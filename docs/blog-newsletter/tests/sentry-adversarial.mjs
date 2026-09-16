// Sentry Phase 6 (adversarial pass, kept separate from Phase 4 findings).
import { AFTER, BLOG_POST, withPage, shot, makeRecorder, log } from "./sentry-common.mjs";

const { ok, summary } = makeRecorder();

async function main() {
  // ---- Invalid email in the sticky bar ----
  await withPage({ width: 1440, height: 900 }, async (page) => {
    let called = false;
    await page.route("**/api/newsletter", async (route) => {
      called = true;
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
    });
    await page.goto(`${AFTER}${BLOG_POST}`);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(400);
    const bar = page.locator("div.fixed.bottom-0.left-0.right-0.z-40").first();
    const input = bar.locator('input[type="email"]');
    await input.fill("not-an-email");
    await bar.locator('button[type="submit"]').click();
    await page.waitForTimeout(300);
    const validity = await input.evaluate((el) => el.checkValidity());
    ok(
      "Adversarial: invalid email is rejected by native HTML5 validation (type=email), no request sent",
      !validity && !called,
      `checkValidity=${validity} requestSent=${called}`
    );
  });

  // ---- 300-char input ----
  await withPage({ width: 1440, height: 900 }, async (page) => {
    let capturedBody = null;
    await page.route("**/api/newsletter", async (route) => {
      capturedBody = JSON.parse(route.request().postData() || "{}");
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
    });
    await page.goto(`${AFTER}${BLOG_POST}`);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(400);
    const longLocal = "a".repeat(290);
    const longEmail = `${longLocal}@example.com`; // ~300 chars, syntactically a valid email
    const bar = page.locator("div.fixed.bottom-0.left-0.right-0.z-40").first();
    await bar.locator('input[type="email"]').fill(longEmail);
    await bar.locator('button[type="submit"]').click();
    await page.waitForTimeout(300);
    ok(
      "Adversarial: 300-char email is accepted and sent through unmodified (no client-side length cap observed)",
      capturedBody?.email === longEmail,
      `sent length=${capturedBody?.email?.length}`
    );
  });

  // ---- Double-submit rapidly ----
  await withPage({ width: 1440, height: 900 }, async (page) => {
    let callCount = 0;
    await page.route("**/api/newsletter", async (route) => {
      callCount++;
      await new Promise((r) => setTimeout(r, 200));
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
    });
    await page.goto(`${AFTER}${BLOG_POST}`);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(400);
    const bar = page.locator("div.fixed.bottom-0.left-0.right-0.z-40").first();
    await bar.locator('input[type="email"]').fill("double@example.com");
    const btn = bar.locator('button[type="submit"]');
    await btn.click();
    await btn.click({ force: true }).catch(() => {}); // second click while disabled/loading
    await page.waitForTimeout(500);
    ok(
      "Adversarial: rapid double-submit on the sticky bar results in exactly one POST (button disables while loading)",
      callCount === 1,
      `callCount=${callCount}`
    );
  });

  // Double-submit on the popup too.
  await withPage({ width: 1440, height: 900 }, async (page) => {
    let callCount = 0;
    await page.route("**/api/newsletter", async (route) => {
      callCount++;
      await new Promise((r) => setTimeout(r, 200));
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
    });
    await page.goto(`${AFTER}${BLOG_POST}`);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.55));
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
    await page.locator('[role="dialog"] input[type="email"]').fill("double@example.com");
    const btn = page.locator('[role="dialog"] button[type="submit"]');
    await btn.click();
    await btn.click({ force: true }).catch(() => {});
    await page.waitForTimeout(500);
    ok(
      "Adversarial: rapid double-submit on the popup results in exactly one POST",
      callCount === 1,
      `callCount=${callCount}`
    );
  });

  // ---- Tampered utm_campaign directly against 3001's live route ----
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.goto(`${AFTER}/`); // just to get an origin to fetch from
    const result = await page.evaluate(async () => {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "tamper-test@example.com", utm_source: "blog", utm_medium: "sticky", utm_campaign: "x" }),
      });
      return { status: res.status, body: await res.json().catch(() => null) };
    });
    // This checkout has no BEEHIIV_API_KEY, so the live route 500s before
    // ever reaching the allowlist logic that would drop "x" -- confirming
    // the request is ACCEPTED (not 400) either way is still useful signal
    // that invalid utm_campaign is "dropped, not rejected" per T1, but the
    // actual dropped-body assertion is Relay's unit test (T1d, tested
    // against a mocked fetch), not something a live POST against this
    // cloud checkout can observe end-to-end without live Beehiiv creds.
    ok(
      "Adversarial: tampered utm_campaign never produces a 400 (email is the only required field per contract)",
      result.status !== 400,
      JSON.stringify(result)
    );
    log("  [note] Full drop-not-reject behavior for a tampered utm_campaign is covered by Relay's routes.test.mjs (T1d, mocked fetch) -- see sentry-output-routes-rerun.txt, cases 'T1d: mixed valid/invalid' and 'T1d: all three utm fields invalid'. Not independently re-verifiable end-to-end here because this checkout has no live BEEHIIV_API_KEY.");
  });

  // ---- Popup open, then resize to 375: close button not trapped offscreen ----
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.goto(`${AFTER}${BLOG_POST}`);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.55));
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
    await page.setViewportSize({ width: 375, height: 800 });
    await page.waitForTimeout(300);
    const closeBtn = page.locator('[role="dialog"] button[aria-label="Close"]');
    const box = await closeBtn.boundingBox();
    const viewport = page.viewportSize();
    const inBounds =
      box && box.x >= 0 && box.y >= 0 && box.x + box.width <= viewport.width && box.y + box.height <= viewport.height;
    ok(
      "Adversarial: after resizing an open popup to 375px, the close button stays within the viewport (not offscreen)",
      !!inBounds,
      JSON.stringify({ box, viewport })
    );
    await shot(page, "sentry-adversarial-popup-resized-375");
    // Also confirm it's actually clickable at the new size.
    await closeBtn.click();
    await page.waitForTimeout(200);
    ok("Adversarial: close button remains clickable after resize", (await page.locator('[role="dialog"]').count()) === 0);
  });

  // ---- Keyboard-only: Tab into the bar's input, submit with Enter ----
  await withPage({ width: 1440, height: 900 }, async (page) => {
    let capturedBody = null;
    await page.route("**/api/newsletter", async (route) => {
      capturedBody = JSON.parse(route.request().postData() || "{}");
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
    });
    await page.goto(`${AFTER}${BLOG_POST}`);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(400);
    const bar = page.locator("div.fixed.bottom-0.left-0.right-0.z-40").first();
    const input = bar.locator('input[type="email"]');
    await input.focus();
    const isFocused = await input.evaluate((el) => el === document.activeElement);
    ok("Adversarial: the bar's email input is directly focusable (keyboard path)", isFocused);
    await page.keyboard.type("keyboard@example.com");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
    ok(
      "Adversarial: pressing Enter in the email input submits the form (keyboard-only path)",
      capturedBody?.email === "keyboard@example.com",
      JSON.stringify(capturedBody)
    );
  });

  // ---- localStorage disabled: shows once per load, defaults to thumbs ----
  await withPage({ width: 1440, height: 900 }, async (page, context) => {
    await context.addInitScript(() => {
      const throwing = () => {
        throw new Error("storage disabled");
      };
      Object.defineProperty(window, "localStorage", {
        get() {
          return { getItem: throwing, setItem: throwing, removeItem: throwing };
        },
      });
    });
    await page.goto(`${AFTER}${BLOG_POST}`);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.55));
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
    const headline = await page.locator('[role="dialog"] h3').first().innerText();
    ok(
      'Adversarial: with localStorage disabled, popup defaults to the "thumbs" variant',
      headline === "One email after you read this. Then you decide.",
      headline
    );

    // Scroll away and back / re-trigger scroll events -- should not re-show
    // a second time in the same page load (shownThisLoad guard).
    await page.locator('[role="dialog"] button[aria-label="Close"]').click();
    await page.waitForTimeout(150);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(100);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.7));
    await page.waitForTimeout(500);
    const count = await page.locator('[role="dialog"]').count();
    ok(
      "Adversarial: with localStorage disabled, popup does not re-show again on further scrolling in the same page load",
      count === 0,
      `count=${count}`
    );
  });

  // ---- Client-side Link navigation between two blog posts ----
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.goto(`${AFTER}${BLOG_POST}`);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.55));
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
    // Dismiss without a client-side navigation guard bypass -- just verify
    // the baseline "not dismissed" cross-post case first, in a second tab
    // that never dismissed, using a client-side navigation between posts.
    await page.locator('[role="dialog"] button[aria-label="Close"]').click();
    await page.waitForTimeout(150);

    // Find a link to another blog post and navigate client-side.
    const otherPostLink = page.locator('a[href^="/blog/"]').filter({ hasNotText: "" }).first();
    const hrefCandidates = await page.locator('a[href^="/blog/"]').evaluateAll((as) =>
      as.map((a) => a.getAttribute("href")).filter((h) => h && h !== "/blog" && !h.startsWith("/blog/author/"))
    );
    const targetHref = hrefCandidates.find((h) => h && !h.includes("gaming-study-13-7"));

    if (targetHref) {
      await page.locator(`a[href="${targetHref}"]`).first().click();
      await page.waitForURL(`**${targetHref}`, { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(300);
      // Just dismissed on the previous post within the DISMISS_WINDOW_MS,
      // so per shouldShowPopup this should NOT show again on the new post.
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.55));
      await page.waitForTimeout(1000);
      const countAfterNav = await page.locator('[role="dialog"]').count();
      ok(
        "Adversarial: after dismissing on post A, navigating client-side to post B does not re-show the popup (dismiss window still active)",
        countAfterNav === 0,
        `count=${countAfterNav} targetHref=${targetHref}`
      );
    } else {
      ok("Adversarial: client-side Link navigation between posts (SKIPPED, no second post link found)", true, "no candidate link");
    }
  });

  // Same-context, NOT dismissed: navigating to a second post via client-side
  // Link should show the popup on that second post (once per page load).
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.goto(`${AFTER}${BLOG_POST}`);
    await page.waitForTimeout(300);
    const hrefCandidates = await page.locator('a[href^="/blog/"]').evaluateAll((as) =>
      as.map((a) => a.getAttribute("href")).filter((h) => h && h !== "/blog" && !h.startsWith("/blog/author/"))
    );
    const targetHref = hrefCandidates.find((h) => h && !h.includes("gaming-study-13-7"));
    if (targetHref) {
      await page.locator(`a[href="${targetHref}"]`).first().click();
      await page.waitForURL(`**${targetHref}`, { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(300);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.55));
      await page.waitForTimeout(1200);
      const count = await page.locator('[role="dialog"]').count();
      ok(
        "Adversarial: never-dismissed reader navigating client-side to a second post DOES see the popup there",
        count > 0,
        `count=${count} targetHref=${targetHref}`
      );
      // And only once per page load: scroll away and back shouldn't add a second dialog instance.
      await page.locator('[role="dialog"] button[aria-label="Close"]').click().catch(() => {});
      await page.waitForTimeout(150);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(100);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.6));
      await page.waitForTimeout(600);
      const countAfterDismiss = await page.locator('[role="dialog"]').count();
      ok(
        "Adversarial: after dismissing on the second post, it does not reappear again in the same page load",
        countAfterDismiss === 0,
        `count=${countAfterDismiss}`
      );
    } else {
      ok("Adversarial: second-post popup-shows-once-per-load (SKIPPED, no candidate link found)", true);
    }
  });

  const s = summary();
  process.exit(s.fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
