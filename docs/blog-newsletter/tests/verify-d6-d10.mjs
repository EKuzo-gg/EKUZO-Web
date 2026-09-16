// Verification script for repair cycle 1 (D6, D7, D8, D9, D10).
// Run with: node docs/blog-newsletter/tests/verify-d6-d10.mjs
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const BASE = "http://localhost:3001";
const OUT_DIR = path.resolve("docs/blog-newsletter/screenshots");
fs.mkdirSync(OUT_DIR, { recursive: true });
const BLOG_POST = "/blog/gaming-study-13-7-years-younger-what-it-means-for-kids";
const CHROMIUM_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

async function withPage(viewport, fn) {
  const browser = await chromium.launch({ executablePath: CHROMIUM_PATH });
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  try {
    await fn(page, context);
  } finally {
    await browser.close();
  }
}

async function setVariant(context, variant) {
  await context.addInitScript((v) => {
    try {
      window.localStorage.setItem("ekuzo_nl_variant", v);
    } catch {
      /* ignore */
    }
  }, variant);
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`) });
  console.log("saved", name);
}

let failures = 0;
function check(label, cond, detail) {
  if (cond) {
    console.log(`PASS: ${label}`);
  } else {
    failures++;
    console.log(`FAIL: ${label} -- ${detail}`);
  }
}

async function openPopupByScroll(page) {
  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight * 0.55);
  });
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
  await page.waitForTimeout(200);
}

async function main() {
  // ── D6: popup mobile fit at 375x812 and 375x667 ─────────────────────
  for (const vp of [
    { width: 375, height: 812 },
    { width: 375, height: 667 },
  ]) {
    await withPage(vp, async (page, context) => {
      await setVariant(context, "thumbs");
      await page.goto(`${BASE}${BLOG_POST}`);
      await openPopupByScroll(page);

      const submitBox = await page.locator('[role="dialog"] form button[type="submit"]').boundingBox();
      const withinViewport = submitBox && submitBox.y + submitBox.height <= vp.height;

      // Scroll the pane to the bottom and re-measure the button and
      // microcopy: they must be reachable even if not visible up front.
      const pane = page.locator('[role="dialog"] > div').nth(1);
      await pane.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      await page.waitForTimeout(100);
      const submitBoxAfterScroll = await page
        .locator('[role="dialog"] form button[type="submit"]')
        .boundingBox();
      const microcopyBoxAfterScroll = await page
        .locator('[role="dialog"] p:has-text("No spam")')
        .boundingBox();

      check(
        `D6 @ ${vp.width}x${vp.height}: submit reachable after scrolling the pane`,
        submitBoxAfterScroll &&
          submitBoxAfterScroll.y >= 0 &&
          submitBoxAfterScroll.y + submitBoxAfterScroll.height <= vp.height,
        `submit box after scroll: ${JSON.stringify(submitBoxAfterScroll)}`
      );
      check(
        `D6 @ ${vp.width}x${vp.height}: microcopy visible after scrolling the pane`,
        microcopyBoxAfterScroll &&
          microcopyBoxAfterScroll.y >= 0 &&
          microcopyBoxAfterScroll.y + microcopyBoxAfterScroll.height <= vp.height,
        `microcopy box after scroll: ${JSON.stringify(microcopyBoxAfterScroll)}`
      );
      console.log(
        `  (info) fits without scrolling at ${vp.width}x${vp.height}: ${withinViewport}`
      );
    });
  }

  // ── D6 screenshots requested ──────────────────────────────────────
  for (const variant of ["thumbs", "classic"]) {
    await withPage({ width: 375, height: 812 }, async (page, context) => {
      await setVariant(context, variant);
      await page.goto(`${BASE}${BLOG_POST}`);
      await openPopupByScroll(page);
      await shot(page, `popup-blog-${variant}-375-open`);
    });
  }
  await withPage({ width: 375, height: 667 }, async (page, context) => {
    await setVariant(context, "thumbs");
    await page.goto(`${BASE}${BLOG_POST}`);
    await openPopupByScroll(page);
    await shot(page, "popup-blog-thumbs-375x667-open");
  });

  // ── D7: sticky success suppresses the popup ─────────────────────────
  await withPage({ width: 1440, height: 900 }, async (page, context) => {
    await setVariant(context, "thumbs");
    await page.route("**/api/newsletter", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      })
    );
    await page.goto(`${BASE}${BLOG_POST}`);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);

    const bar = page.locator("div.fixed.bottom-0.left-0.right-0.z-40");
    await bar.locator('input[type="email"]').fill("reader@example.com");
    await bar.locator('button[type="submit"]').click();
    await page.waitForTimeout(300);

    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight * 0.6);
    });
    await page.waitForTimeout(500);
    const dialogAfterSignup = await page.locator('[role="dialog"]').count();
    check(
      "D7: no popup dialog after a sticky-bar success + scroll to 60%",
      dialogAfterSignup === 0,
      `dialog count: ${dialogAfterSignup}`
    );

    const subscribedAt = await page.evaluate(() =>
      window.localStorage.getItem("ekuzo_nl_blog_subscribed_at")
    );
    check(
      "D7: ekuzo_nl_blog_subscribed_at is written after a sticky-bar success",
      subscribedAt !== null,
      `value: ${subscribedAt}`
    );

    await page.reload();
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight * 0.6);
    });
    await page.waitForTimeout(500);
    const dialogAfterReload = await page.locator('[role="dialog"]').count();
    check(
      "D7: no popup dialog after reload + scroll to 60%",
      dialogAfterReload === 0,
      `dialog count: ${dialogAfterReload}`
    );
  });

  // ── D8: tablet clipping check at 640, 768, 820, 890, 1024 ───────────
  for (const width of [640, 768, 820, 890, 1024]) {
    await withPage({ width, height: 900 }, async (page, context) => {
      await setVariant(context, "thumbs");
      await page.goto(`${BASE}${BLOG_POST}`);
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(300);

      const bar = page.locator("div.fixed.bottom-0.left-0.right-0.z-40");
      const buttonBox = await bar.locator('button[type="submit"]').boundingBox();
      const buttonText = await bar.locator('button[type="submit"]').innerText();
      const fits =
        buttonBox &&
        buttonBox.x >= 0 &&
        buttonBox.x + buttonBox.width <= width &&
        buttonText.trim() === "Try it";
      check(
        `D8 @ ${width}px: full "Try it" label visible and inside the bar`,
        fits,
        `box: ${JSON.stringify(buttonBox)}, text: "${buttonText}"`
      );

      if (width === 768 || width === 820) {
        await shot(page, `sticky-blog-thumbs-${width}-visible`);
      }
    });
  }

  // ── D9: body scroll lock + focus trap ────────────────────────────────
  await withPage({ width: 1440, height: 900 }, async (page, context) => {
    await setVariant(context, "thumbs");
    await page.goto(`${BASE}${BLOG_POST}`);
    await openPopupByScroll(page);

    const bodyOverflow = await page.evaluate(
      () => getComputedStyle(document.body).overflow
    );
    check(
      "D9: document.body overflow is hidden while the dialog is open",
      bodyOverflow === "hidden",
      `overflow: ${bodyOverflow}`
    );

    // Tab-trap: focus the last focusable element, then Tab once more,
    // expect focus to wrap to the first.
    const focusableCount = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const selector =
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      return dialog.querySelectorAll(selector).length;
    });
    // Focus the last element directly, then Tab forward once.
    await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const selector =
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const els = Array.from(dialog.querySelectorAll(selector)).filter(
        (el) => el.offsetParent !== null
      );
      els[els.length - 1].focus();
    });
    await page.keyboard.press("Tab");
    const wrappedToFirst = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const selector =
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const els = Array.from(dialog.querySelectorAll(selector)).filter(
        (el) => el.offsetParent !== null
      );
      return document.activeElement === els[0];
    });
    check(
      "D9: Tab from the last focusable element wraps to the first",
      wrappedToFirst,
      `focusableCount: ${focusableCount}`
    );

    // Shift+Tab from the first should wrap to the last.
    await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const selector =
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const els = Array.from(dialog.querySelectorAll(selector)).filter(
        (el) => el.offsetParent !== null
      );
      els[0].focus();
    });
    await page.keyboard.press("Shift+Tab");
    const wrappedToLast = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const selector =
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const els = Array.from(dialog.querySelectorAll(selector)).filter(
        (el) => el.offsetParent !== null
      );
      return document.activeElement === els[els.length - 1];
    });
    check(
      "D9: Shift+Tab from the first focusable element wraps to the last",
      wrappedToLast,
      ""
    );

    // Close and confirm body overflow restored.
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    const bodyOverflowAfterClose = await page.evaluate(
      () => document.body.style.overflow
    );
    check(
      "D9: document.body overflow restored after close",
      bodyOverflowAfterClose === "" || bodyOverflowAfterClose === "visible",
      `overflow: "${bodyOverflowAfterClose}"`
    );
  });

  // ── D10: byline contrast, on both pane backgrounds ───────────────────
  // Below lg the right pane is purple (#7B3AAF, mobile/tablet); at lg and
  // up it is navy (#1A1A2E, desktop). Check the byline against whichever
  // background is actually rendered at each viewport.
  for (const { vp, label } of [
    { vp: { width: 375, height: 812 }, label: "purple pane (below lg)" },
    { vp: { width: 1440, height: 900 }, label: "navy pane (lg and up)" },
  ]) {
    await withPage(vp, async (page, context) => {
      await setVariant(context, "thumbs");
      await page.goto(`${BASE}${BLOG_POST}`);
      await openPopupByScroll(page);

      const contrast = await page.evaluate(() => {
        // Use a canvas to resolve whatever color space getComputedStyle
        // returns (oklab, rgb, etc.) down to actual sRGB bytes, the same
        // way the browser paints the pixel, rather than parsing the CSS
        // string ourselves.
        function toRgb(colorStr, overBg) {
          const canvas = document.createElement("canvas");
          canvas.width = 1;
          canvas.height = 1;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = overBg;
          ctx.fillRect(0, 0, 1, 1);
          ctx.fillStyle = colorStr;
          ctx.fillRect(0, 0, 1, 1);
          return Array.from(ctx.getImageData(0, 0, 1, 1).data.slice(0, 3));
        }
        function luminance(r, g, b) {
          const [rs, gs, bs] = [r, g, b].map((c) => {
            const s = c / 255;
            return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        }
        const byline = Array.from(document.querySelectorAll('[role="dialog"] p')).find(
          (p) => p.textContent.includes("Karlin Oei, founder, EKUZO")
        );
        const paneEl = byline.closest('div[class*="bg-[#7B3AAF]"]');
        const paneBgColor = getComputedStyle(paneEl).backgroundColor;
        const color = getComputedStyle(byline).color;
        // Painting the (semi-transparent) text color over the pane's
        // actual computed background via canvas gives the effective
        // rendered RGB, same as what the eye actually sees.
        const [pr, pg, pb] = toRgb(paneBgColor, "#000000");
        const [er, eg, eb] = toRgb(color, paneBgColor);
        const lumText = luminance(er, eg, eb);
        const lumBg = luminance(pr, pg, pb);
        const lighter = Math.max(lumText, lumBg);
        const darker = Math.min(lumText, lumBg);
        const ratio = (lighter + 0.05) / (darker + 0.05);
        return { color, paneBgColor, effective: [er, eg, eb], ratio };
      });
      check(
        `D10: byline contrast is at least 4.5:1 on the ${label}`,
        contrast.ratio >= 4.5,
        `computed: ${JSON.stringify(contrast)}`
      );
    });
  }

  console.log("");
  console.log(failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
