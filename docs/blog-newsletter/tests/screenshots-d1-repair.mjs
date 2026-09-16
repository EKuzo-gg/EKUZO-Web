// D1 repair re-shots: sticky bar line/error/success visibility at 375px.
// Run with: node docs/blog-newsletter/tests/screenshots-d1-repair.mjs
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

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`) });
  console.log("saved", name);
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

async function main() {
  // sticky-blog-thumbs-375-visible, sticky-blog-classic-375-visible
  for (const variant of ["thumbs", "classic"]) {
    await withPage({ width: 375, height: 800 }, async (page, context) => {
      await setVariant(context, variant);
      await page.goto(`${BASE}${BLOG_POST}`);
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(400);
      await shot(page, `sticky-blog-${variant}-375-visible`);
    });
  }

  // sticky-blog-thumbs-375-error (mocked /api/newsletter 500)
  // Also suppress the scroll-triggered popup for this shot (dismissed
  // "now") so it cannot overlay the sticky bar's error state.
  await withPage({ width: 375, height: 800 }, async (page, context) => {
    await setVariant(context, "thumbs");
    await context.addInitScript(() => {
      try {
        window.localStorage.setItem(
          "ekuzo_nl_blog_dismissed_at",
          String(Date.now())
        );
      } catch {
        /* ignore */
      }
    });
    await page.route("**/api/newsletter", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Failed to subscribe. Please try again." }),
      })
    );
    await page.goto(`${BASE}${BLOG_POST}`);
    await page.evaluate(() => window.scrollTo(0, 320));
    await page.waitForTimeout(400);
    const bar = page.locator("div.fixed.bottom-0.left-0.right-0.z-40");
    await bar.locator('input[type="email"]').fill("reader@example.com");
    await bar.locator('button[type="submit"]').click();
    await page.waitForTimeout(300);
    await shot(page, "sticky-blog-thumbs-375-error");
  });

  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
