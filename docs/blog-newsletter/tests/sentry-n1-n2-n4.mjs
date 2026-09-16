// Sentry Phase 4: N1 (StickyCTA zero-diff), N2 (homepage popup zero-diff),
// N4 (blog article text zero-diff).
import { AFTER, BEFORE, BLOG_POST, BLOG_POST_2, withBrowser, shot, makeRecorder, log } from "./sentry-common.mjs";

const { ok, summary } = makeRecorder();

const N1_ROUTES = [
  "/",
  "/programs/ekuzo-camps",
  "/programs/ekuzo101",
  "/programs/ekuzo100",
  "/programs/ekuzo-teams",
  "/schools",
  "/parents",
  "/programs/ekuzo-camps/register",
];

async function getBarOuterHTML(page) {
  const bar = page.locator("div.fixed.bottom-0.left-0.right-0.z-40").first();
  const count = await bar.count();
  if (count === 0) return null;
  return bar.evaluate((el) => el.outerHTML);
}

// Scroll and wait until the bar has actually settled into its visible
// (translate-y-0) state, or timeout -- avoids a false "diff" from catching
// one page mid-transition while the other already settled.
async function gotoRetry(page, url, opts = {}) {
  // waitUntil: "domcontentloaded" instead of "load" -- this dev server has
  // several pre-existing missing static assets (404s on decorative
  // torn-paper PNGs, per WORKLOG) that take many seconds to resolve under
  // concurrent load, which is irrelevant to what these checks inspect
  // (the sticky bar's DOM / article text), and were stalling navigation.
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000, ...opts });
      return;
    } catch (err) {
      log(`  [retry] goto ${url} attempt ${attempt + 1} failed: ${err.message?.split("\n")[0]}`);
      await page.waitForTimeout(1500);
    }
  }
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000, ...opts });
}

async function scrollAndSettle(page, y) {
  // Scrolling to 600px (> the 300px show threshold) on a normal page
  // should make the bar visible (translate-y-0), unless the page is a
  // checkout page (always hidden) or short enough that the footer is
  // already in view. Wait specifically for translate-y-0 first; only
  // fall back to accepting translate-y-full if it never appears, so a
  // slow CSS transition can't be mistaken for a real before/after diff.
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  const becameVisible = await page
    .waitForFunction(() => {
      const bar = document.querySelector("div.fixed.bottom-0.left-0.right-0.z-40");
      return !!bar && bar.className.includes("translate-y-0");
    }, { timeout: 4000 })
    .then(() => true)
    .catch(() => false);
  if (!becameVisible) {
    await page
      .waitForFunction(() => {
        const bar = document.querySelector("div.fixed.bottom-0.left-0.right-0.z-40");
        return !bar || bar.className.includes("translate-y-full");
      }, { timeout: 3000 })
      .catch(() => {});
  }
  await page.waitForTimeout(400);
}

