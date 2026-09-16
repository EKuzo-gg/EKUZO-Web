// Steward: focused rendered measurements for the T7 parity gate.
// Writes incrementally to docs/blog-newsletter/tests/steward-measure-live.txt
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const AFTER = "http://localhost:3001";
const BEFORE = "http://localhost:3002";
const BLOG_POST = "/blog/gaming-study-13-7-years-younger-what-it-means-for-kids";
const JAMIE_POST = "/blog/when-your-sons-only-friends-are-online";
const OUT_DIR = path.resolve("docs/blog-newsletter/screenshots");
const LIVE = path.resolve("docs/blog-newsletter/tests/steward-measure-live.txt");
const CHROMIUM_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

function say(...a) {
  const s = a.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join(" ");
  console.log(s);
  fs.appendFileSync(LIVE, s + "\n");
}

const POPUP_GEOM = () => {
  const d = document.querySelector('[role="dialog"]');
  if (!d) return { found: false };
  const btn = d.querySelector('button[type="submit"]');
  const micro = [...d.querySelectorAll("p")].pop();
  const eyebrow = [...d.querySelectorAll("p")].find(
    (p) => getComputedStyle(p).textTransform === "uppercase"
  );
  const r = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { top: Math.round(b.top), bottom: Math.round(b.bottom), h: Math.round(b.height) };
  };
  const root = d.getBoundingClientRect();
  return {
    found: true,
    vh: window.innerHeight,
    vw: window.innerWidth,
    dialog: r(d),
    scrollH: d.scrollHeight,
    overflowY: getComputedStyle(d).overflowY,
    submit: r(btn),
    submitText: btn?.textContent,
    submitInView: btn ? btn.getBoundingClientRect().bottom <= window.innerHeight : null,
    micro: r(micro),
    microText: micro?.textContent,
    microInView: micro ? micro.getBoundingClientRect().bottom <= window.innerHeight : null,
    eyebrowText: eyebrow?.textContent ?? null,
    eyebrowRendered: eyebrow ? eyebrow.innerText : null,
    eyebrowVisible: eyebrow ? eyebrow.getBoundingClientRect().width > 0 : null,
    innerText: d.innerText,
    rootBox: { w: Math.round(root.width), h: Math.round(root.height) },
  };
};

const BAR_GEOM = () => {
  const bars = [...document.querySelectorAll("div")].filter((d) => {
    const cs = getComputedStyle(d);
    return cs.position === "fixed" && d.className.includes("bottom-0");
  });
  const bar = bars.find((b) => b.querySelector('input[type="email"]')) || bars[0];
  if (!bar) return { found: false };
  const inner = bar.querySelector("div.flex.items-center.justify-center") || bar.firstElementChild;
  const cs = getComputedStyle(inner);
  const b = bar.getBoundingClientRect();
  const leaves = [];
  bar.querySelectorAll("span,button,a").forEach((el) => {
    if (el.children.length === 0 && el.textContent.trim()) {
      const c = getComputedStyle(el);
      leaves.push({
        raw: el.textContent,
        shown: el.innerText,
        display: c.display,
        tt: c.textTransform,
        fs: c.fontSize,
        color: c.color,
      });
    }
  });
  return {
    found: true,
    vw: window.innerWidth,
    barH: Math.round(b.height),
    barTop: Math.round(b.top),
    innerPad: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft],
    innerBg: cs.backgroundColor,
    outerCls: bar.className,
    innerText: bar.innerText,
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
    cls: el.className,
  }));
  const sel = f.querySelector("select");
  const r = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { h: Math.round(b.height), w: Math.round(b.width) };
  };
  return {
    found: true,
    vw: window.innerWidth,
    text: host.innerText,
    fields,
    selBox: r(sel),
    msgBox: r(f.querySelector("textarea")),
    emailBox: r(f.querySelector('input[type="email"]')),
    options: sel ? [...sel.options].map((o) => [o.value, o.text]) : null,
  };
};

