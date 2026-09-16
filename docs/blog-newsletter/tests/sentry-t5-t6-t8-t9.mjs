// Sentry Phase 4: T5, T6, T8, T9.
import { AFTER, BLOG_POST, withPage, shot, makeRecorder, log } from "./sentry-common.mjs";

const { ok, summary } = makeRecorder();

async function main() {
  // ---- T5: homepage popup stays gated by the flag (unset on 3001) ----
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.goto(`${AFTER}/`);
    await page.waitForTimeout(5000);
    const count = await page.locator('[role="dialog"]').count();
    ok("T5: / on 3001 (flag unset) shows no dialog after 5s", count === 0, `count=${count}`);
  });

  // ---- T5: blog post shows the blog dialog at 50%, independent of the flag ----
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.goto(`${AFTER}${BLOG_POST}`);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.55));
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
    const count = await page.locator('[role="dialog"]').count();
    ok("T5: blog post on 3001 shows the blog dialog at 50% scroll despite flag unset", count > 0, `count=${count}`);
  });

  // ---- T6: console cleanliness across touched routes ----
  const routes = [
    { name: "/", path: "/" },
    { name: "/blog", path: "/blog" },
    { name: "gaming-study post", path: BLOG_POST },
    { name: "/programs/ekuzo-camps", path: "/programs/ekuzo-camps" },
    { name: "/parents", path: "/parents" },
  ];

  const OUR_CODE_PATTERNS = [
    /hydration/i,
    /did not match/i,
    /each child in a list/i,
    /cannot appear as a descendant/i,
    /cannot appear as a child/i,
    /invalid dom/i,
    /unexpected token/i,
    /uncaught/i,
    /warning:.*react/i,
  ];
  const THIRD_PARTY_HOSTS = ["googletagmanager.com", "google-analytics", "clarity.ms", "facebook.net", "facebook.com", "doubleclick"];

  for (const route of routes) {
    await withPage({ width: 1440, height: 900 }, async (page) => {
      const messages = [];
      page.on("console", (msg) => {
        messages.push({ type: msg.type(), text: msg.text(), location: msg.location() });
      });
      page.on("pageerror", (err) => {
        messages.push({ type: "pageerror", text: String(err), location: {} });
      });
      await page.goto(`${AFTER}${route.path}`);
      await page.waitForTimeout(1500);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.5));
      await page.waitForTimeout(1000);

      const errorsAndWarnings = messages.filter((m) => m.type === "error" || m.type === "warning" || m.type === "pageerror");
      const thirdParty = errorsAndWarnings.filter((m) => THIRD_PARTY_HOSTS.some((h) => (m.location?.url || "").includes(h)));
      const ours = errorsAndWarnings.filter((m) => !THIRD_PARTY_HOSTS.some((h) => (m.location?.url || "").includes(h)));
      const oursFlaggedByPattern = ours.filter((m) => OUR_CODE_PATTERNS.some((p) => p.test(m.text)));

      ok(
        `T6: ${route.name} has no hydration/invalid-DOM/uncaught console errors from our code`,
        oursFlaggedByPattern.length === 0,
        oursFlaggedByPattern.length ? JSON.stringify(oursFlaggedByPattern) : `all clear; third-party noise noted: ${thirdParty.length}, other non-pattern console items from our origin: ${ours.length - oursFlaggedByPattern.length}`
      );
      if (ours.length > 0) {
        log(`  [T6 info] ${route.name} console items not matched by our-code patterns (informational, not failing):`, JSON.stringify(ours.filter((m) => !oursFlaggedByPattern.includes(m))));
      }
    });
  }

  // ---- T6: opening the contact modal ----
  await withPage({ width: 1440, height: 900 }, async (page) => {
    const messages = [];
    page.on("console", (msg) => messages.push({ type: msg.type(), text: msg.text(), location: msg.location() }));
    page.on("pageerror", (err) => messages.push({ type: "pageerror", text: String(err), location: {} }));
    await page.goto(`${AFTER}/`);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(400);
    await page.click("text=Talk to Humans");
    await page.waitForSelector("#contact-heard-about", { timeout: 5000 });
    await page.waitForTimeout(500);
    const errorsAndWarnings = messages.filter((m) => m.type === "error" || m.type === "warning" || m.type === "pageerror");
    const ours = errorsAndWarnings.filter((m) => !THIRD_PARTY_HOSTS.some((h) => (m.location?.url || "").includes(h)));
    const oursFlaggedByPattern = ours.filter((m) => OUR_CODE_PATTERNS.some((p) => p.test(m.text)));
    ok(
      "T6: opening the contact modal has no hydration/invalid-DOM/uncaught console errors from our code",
      oursFlaggedByPattern.length === 0,
      oursFlaggedByPattern.length ? JSON.stringify(oursFlaggedByPattern) : "clean"
    );
  });

  // ---- T8: z-[9999] on dialog root; sticky bar still in DOM; elementFromPoint at bar center is in dialog/backdrop ----
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.goto(`${AFTER}${BLOG_POST}`);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(400);
    const barBeforeCount = await page.locator("div.fixed.bottom-0.left-0.right-0.z-40").count();
    ok("T8: sticky bar present before popup opens", barBeforeCount > 0);

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.55));
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
    await page.waitForTimeout(150);

    const dialogClass = await page.locator('[role="dialog"]').getAttribute("class");
    ok("T8: dialog root has z-[9999] class", dialogClass.includes("z-[9999]"), dialogClass);

    const barAfterCount = await page.locator("div.fixed.bottom-0.left-0.right-0.z-40").count();
    ok("T8: sticky bar still in the DOM while popup is open", barAfterCount > 0, `count=${barAfterCount}`);

    const barRect = await page.locator("div.fixed.bottom-0.left-0.right-0.z-40").first().boundingBox();
    const centerX = barRect.x + barRect.width / 2;
    const centerY = barRect.y + barRect.height / 2;
    const isInsideDialog = await page.evaluate(
      ({ x, y }) => {
        const el = document.elementFromPoint(x, y);
        const dlg = document.querySelector('[role="dialog"]');
        return !!dlg && !!el && dlg.contains(el);
      },
      { x: centerX, y: centerY }
    );
    ok("T8: elementFromPoint at the bar's center is inside the dialog (or its backdrop)", isInsideDialog);
    await shot(page, "sentry-t8-zindex-stacking");
  });

  // ---- T9: GA4 events ----
  // Note: the page's own "ga4-init" inline script (app/layout.tsx) defines
  // `function gtag(){dataLayer.push(arguments)}` at page scope, which
  // clobbers any window.gtag stub installed via addInitScript once it runs
  // (Script strategy="afterInteractive", so this happens shortly after
  // hydration, before the popup's 50%-scroll trigger can fire). Since
  // lib/analytics.ts only ever calls window.gtag?.(...), and that function
  // (real or the page's own queueing shim) always ends by pushing its
  // arguments onto window.dataLayer, inspecting window.dataLayer is the
  // reliable way to observe every ga4() call regardless of which gtag
  // implementation is currently installed -- this is also exactly how
  // GA4's real gtag.js consumes the queue, so it is not a workaround, it
  // is the documented mechanism.
  async function dataLayerEvents(page, eventName) {
    const dl = await page.evaluate(() => window.dataLayer || []);
    return dl.filter((entry) => entry && entry[0] === "event" && entry[1] === eventName);
  }

  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.goto(`${AFTER}${BLOG_POST}`);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.55));
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
    await page.waitForTimeout(200);

    const impressionCalls = await dataLayerEvents(page, "newsletter_impression");
    ok("T9: newsletter_impression fires on popup open (observed via window.dataLayer)", impressionCalls.length > 0, JSON.stringify(impressionCalls));
    if (impressionCalls.length > 0) {
      const variant = impressionCalls[0][2]?.variant;
      ok("T9: newsletter_impression carries a variant param (thumbs/classic)", ["thumbs", "classic"].includes(variant), variant);
    }

    // Mocked success -> newsletter_signup fires with source=popup, variant.
    await page.route("**/api/newsletter", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) })
    );
    await page.locator('[role="dialog"] input[type="email"]').fill("reader@example.com");
    await page.locator('[role="dialog"] button[type="submit"]').click();
    await page.waitForTimeout(300);
    const signupCalls = await dataLayerEvents(page, "newsletter_signup");
    ok("T9: newsletter_signup fires on mocked 200 success (observed via window.dataLayer)", signupCalls.length > 0, JSON.stringify(signupCalls));
    if (signupCalls.length > 0) {
      const params = signupCalls[0][2];
      ok("T9: newsletter_signup carries source=popup", params?.source === "popup", JSON.stringify(params));
      ok("T9: newsletter_signup carries a variant param", ["thumbs", "classic"].includes(params?.variant), JSON.stringify(params));
    }
  });

  // T9: no newsletter_signup on a mocked 500, for the sticky bar path too.
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.route("**/api/newsletter", (route) =>
      route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "x" }) })
    );
    await page.goto(`${AFTER}${BLOG_POST}`);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(400);
    const bar = page.locator("div.fixed.bottom-0.left-0.right-0.z-40").first();
    await bar.locator('input[type="email"]').fill("reader@example.com");
    await bar.locator('button[type="submit"]').click();
    await page.waitForTimeout(300);
    const signupCalls = await dataLayerEvents(page, "newsletter_signup");
    ok("T9: newsletter_signup does NOT fire on a mocked 500 (sticky bar path)", signupCalls.length === 0, JSON.stringify(signupCalls));
  });

  // T9: no newsletter_signup on a mocked 500, for the popup path too.
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.route("**/api/newsletter", (route) =>
      route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "x" }) })
    );
    await page.goto(`${AFTER}${BLOG_POST}`);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.55));
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
    await page.locator('[role="dialog"] input[type="email"]').fill("reader@example.com");
    await page.locator('[role="dialog"] button[type="submit"]').click();
    await page.waitForTimeout(300);
    const signupCalls = await dataLayerEvents(page, "newsletter_signup");
    ok("T9: newsletter_signup does NOT fire on a mocked 500 (popup path)", signupCalls.length === 0, JSON.stringify(signupCalls));
  });

  const s = summary();
  process.exit(s.fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
