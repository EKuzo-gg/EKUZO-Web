// Steward Phase 4 rendered-evidence capture + innerText extraction.
// One browser for the whole run (the box is loaded); one context per step.
// Usage: node docs/blog-newsletter/tests/steward-rendered.mjs <stepName...>
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const AFTER = "http://localhost:3001";
const BEFORE = "http://localhost:3002";
const OUT_DIR = path.resolve("docs/blog-newsletter/screenshots");
fs.mkdirSync(OUT_DIR, { recursive: true });
const CHROMIUM_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const BLOG_POST = "/blog/gaming-study-13-7-years-younger-what-it-means-for-kids";
const JAMIE_POST = "/blog/when-your-sons-only-friends-are-online";

const log = [];
const LIVE_LOG = path.resolve("docs/blog-newsletter/tests/steward-rendered-live.txt");
function say(...a) {
  const s = a.map((x) => (typeof x === "string" ? x : JSON.stringify(x, null, 1))).join(" ");
  log.push(s);
  console.log(s);
  try {
    fs.appendFileSync(LIVE_LOG, s + "\n");
  } catch {}
}

let browser;

async function step(name, viewport, fn, variant) {
  let context;
  try {
    context = await browser.newContext({ viewport });
    if (variant) {
      await context.addInitScript((v) => {
        try {
          window.localStorage.setItem("ekuzo_nl_variant", v);
        } catch {}
      }, variant);
    }
    // Block every non-localhost request: this box routes egress through a
    // proxy that stalls, and third-party beacons are irrelevant to the review.
    await context.route("**/*", (route) => {
      const u = route.request().url();
      if (u.startsWith("http://localhost") || u.startsWith("data:") || u.startsWith("blob:")) {
        return route.continue();
      }
      return route.abort();
    });
    const page = await context.newPage();
    page.setDefaultNavigationTimeout(120000);
    page.setDefaultTimeout(25000);
    await fn(page, context);
    say("STEP OK", name);
  } catch (e) {
    say("STEP ERROR", name, e.message.split("\n")[0]);
  } finally {
    try {
      await context?.close();
    } catch {}
  }
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`) });
  say("SAVED", name);
}

// --- extractors, run in page ---
const DIALOG_PROBE = () => {
  const d = document.querySelector('[role="dialog"]');
  if (!d) return { found: false };
  const leaves = [];
  d.querySelectorAll("*").forEach((el) => {
    if (el.children.length === 0 && el.textContent.trim()) {
      const cs = getComputedStyle(el);
      leaves.push({
        raw: el.textContent,
        tt: cs.textTransform,
        display: cs.display,
        fs: cs.fontSize,
        ls: cs.letterSpacing,
      });
    }
  });
  const inputs = [...d.querySelectorAll("input,select,textarea")].map((el) => ({
    type: el.type,
    ph: el.placeholder,
  }));
  const r = d.getBoundingClientRect();
  return {
    found: true,
    label: d.getAttribute("aria-label"),
    role: d.getAttribute("role"),
    modal: d.getAttribute("aria-modal"),
    cls: d.className,
    box: { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) },
    text: d.innerText,
    leaves,
    inputs,
  };
};

const BAR_PROBE = () => {
  const bars = [...document.querySelectorAll("div")].filter((d) => {
    const cs = getComputedStyle(d);
    return cs.position === "fixed" && d.className.includes("bottom-0");
  });
  const bar = bars.find((b) => b.querySelector('input[type="email"]')) || bars[0];
  if (!bar) return { found: false, n: bars.length };
  const cs = getComputedStyle(bar);
  const r = bar.getBoundingClientRect();
  const leaves = [];
  bar.querySelectorAll("*").forEach((el) => {
    if (el.children.length === 0 && el.textContent.trim()) {
      const c2 = getComputedStyle(el);
      leaves.push({
        raw: el.textContent,
        tt: c2.textTransform,
        display: c2.display,
        fs: c2.fontSize,
        ls: c2.letterSpacing,
        cls: el.className,
      });
    }
  });
  const inner = bar.firstElementChild;
  const ics = inner ? getComputedStyle(inner) : null;
  return {
    found: true,
    cls: bar.className,
    box: { w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y) },
    bg: cs.backgroundColor,
    padOuter: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft],
    innerCls: inner?.className,
    padInner: ics ? [ics.paddingTop, ics.paddingRight, ics.paddingBottom, ics.paddingLeft] : null,
    text: bar.innerText,
    leaves,
    emailPh: bar.querySelector('input[type="email"]')?.placeholder ?? null,
  };
};

const FORM_PROBE = () => {
  const f = document.querySelector("form");
  if (!f) return { found: false };
  const host = f.closest("div[class*=fixed]") || f.parentElement;
  const fields = [...f.querySelectorAll("input,textarea,select")].map((el) => ({
    tag: el.tagName,
    name: el.name,
    type: el.type,
    ph: el.placeholder,
    cls: el.className,
  }));
  const sel = f.querySelector("select");
  return {
    found: true,
    text: host.innerText,
    fields,
    options: sel ? [...sel.options].map((o) => [o.value, o.text]) : null,
    selCls: sel?.className ?? null,
  };
};

async function openContact(page, base, w) {
  await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(1200);
  await page.click("text=Talk to Humans", { timeout: 20000 });
  await page.waitForSelector("form", { timeout: 20000 });
  await page.waitForTimeout(800);
}

async function openBlogPopup(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.6));
  await page.waitForSelector('[role="dialog"]', { timeout: 25000 });
  await page.waitForTimeout(600);
}

async function showBar(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(1200);
}

const STEPS = {
  contactBefore: async () => {
    for (const w of [1440, 375]) {
      await step(`contact-before-${w}`, { width: w, height: w === 1440 ? 900 : 800 }, async (page) => {
        await openContact(page, BEFORE, w);
        await shot(page, `steward-contact-before-${w}-open`);
        say(`### contact-before-${w}`, await page.evaluate(FORM_PROBE));
      });
    }
  },
  contactAfter: async () => {
    for (const w of [1440, 375]) {
      await step(`contact-after-${w}`, { width: w, height: w === 1440 ? 900 : 800 }, async (page) => {
        await openContact(page, AFTER, w);
        await shot(page, `steward-contact-after-${w}-open`);
        say(`### contact-after-${w}`, await page.evaluate(FORM_PROBE));
      });
    }
  },
  popupSite: async () => {
    for (const w of [1440, 375]) {
      await step(`popup-site-${w}`, { width: w, height: w === 1440 ? 900 : 800 }, async (page) => {
        await page.goto(`${BEFORE}/`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(6000);
        await page.waitForSelector('[role="dialog"]', { timeout: 25000 });
        await page.waitForTimeout(600);
        await shot(page, `steward-popup-site-${w}-open`);
        say(`### popup-site-${w}`, await page.evaluate(DIALOG_PROBE));
      });
    }
  },
  popupBlog: async () => {
    for (const variant of ["thumbs", "classic"]) {
      for (const w of [1440, 375]) {
        await step(
          `popup-blog-${variant}-${w}`,
          { width: w, height: w === 1440 ? 900 : 800 },
          async (page) => {
            await openBlogPopup(page, `${AFTER}${BLOG_POST}`);
            say(`### popup-blog-${variant}-${w}`, await page.evaluate(DIALOG_PROBE));
          },
          variant
        );
      }
    }
  },
  barCamps: async () => {
    for (const w of [1440, 375]) {
      await step(`bar-camps-${w}`, { width: w, height: w === 1440 ? 900 : 800 }, async (page) => {
        await showBar(page, `${AFTER}/programs/ekuzo-camps`);
        say(`### bar-camps-${w}`, await page.evaluate(BAR_PROBE));
      });
    }
  },
  barBlog: async () => {
    for (const variant of ["thumbs", "classic"]) {
      for (const w of [1440, 375]) {
        await step(
          `bar-blog-${variant}-${w}`,
          { width: w, height: w === 1440 ? 900 : 800 },
          async (page) => {
            await showBar(page, `${AFTER}${BLOG_POST}`);
            say(`### bar-blog-${variant}-${w}`, await page.evaluate(BAR_PROBE));
          },
          variant
        );
      }
    }
  },
  jamie: async () => {
    for (const w of [1440, 375]) {
      await step(
        `jamie-${w}`,
        { width: w, height: w === 1440 ? 900 : 800 },
        async (page) => {
          await page.goto(`${AFTER}${JAMIE_POST}`, { waitUntil: "domcontentloaded" });
          await page.waitForTimeout(2500);
          const head = await page.evaluate(() => {
            const a = document.querySelector("article") || document.body;
            return a.innerText.slice(0, 900);
          });
          say(`### jamie-post-head-${w}\n${head}`);
          await page.evaluate(() =>
            window.scrollTo(0, document.documentElement.scrollHeight * 0.6)
          );
          await page.waitForSelector('[role="dialog"]', { timeout: 25000 });
          await page.waitForTimeout(600);
          await shot(page, `steward-popup-jamiepost-thumbs-${w}-open`);
          say(`### popup-on-jamie-post-${w}`, await page.evaluate(DIALOG_PROBE));
        },
        "thumbs"
      );
    }
  },
  barStates: async () => {
    // sticky thumbs success + error text at 375 and 1440, via mocked API
    for (const w of [375, 1440]) {
      for (const [label, status] of [
        ["success", 200],
        ["error", 500],
      ]) {
        await step(
          `bar-state-${label}-${w}`,
          { width: w, height: w === 1440 ? 900 : 800 },
          async (page) => {
            await page.route("**/api/newsletter", (route) =>
              route.fulfill({
                status,
                contentType: "application/json",
                body: JSON.stringify(status === 200 ? { success: true } : { error: "nope" }),
              })
            );
            await showBar(page, `${AFTER}${BLOG_POST}`);
            await page.fill('input[type="email"]', "reader@example.com");
            await page.keyboard.press("Enter");
            await page.waitForTimeout(1200);
            say(`### bar-state-${label}-${w}`, await page.evaluate(BAR_PROBE));
          },
          "thumbs"
        );
      }
    }
  },
};

async function main() {
  const want = process.argv.slice(2).filter((a) => STEPS[a]);
  const names = want.length ? want : Object.keys(STEPS);
  browser = await chromium.launch({ executablePath: CHROMIUM_PATH });
  try {
    for (const n of names) {
      say(`\n===== ${n} =====`);
      await STEPS[n]();
    }
  } finally {
    await browser.close();
    const out = path.resolve(
      `docs/blog-newsletter/tests/steward-rendered-output-${names.join("-")}.txt`
    );
    fs.writeFileSync(out, log.join("\n") + "\n");
    console.log("wrote", out);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
