// Screenshot capture script for the blog newsletter A/B work.
// Run with: node docs/blog-newsletter/screenshots-script.mjs
// Requires the dev server running on http://localhost:3001.
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
  // 1. sticky-camps-1440-visible (reference)
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.goto(`${BASE}/programs/ekuzo-camps`);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(400);
    await shot(page, "sticky-camps-1440-visible");
  });

  // 2/3. sticky-blog-thumbs / classic at 1440
  for (const variant of ["thumbs", "classic"]) {
    await withPage({ width: 1440, height: 900 }, async (page, context) => {
      await setVariant(context, variant);
      await page.goto(`${BASE}${BLOG_POST}`);
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(400);
      await shot(page, `sticky-blog-${variant}-1440-visible`);
    });
  }

  // 4. sticky-camps-375-visible + sticky-blog-*-375-visible
  await withPage({ width: 375, height: 800 }, async (page) => {
    await page.goto(`${BASE}/programs/ekuzo-camps`);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(400);
    await shot(page, "sticky-camps-375-visible");
  });

  for (const variant of ["thumbs", "classic"]) {
    await withPage({ width: 375, height: 800 }, async (page, context) => {
      await setVariant(context, variant);
      await page.goto(`${BASE}${BLOG_POST}`);
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(400);
      await shot(page, `sticky-blog-${variant}-375-visible`);
    });
  }

  // 5/6. popup-blog-thumbs/classic-1440-open
  for (const variant of ["thumbs", "classic"]) {
    await withPage({ width: 1440, height: 900 }, async (page, context) => {
      await setVariant(context, variant);
      await page.goto(`${BASE}${BLOG_POST}`);
      await page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight * 0.55);
      });
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      await page.waitForTimeout(300);
      await shot(page, `popup-blog-${variant}-1440-open`);
    });
  }

  // 7. popup-blog-thumbs/classic-375-open
  for (const variant of ["thumbs", "classic"]) {
    await withPage({ width: 375, height: 800 }, async (page, context) => {
      await setVariant(context, variant);
      await page.goto(`${BASE}${BLOG_POST}`);
      await page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight * 0.55);
      });
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      await page.waitForTimeout(300);
      await shot(page, `popup-blog-${variant}-375-open`);
    });
  }

  // 8. popup-blog-thumbs-1440-success (mocked /api/newsletter 200)
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
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight * 0.55);
    });
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.fill('[role="dialog"] input[type="email"]', "reader@example.com");
    await page.click('[role="dialog"] button[type="submit"]');
    await page.waitForTimeout(200);
    await shot(page, "popup-blog-thumbs-1440-success");
  });

  // 9. contact-after-1440-open (sticky bar "Talk to Humans" on a non-blog page)
  await withPage({ width: 1440, height: 900 }, async (page) => {
    await page.goto(`${BASE}/`);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(400);
    await page.click("text=Talk to Humans");
    await page.waitForSelector("text=How did you hear about us?", { timeout: 5000 });
    await page.waitForTimeout(200);
    await shot(page, "contact-after-1440-open");
  });

  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