async function main() {
  await withBrowser(async (browser) => {
    // ---- N1 ----
    for (const route of N1_ROUTES) {
      let beforeHtml1440, afterHtml1440;

      for (const [label, base, target] of [
        ["before", BEFORE, "beforeHtml1440"],
        ["after", AFTER, "afterHtml1440"],
      ]) {
        const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const page = await context.newPage();
        await gotoRetry(page, `${base}${route}`);
        await scrollAndSettle(page, 600);
        const html = await getBarOuterHTML(page);
        if (target === "beforeHtml1440") beforeHtml1440 = html;
        else afterHtml1440 = html;
        const safe = route.replace(/\//g, "_") || "root";
        await shot(page, `n1-${label}${safe}-1440`);
        await context.close();
      }

      for (const [label, base] of [
        ["before", BEFORE],
        ["after", AFTER],
      ]) {
        const context = await browser.newContext({ viewport: { width: 375, height: 800 } });
        const page = await context.newPage();
        await gotoRetry(page, `${base}${route}`);
        await scrollAndSettle(page, 600);
        const safe = route.replace(/\//g, "_") || "root";
        await shot(page, `n1-${label}${safe}-375`);
        await context.close();
      }

      if (route === "/programs/ekuzo-camps/register") {
        // StickyCTA always renders its outer fixed div (visibility is a CSS
        // transform, not a DOM presence toggle) -- "must stay hidden" on
        // the register route means translate-y-full even after scrolling
        // past the show threshold, not literally removed from the DOM.
        // This is true identically before and after (isCheckoutPage logic
        // is untouched by this change), which the byte-equality check below
        // also verifies.
        const beforeHidden = beforeHtml1440 === null || beforeHtml1440.includes("translate-y-full");
        const afterHidden = afterHtml1440 === null || afterHtml1440.includes("translate-y-full");
        ok(`N1: ${route} - bar stays hidden (translate-y-full, or absent) on BEFORE even scrolled past 300px`, beforeHidden, beforeHtml1440?.slice(0, 120));
        ok(`N1: ${route} - bar stays hidden (translate-y-full, or absent) on AFTER even scrolled past 300px`, afterHidden, afterHtml1440?.slice(0, 120));
        ok(
          `N1: ${route} - bar outerHTML byte-identical before vs after`,
          beforeHtml1440 === afterHtml1440,
          beforeHtml1440 === afterHtml1440 ? "identical" : `DIFFERS\n--before--\n${beforeHtml1440}\n--after--\n${afterHtml1440}`
        );
      } else {
        ok(
          `N1: ${route} - bar outerHTML byte-identical before vs after`,
          beforeHtml1440 !== null && afterHtml1440 !== null && beforeHtml1440 === afterHtml1440,
          beforeHtml1440 === afterHtml1440 ? "identical" : `DIFFERS\n--before--\n${beforeHtml1440}\n--after--\n${afterHtml1440}`
        );
      }
    }

    // ---- N2 ----
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      await gotoRetry(page, `${BEFORE}/`);
      // Wait for the dialog with a generous timeout rather than a fixed
      // sleep -- under load, hydration (which the 2.5s setTimeout trigger
      // depends on) can itself take a couple of seconds on a dev server.
      await page.waitForSelector('[role="dialog"]', { timeout: 8000 }).catch(() => {});
      const dialog = page.locator('[role="dialog"]');
      const count = await dialog.count();
      ok("N2: / on 3002 (flag forced on) shows a dialog after 2.5s", count > 0, `count=${count}`);
      if (count > 0) {
        const headline = await dialog.locator("h3").first().innerText();
        ok('N2: headline is "Stay in the loop."', headline === "Stay in the loop.", headline);
        await shot(page, "n2-popup-site-1440-open");
        await shot(page, "popup-site-1440-open"); // T7 reference, exact filename per spec
      }
      await page.locator('[role="dialog"] button[aria-label="Close"]').click().catch(() => {});
      await page.waitForTimeout(150);
      const storageKey = await page.evaluate(() => window.localStorage.getItem("ekuzo_newsletter_dismissed"));
      ok('N2: dismissing sets storage key "ekuzo_newsletter_dismissed"', storageKey === "1", storageKey);
      await context.close();
    }
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      await gotoRetry(page, `${AFTER}/`);
      await page.waitForTimeout(2800);
      const count = await page.locator('[role="dialog"]').count();
      ok("N2: / on 3001 (flag off) shows no dialog", count === 0, `count=${count}`);
      await context.close();
    }

    // ---- N4 ----
    for (const [label, path] of [
      ["gaming-study post", BLOG_POST],
      ["should-you-ban-fortnite post", BLOG_POST_2],
    ]) {
      let beforeText, afterText;
      {
        const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const page = await context.newPage();
        await gotoRetry(page, `${BEFORE}${path}`);
        await page.waitForTimeout(300);
        beforeText = await page.locator("article").first().innerText();
        await context.close();
      }
      {
        const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const page = await context.newPage();
        await gotoRetry(page, `${AFTER}${path}`);
        await page.waitForTimeout(300);
        afterText = await page.locator("article").first().innerText();
        await context.close();
      }
      ok(
        `N4: article innerText identical before/after on ${label}`,
        beforeText === afterText,
        beforeText === afterText ? "identical" : `DIFFERS (lengths: before=${beforeText?.length} after=${afterText?.length})`
      );
    }
  });

  const s = summary();
  process.exit(s.fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
