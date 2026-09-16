// Shared helpers for Sentry's Playwright scripts (Phase 4 verification).
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

export const AFTER = "http://localhost:3001";
export const BEFORE = "http://localhost:3002";
export const BLOG_POST = "/blog/gaming-study-13-7-years-younger-what-it-means-for-kids";
export const BLOG_POST_2 = "/blog/should-you-ban-fortnite";
export const CHROMIUM_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
export const OUT_DIR = path.resolve("docs/blog-newsletter/screenshots");
fs.mkdirSync(OUT_DIR, { recursive: true });

export function log(...args) {
  console.log(...args);
}

export async function withBrowser(fn) {
  const browser = await chromium.launch({ executablePath: CHROMIUM_PATH });
  try {
    await fn(browser);
  } finally {
    await browser.close();
  }
}

export async function withPage(viewport, fn, opts = {}) {
  return withBrowser(async (browser) => {
    const context = await browser.newContext({ viewport, ...opts });
    const page = await context.newPage();
    try {
      return await fn(page, context);
    } finally {
      await context.close();
    }
  });
}

export async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`) });
  log("saved screenshot:", name);
}

export async function setVariant(context, variant) {
  await context.addInitScript((v) => {
    try {
      window.localStorage.setItem("ekuzo_nl_variant", v);
    } catch {
      /* ignore */
    }
  }, variant);
}

// Simple assertion helpers that record pass/fail into a results array
// instead of throwing immediately, so one script can run many checks and
// report all failures instead of stopping at the first one.
export function makeRecorder() {
  const results = [];
  function ok(name, cond, detail) {
    results.push({ name, pass: !!cond, detail: detail ?? "" });
    log((cond ? "PASS" : "FAIL") + " - " + name + (detail ? ` (${detail})` : ""));
  }
  function summary() {
    const pass = results.filter((r) => r.pass).length;
    const fail = results.length - pass;
    log(`\n=== SUMMARY: ${pass} passed, ${fail} failed, ${results.length} total ===`);
    return { pass, fail, total: results.length, results };
  }
  return { ok, summary, results };
}