async function run() {
  const browser = await chromium.launch({ executablePath: CHROMIUM_PATH });
  const doStep = async (name, viewport, variant, fn) => {
    let ctx;
    try {
      ctx = await browser.newContext({ viewport });
      if (variant) {
        await ctx.addInitScript((v) => {
          try {
            window.localStorage.setItem("ekuzo_nl_variant", v);
          } catch {}
        }, variant);
      }
      const page = await ctx.newPage();
      page.setDefaultNavigationTimeout(90000);
      page.setDefaultTimeout(30000);
      await fn(page);
    } catch (e) {
      say("STEP ERROR", name, e.message.split("\n")[0]);
    } finally {
      try {
        await ctx?.close();
      } catch {}
    }
  };

  // 1. blog popups at 375x800 and 375x667 and 1440x900
  for (const variant of ["thumbs", "classic"]) {
    for (const vp of [
      { width: 375, height: 800 },
      { width: 375, height: 667 },
      { width: 1440, height: 900 },
    ]) {
      const tag = `popup-${variant}-${vp.width}x${vp.height}`;
      await doStep(tag, vp, variant, async (page) => {
        await page.goto(`${AFTER}${BLOG_POST}`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(2500);
        await page.evaluate(() =>
          window.scrollTo(0, document.documentElement.scrollHeight * 0.6)
        );
        await page.waitForSelector('[role="dialog"]', { timeout: 30000 });
        await page.waitForTimeout(2500);
        say(`### ${tag}`, await page.evaluate(POPUP_GEOM));
        if (vp.height === 667 || (vp.width === 1440 && variant === "thumbs")) {
          await page.screenshot({ path: path.join(OUT_DIR, `steward-${tag}.png`) });
          say("SAVED", `steward-${tag}.png`);
        }
      });
    }
  }

  // 2. site-mode popup reference at 375x800, 375x667 (port 3002, flag on)
  for (const vp of [
    { width: 375, height: 800 },
    { width: 375, height: 667 },
  ]) {
    const tag = `popup-site-${vp.width}x${vp.height}`;
    await doStep(tag, vp, null, async (page) => {
      await page.goto(`${BEFORE}/`, { waitUntil: "domcontentloaded" });
      await page.waitForSelector('[role="dialog"]', { timeout: 30000 });
      await page.waitForTimeout(2500);
      say(`### ${tag}`, await page.evaluate(POPUP_GEOM));
      await page.screenshot({ path: path.join(OUT_DIR, `steward-${tag}.png`) });
      say("SAVED", `steward-${tag}.png`);
    });
  }

  // 3. sticky bars: camps reference and both blog arms, 1440 + 375
  for (const [label, url] of [
    ["camps", `${AFTER}/programs/ekuzo-camps`],
    ["blogthumbs", `${AFTER}${BLOG_POST}`],
    ["blogclassic", `${AFTER}${BLOG_POST}`],
  ]) {
    const variant = label === "blogclassic" ? "classic" : label === "blogthumbs" ? "thumbs" : null;
    for (const w of [1440, 375]) {
      const tag = `bar-${label}-${w}`;
      await doStep(tag, { width: w, height: w === 1440 ? 900 : 800 }, variant, async (page) => {
        await page.goto(url, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(2500);
        await page.evaluate(() => window.scrollTo(0, 900));
        await page.waitForTimeout(1500);
        say(`### ${tag}`, await page.evaluate(BAR_GEOM));
      });
    }
  }

  // 4. contact modal before (3002) and after (3001), 1440 + 375
  for (const [label, base] of [
    ["before", BEFORE],
    ["after", AFTER],
  ]) {
    for (const w of [1440, 375]) {
      const tag = `contact-${label}-${w}`;
      await doStep(tag, { width: w, height: w === 1440 ? 900 : 800 }, null, async (page) => {
        await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(3000);
        // Site-mode popup may be open on 3002; close it first.
        const closer = page.locator('[role="dialog"] button[aria-label="Close"]');
        if (await closer.count()) {
          await closer.first().click().catch(() => {});
          await page.waitForTimeout(500);
        }
        await page.evaluate(() => window.scrollTo(0, 900));
        await page.waitForTimeout(1200);
        await page.click("text=Talk to Humans", { timeout: 25000 });
        await page.waitForSelector("form", { timeout: 25000 });
        await page.waitForTimeout(1200);
        say(`### ${tag}`, await page.evaluate(FORM_PROBE));
        await page.screenshot({ path: path.join(OUT_DIR, `steward-${tag}-open.png`) });
        say("SAVED", `steward-${tag}-open.png`);
      });
    }
  }

  // 5. Jamie-bylined post: byline text + popup
  for (const w of [1440, 375]) {
    const tag = `jamie-${w}`;
    await doStep(tag, { width: w, height: w === 1440 ? 900 : 800 }, "thumbs", async (page) => {
      await page.goto(`${AFTER}${JAMIE_POST}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2500);
      const head = await page.evaluate(() => {
        const a = document.querySelector("article") || document.body;
        return a.innerText.slice(0, 600);
      });
      say(`### ${tag}-head\n${head}`);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.6));
      await page.waitForSelector('[role="dialog"]', { timeout: 30000 });
      await page.waitForTimeout(2500);
      await page.screenshot({ path: path.join(OUT_DIR, `steward-popup-jamiepost-${w}.png`) });
      say("SAVED", `steward-popup-jamiepost-${w}.png`);
      const t = await page.evaluate(() => {
        const d = document.querySelector('[role="dialog"]');
        return { dialog: d.innerText, pageByline: document.body.innerText.match(/by [A-Z][a-z]+ [A-Z][a-z]+/g)?.slice(0, 4) };
      });
      say(`### popup-on-jamie-${w}`, t);
    });
  }

  await browser.close();
  say("DONE");
}

run().catch((e) => {
  say("FATAL", e.message);
  process.exit(1);
});
