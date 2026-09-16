// Verification script for repair cycle 2 (SC-01: logo, close-button
// collision, re-centering).
// Run with: node docs/blog-newsletter/tests/verify-sc01.mjs
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

function overlaps(a, b) {
  if (!a || !b) return false;
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

async function openPopupByScroll(page) {
  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight * 0.55);
  });
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
  await page.waitForTimeout(200);
}

async function main() {
  const viewports = [
    { width: 320, height: 568 },
    { width: 375, height: 667 },
    { width: 375, height: 800 },
    { width: 375, height: 812 },
  ];

  for (const vp of viewports) {
    for (const variant of ["thumbs", "classic"]) {
      await withPage(vp, async (page, context) => {
        await setVariant(context, variant);
        await page.goto(`${BASE}${BLOG_POST}`);
        await openPopupByScroll(page);

        const closeBox = await page.locator('[role="dialog"] button[aria-label="Close"]').boundingBox();

        // Item 1: logo visible below lg.
        const logoVisible = await page
          .locator('[role="dialog"] img[alt="EKUZO"]')
          .isVisible();
        check(
          `${variant} @ ${vp.width}x${vp.height}: EKUZO logo visible below lg`,
          logoVisible,
          "logo not visible"
        );

        // Item 2: no overlap between close button and any text node.
        const textBoxes = await page.evaluate(() => {
          const dialog = document.querySelector('[role="dialog"]');
          const walker = document.createTreeWalker(dialog, NodeFilter.SHOW_TEXT);
          const boxes = [];
          let node;
          while ((node = walker.nextNode())) {
            if (!node.textContent.trim()) continue;
            const range = document.createRange();
            range.selectNodeContents(node);
            const rects = range.getClientRects();
            for (const r of rects) {
              if (r.width > 0 && r.height > 0) {
                boxes.push({ x: r.x, y: r.y, width: r.width, height: r.height });
              }
            }
          }
          return boxes;
        });
        const overlappingText = textBoxes.some((b) => overlaps(closeBox, b));
        check(
          `${variant} @ ${vp.width}x${vp.height}: close button does not overlap any text`,
          !overlappingText,
          `closeBox: ${JSON.stringify(closeBox)}`
        );

        // Submit and microcopy reachable (scroll the pane to the bottom).
        // The scrollable element is the inner overflow-y-auto div (a
        // sibling of the pinned close button), not the outer pane.
        const pane = page.locator('[role="dialog"] div.overflow-y-auto');
        await pane.evaluate((el) => {
          el.scrollTop = el.scrollHeight;
        });
        await page.waitForTimeout(100);
        const submitBox = await page
          .locator('[role="dialog"] form button[type="submit"]')
          .boundingBox();
        const microcopyBox = await page
          .locator('[role="dialog"] p:has-text("No spam")')
          .boundingBox();
        check(
          `${variant} @ ${vp.width}x${vp.height}: submit reachable after scrolling the pane`,
          submitBox &&
            submitBox.y >= 0 &&
            submitBox.y + submitBox.height <= vp.height,
          `submitBox: ${JSON.stringify(submitBox)}`
        );
        check(
          `${variant} @ ${vp.width}x${vp.height}: microcopy reachable after scrolling the pane`,
          microcopyBox &&
            microcopyBox.y >= 0 &&
            microcopyBox.y + microcopyBox.height <= vp.height,
          `microcopyBox: ${JSON.stringify(microcopyBox)}`
        );

        // Scroll back to top for a clean screenshot / measurement.
        await pane.evaluate((el) => {
          el.scrollTop = 0;
        });
        await page.waitForTimeout(100);
      });
    }
  }

  // Empty space below the microcopy at 375x800, thumbs (report only).
  await withPage({ width: 375, height: 800 }, async (page, context) => {
    await setVariant(context, "thumbs");
    await page.goto(`${BASE}${BLOG_POST}`);
    await openPopupByScroll(page);

    const microcopyBox = await page
      .locator('[role="dialog"] p:has-text("No spam")')
      .boundingBox();
    const closeBox = await page
      .locator('[role="dialog"] button[aria-label="Close"]')
      .boundingBox();
    const contentTopBox = await page
      .locator('[role="dialog"] img[alt="EKUZO"]')
      .boundingBox();

    const spaceBelow = 800 - (microcopyBox.y + microcopyBox.height);
    const spaceAbove = contentTopBox.y;
    console.log("");
    console.log(
      `INFO 375x800 thumbs: space above content top (logo) = ${spaceAbove.toFixed(
        1
      )}px, space below microcopy = ${spaceBelow.toFixed(1)}px`
    );
    console.log(
      `INFO 375x800 thumbs: close button box = ${JSON.stringify(closeBox)}, logo box = ${JSON.stringify(contentTopBox)}`
    );
  });

  // ── Screenshots requested ────────────────────────────────────────
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
  await withPage({ width: 320, height: 568 }, async (page, context) => {
    await setVariant(context, "classic");
    await page.goto(`${BASE}${BLOG_POST}`);
    await openPopupByScroll(page);
    await shot(page, "popup-blog-classic-320-open");
  });

  console.log("");
  console.log(failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
