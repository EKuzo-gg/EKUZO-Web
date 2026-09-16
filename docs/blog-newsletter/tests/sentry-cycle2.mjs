// Sentry Phase 5, retest cycle 2. New checks the coordinator asked for on
// top of the unmodified re-runs of sentry-p1-p2-p3.mjs and sentry-p4.mjs:
// P1/P2/P3 at 768 and 820 (the tablet range D8's fix specifically targets),
// P4's new sticky-signup-suppresses-popup case, P7/P8's focus-trap and
// body-scroll-lock checks, T6 console cleanliness (hydration error watch
// after the .next cache clear + restart), T8, N1 (3-route subset), N2.
import { AFTER, BEFORE, BLOG_POST, withPage, withBrowser, shot, makeRecorder, log } from "./sentry-common.mjs";

const { ok, summary } = makeRecorder();

function bar(page) {
  return page.locator("div.fixed.bottom-0.left-0.right-0.z-40").first();
}

async function main() {
  // ---- P1/P2/P3 at 768 and 820 (D8's target tablet range) ----
  for (const width of [768, 820]) {
    await withPage({ width, height: 900 }, async (page) => {
      let capturedBody = null;
      await page.route("**/api/newsletter", async (route) => {
        capturedBody = JSON.parse(route.request().postData() || "{}");
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
      });
      await page.goto(`${AFTER}${BLOG_POST}`);
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(400);

      const b = bar(page);
      const emailInput = b.locator('input[type="email"]');
      ok(`P1 @ ${width}px: input[type=email] present`, (await emailInput.count()) > 0);
      const barText = await b.innerText();
      ok(`P1 @ ${width}px: no 'Enroll my gamer' text`, !barText.includes("Enroll my gamer"), barText);
      ok(`P1 @ ${width}px: no 'Talk to Humans' text`, !barText.includes("Talk to Humans"), barText);
      ok(`P1 @ ${width}px: copy line visible in innerText`, barText.includes("One email tomorrow, then you decide to stay or go.") || barText.includes("One email a week on kids and gaming, with the sources."), barText);

      // The button must be fully inside the bar's bounding box (D8: no clipped edge).
      const btn = b.locator('button[type="submit"]');
      const barBox = await b.boundingBox();
      const btnBox = await btn.boundingBox();
      const btnInsideBar =
        btnBox && barBox && btnBox.x >= barBox.x - 1 && btnBox.x + btnBox.width <= barBox.x + barBox.width + 1;
      ok(`P1/D8 @ ${width}px: submit button ("Try it"/"Join") is fully inside the bar, not clipped`, !!btnInsideBar, JSON.stringify({ barBox, btnBox }));
      const btnText = await btn.innerText();
      ok(`P1/D8 @ ${width}px: submit button label is complete (not truncated)`, btnText === "Try it" || btnText === "Join", btnText);

      await shot(page, `sentry-cycle2-sticky-blog-${width}-visible`);

      // P2 at this width: hidden at top, visible mid-page.
      await page.goto(`${AFTER}${BLOG_POST}`);
      await page.waitForTimeout(300);
      let cls = await bar(page).getAttribute("class");
      ok(`P2 @ ${width}px: bar hidden at top`, cls.includes("translate-y-full"), cls);
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(400);
      cls = await bar(page).getAttribute("class");
      ok(`P2 @ ${width}px: bar visible mid-page`, cls.includes("translate-y-0"), cls);

      // P3 submit at this width.
      await bar(page).locator('input[type="email"]').fill("reader@example.com");
      await bar(page).locator('button[type="submit"]').click();
      await page.waitForTimeout(300);
      ok(`P3 @ ${width}px: request body correct`, capturedBody?.utm_source === "blog" && capturedBody?.utm_medium === "sticky");
      const successText = (await bar(page).innerText()).toUpperCase();
      ok(
        `P3 @ ${width}px: success text visible after mocked 200`,
        successText.includes("GOT IT. LOOK FOR IT TOMORROW.") || successText.includes("YOU'RE ON THE LIST."),
        successText
      );
    });
  }

  // ---- P4 new case: sticky signup then scroll to 60% -> no dialog; reload -> no dialog ----
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.route("**/api/newsletter", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) })
    );
    await page.goto(`${AFTER}${BLOG_POST}`);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(400);
    await bar(page).locator('input[type="email"]').fill("reader@example.com");
    await bar(page).locator('button[type="submit"]').click();
    await page.waitForTimeout(400);

    const subscribedAt = await page.evaluate(() => window.localStorage.getItem("ekuzo_nl_blog_subscribed_at"));
    ok("P4/D7: ekuzo_nl_blog_subscribed_at is set after a sticky-bar success", !!subscribedAt, subscribedAt);

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.6));
    await page.waitForTimeout(1000);
    let count = await page.locator('[role="dialog"]').count();
    ok("P4/D7: no popup dialog after sticky-bar success + scroll to 60%", count === 0, `count=${count}`);

    await page.reload();
    await page.waitForTimeout(600);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.6));
    await page.waitForTimeout(1000);
    count = await page.locator('[role="dialog"]').count();
    ok("P4/D7: no popup dialog after reload + scroll to 60%", count === 0, `count=${count}`);
  });

  // ---- P7/P8 additions: Tab/Shift+Tab stay inside the dialog; body overflow hidden while open, restored after close ----
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.goto(`${AFTER}${BLOG_POST}`);
    await page.waitForTimeout(300);
    // Baseline captured on the real page (its own CSS resets set a
    // non-default body overflow), not on the blank pre-navigation page.
    const bodyOverflowBefore = await page.evaluate(() => getComputedStyle(document.body).overflow);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.55));
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
    await page.waitForTimeout(150);

    const overflowWhileOpen = await page.evaluate(() => getComputedStyle(document.body).overflow);
    ok("P9/D9: document.body overflow is hidden while the dialog is open", overflowWhileOpen === "hidden", overflowWhileOpen);

    // Tab from the last focusable element wraps to the first.
    const focusableCount = await page.locator('[role="dialog"] a[href], [role="dialog"] button:not([disabled]), [role="dialog"] input:not([disabled])').count();
    ok("P8/D9: dialog has at least 2 focusable elements to test the trap with", focusableCount >= 2, focusableCount);

    // Focus the close button (first in DOM order), then Shift+Tab: should wrap to last.
    await page.locator('[role="dialog"] button[aria-label="Close"]').focus();
    await page.keyboard.press("Shift+Tab");
    await page.waitForTimeout(50);
    let activeInside = await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"]');
      return !!dlg && dlg.contains(document.activeElement);
    });
    ok("P8/D9: Shift+Tab from the first focusable element stays inside the dialog (wraps to last)", activeInside);

    // Now Tab repeatedly past the last element: should wrap back to the first (close button).
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(30);
    }
    activeInside = await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"]');
      return !!dlg && dlg.contains(document.activeElement);
    });
    ok("P8/D9: repeated Tab presses never move focus outside the dialog", activeInside);

    await page.locator('[role="dialog"] button[aria-label="Close"]').click();
    await page.waitForTimeout(200);
    const overflowAfterClose = await page.evaluate(() => getComputedStyle(document.body).overflow);
    ok(
      "P9/D9: document.body overflow restored after close",
      overflowAfterClose === bodyOverflowBefore,
      `before=${bodyOverflowBefore} after=${overflowAfterClose}`
    );
  });

  // ---- T6: console cleanliness, watching specifically for a hydration error after the cache clear + restart ----
  const HYDRATION_PATTERNS = [
    /hydration/i,
    /did not match/i,
    /each child in a list/i,
    /cannot appear as a descendant/i,
    /cannot appear as a child/i,
    /invalid dom/i,
    /unexpected token/i,
    /uncaught/i,
    /warning:.*react/i,
    /text content does not match/i,
    /error: minified react error/i,
  ];
  const THIRD_PARTY_HOSTS = ["googletagmanager.com", "google-analytics", "clarity.ms", "facebook.net", "facebook.com", "doubleclick"];

  for (const route of [
    { name: "gaming-study post", path: BLOG_POST },
    { name: "/", path: "/" },
    { name: "/blog", path: "/blog" },
    { name: "/programs/ekuzo-camps", path: "/programs/ekuzo-camps" },
  ]) {
    await withPage({ width: 1440, height: 900 }, async (page) => {
      const messages = [];
      page.on("console", (msg) => messages.push({ type: msg.type(), text: msg.text(), location: msg.location() }));
      page.on("pageerror", (err) => messages.push({ type: "pageerror", text: String(err), location: {} }));
      await page.goto(`${AFTER}${route.path}`);
      await page.waitForTimeout(1500);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.5));
      await page.waitForTimeout(1200);

      const errorsAndWarnings = messages.filter((m) => m.type === "error" || m.type === "warning" || m.type === "pageerror");
      const ours = errorsAndWarnings.filter((m) => !THIRD_PARTY_HOSTS.some((h) => (m.location?.url || "").includes(h)));
      const hydrationHits = ours.filter((m) => HYDRATION_PATTERNS.some((p) => p.test(m.text)));

      ok(
        `T6 @ ${route.name}: no hydration error (cache-clear/restart regression check)`,
        hydrationHits.length === 0,
        hydrationHits.length ? JSON.stringify(hydrationHits) : "clean"
      );
      if (hydrationHits.length > 0) {
        log(`  [T6 HYDRATION ERROR VERBATIM on ${route.name}]:`, JSON.stringify(hydrationHits, null, 2));
      }
    });
  }

  // ---- T8: z-index stacking, re-check ----
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.goto(`${AFTER}${BLOG_POST}`);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(400);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.55));
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
    await page.waitForTimeout(150);
    const dialogClass = await page.locator('[role="dialog"]').getAttribute("class");
    ok("T8: dialog root still has z-[9999] class", dialogClass.includes("z-[9999]"), dialogClass);
    const barCount = await bar(page).count();
    ok("T8: sticky bar still in the DOM while popup is open", barCount > 0);
    const barBox = await bar(page).boundingBox();
    const isInsideDialog = await page.evaluate(
      ({ x, y }) => {
        const el = document.elementFromPoint(x, y);
        const dlg = document.querySelector('[role="dialog"]');
        return !!dlg && !!el && dlg.contains(el);
      },
      { x: barBox.x + barBox.width / 2, y: barBox.y + barBox.height / 2 }
    );
    ok("T8: elementFromPoint at the bar's center is inside the dialog", isInsideDialog);
  });

  // ---- N1 on /, /programs/ekuzo-camps, /programs/ekuzo-camps/register vs 3002 ----
  await withBrowser(async (browser) => {
    for (const route of ["/", "/programs/ekuzo-camps", "/programs/ekuzo-camps/register"]) {
      let beforeHtml, afterHtml;
      for (const [label, base] of [
        ["before", BEFORE],
        ["after", AFTER],
      ]) {
        const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const page = await context.newPage();
        await page.goto(`${base}${route}`, { waitUntil: "domcontentloaded", timeout: 45000 });
        await page.evaluate(() => window.scrollTo(0, 600));
        const becameVisible = await page
          .waitForFunction(() => {
            const b = document.querySelector("div.fixed.bottom-0.left-0.right-0.z-40");
            return !!b && b.className.includes("translate-y-0");
          }, { timeout: 4000 })
          .then(() => true)
          .catch(() => false);
        if (!becameVisible) {
          await page
            .waitForFunction(() => {
              const b = document.querySelector("div.fixed.bottom-0.left-0.right-0.z-40");
              return !b || b.className.includes("translate-y-full");
            }, { timeout: 3000 })
            .catch(() => {});
        }
        await page.waitForTimeout(400);
        const b = page.locator("div.fixed.bottom-0.left-0.right-0.z-40").first();
        const count = await b.count();
        const html = count > 0 ? await b.evaluate((el) => el.outerHTML) : null;
        if (label === "before") beforeHtml = html;
        else afterHtml = html;
        await context.close();
      }

      if (route === "/programs/ekuzo-camps/register") {
        const beforeHidden = beforeHtml === null || beforeHtml.includes("translate-y-full");
        const afterHidden = afterHtml === null || afterHtml.includes("translate-y-full");
        ok(`N1 @ ${route}: bar stays hidden on BEFORE`, beforeHidden, beforeHtml?.slice(0, 120));
        ok(`N1 @ ${route}: bar stays hidden on AFTER`, afterHidden, afterHtml?.slice(0, 120));
      }
      ok(
        `N1 @ ${route}: bar outerHTML byte-identical before vs after`,
        beforeHtml === afterHtml,
        beforeHtml === afterHtml ? "identical" : `DIFFERS\n--before--\n${beforeHtml}\n--after--\n${afterHtml}`
      );
    }
  });

  // ---- N2 on / (3001): no dialog ----
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.goto(`${AFTER}/`);
    await page.waitForTimeout(3000);
    const count = await page.locator('[role="dialog"]').count();
    ok("N2: / on 3001 (flag off) shows no dialog", count === 0, `count=${count}`);
  });

  const s = summary();
  process.exit(s.fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
