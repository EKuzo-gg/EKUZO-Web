// Steward Phase 4: T7 visual-parity measurement + rendered innerText extraction.
// Usage: node docs/blog-newsletter/tests/steward-t7.mjs <step> [<step>...]
// Steps: barCamps, barBlog, popupSite, popupBlog, contactBefore, contactAfter, jamie
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
const LIVE = path.resolve("docs/blog-newsletter/tests/steward-t7-live.txt");

function say(...a) {
  const s = a.map((x) => (typeof x === "string" ? x : JSON.stringify(x, null, 1))).join(" ");
  console.log(s);
  try { fs.appendFileSync(LIVE, s + "\n"); } catch {}
}

let browser;

async function step(name, viewport, fn, variant) {
  let context;
  try {
    context = await browser.newContext({ viewport });
    if (variant) {
      await context.addInitScript((v) => {
        try { window.localStorage.setItem("ekuzo_nl_variant", v); } catch {}
      }, variant);
    }
    await context.route("**/*", (route) => {
      const u = route.request().url();
      if (u.startsWith("http://localhost") || u.startsWith("data:") || u.startsWith("blob:")) return route.continue();
      return route.abort();
    });
    const page = await context.newPage();
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(20000);
    say("\n--- " + name);
    await fn(page, context);
    say("STEP OK", name);
  } catch (e) {
    say("STEP ERROR", name, String(e.message).split("\n")[0]);
  } finally {
    try { await context?.close(); } catch {}
  }
}

async function go(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
}

// ---- measurement helpers evaluated in the page ----
const MEASURE_BAR = `(() => {
  const bars = Array.from(document.querySelectorAll("div,section,aside")).filter((el) => {
    const cs = getComputedStyle(el);
    return cs.position === "fixed" && (cs.bottom === "0px") && el.offsetHeight > 30 && el.offsetWidth > 200;
  });
  // pick the outermost fixed bottom bar
  const bar = bars[0];
  if (!bar) return { found: false };
  const cs = getComputedStyle(bar);
  const r = bar.getBoundingClientRect();
  const inner = bar.querySelector(":scope > div") || bar;
  const ics = getComputedStyle(inner);
  const texts = Array.from(bar.querySelectorAll("*")).filter((e) => e.children.length === 0 && e.textContent.trim());
  const textInfo = texts.map((e) => {
    const s = getComputedStyle(e);
    return { tag: e.tagName, text: e.textContent.trim(), font: s.fontFamily, size: s.fontSize, weight: s.fontWeight, transform: s.textTransform, tracking: s.letterSpacing, color: s.color, display: s.display, visible: !!(e.offsetWidth || e.offsetHeight) };
  });
  const btns = Array.from(bar.querySelectorAll("a,button")).map((e) => {
    const s = getComputedStyle(e);
    const br = e.getBoundingClientRect();
    return { tag: e.tagName, type: e.getAttribute("type"), text: e.textContent.trim(), h: Math.round(br.height), w: Math.round(br.width), bg: s.backgroundColor, color: s.color, pad: s.padding, radius: s.borderRadius, font: s.fontFamily, size: s.fontSize, transform: s.textTransform, cls: e.className };
  });
  const inputs = Array.from(bar.querySelectorAll("input")).map((e) => {
    const s = getComputedStyle(e);
    const br = e.getBoundingClientRect();
    return { type: e.type, placeholder: e.placeholder, h: Math.round(br.height), w: Math.round(br.width), pad: s.padding, font: s.fontFamily, size: s.fontSize, border: s.border, radius: s.borderRadius, cls: e.className };
  });
  const rows = Array.from(bar.querySelectorAll("div,form")).map((e) => {
    const s = getComputedStyle(e);
    const br = e.getBoundingClientRect();
    return { tag: e.tagName, cls: String(e.className).slice(0, 220), bg: s.backgroundColor, pad: s.padding, h: Math.round(br.height), w: Math.round(br.width), maxW: s.maxWidth, display: s.display, gap: s.gap, align: s.alignItems, justify: s.justifyContent, borderTop: s.borderTopWidth + " " + s.borderTopColor };
  }).filter((r) => r.h > 8);
  return {
    found: true,
    rows,
    cls: bar.className,
    position: cs.position, bottom: cs.bottom, left: cs.left, right: cs.right, zIndex: cs.zIndex,
    height: Math.round(r.height), width: Math.round(r.width), top: Math.round(r.top),
    bg: cs.backgroundColor, borderTop: cs.borderTopWidth + " " + cs.borderTopColor,
    transform: cs.transform, padding: cs.padding,
    innerCls: inner === bar ? "(same)" : inner.className,
    innerPadding: ics.padding, innerMaxWidth: ics.maxWidth, innerGap: ics.gap, innerHeight: Math.round(inner.getBoundingClientRect().height),
    innerFlex: ics.display + "/" + ics.flexDirection + "/" + ics.justifyContent + "/" + ics.alignItems,
    innerText: bar.innerText,
    texts: textInfo, btns, inputs,
  };
})()`;

const MEASURE_DIALOG = `(() => {
  const d = document.querySelector('[role="dialog"]');
  if (!d) return { found: false };
  const cs = getComputedStyle(d);
  const r = d.getBoundingClientRect();
  const kids = Array.from(d.querySelectorAll(":scope > *")).map((e) => {
    const s = getComputedStyle(e);
    const br = e.getBoundingClientRect();
    return { tag: e.tagName, cls: e.className, bg: s.backgroundColor, w: Math.round(br.width), h: Math.round(br.height), display: s.display };
  });
  const panes = Array.from(d.querySelectorAll("*")).filter((e) => {
    const s = getComputedStyle(e);
    const bg = s.backgroundColor;
    return bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent" && e.offsetWidth > 60 && e.offsetHeight > 60;
  }).slice(0, 8).map((e) => {
    const s = getComputedStyle(e);
    const br = e.getBoundingClientRect();
    return { tag: e.tagName, bg: s.backgroundColor, w: Math.round(br.width), h: Math.round(br.height), cls: String(e.className).slice(0, 160) };
  });
  const texts = Array.from(d.querySelectorAll("*")).filter((e) => e.children.length === 0 && e.textContent.trim()).map((e) => {
    const s = getComputedStyle(e);
    return { tag: e.tagName, text: e.textContent.trim(), font: s.fontFamily, size: s.fontSize, weight: s.fontWeight, transform: s.textTransform, tracking: s.letterSpacing, color: s.color, visible: !!(e.offsetWidth || e.offsetHeight) };
  });
  const inputs = Array.from(d.querySelectorAll("input,select,textarea")).map((e) => {
    const s = getComputedStyle(e);
    const br = e.getBoundingClientRect();
    return { tag: e.tagName, type: e.type, placeholder: e.placeholder, h: Math.round(br.height), w: Math.round(br.width), pad: s.padding, font: s.fontFamily, size: s.fontSize, border: s.border, radius: s.borderRadius, cls: e.className };
  });
  const btns = Array.from(d.querySelectorAll("button")).map((e) => {
    const s = getComputedStyle(e);
    const br = e.getBoundingClientRect();
    return { type: e.getAttribute("type"), aria: e.getAttribute("aria-label"), text: e.textContent.trim(), h: Math.round(br.height), w: Math.round(br.width), bg: s.backgroundColor, color: s.color, radius: s.borderRadius, transform: s.textTransform, cls: String(e.className).slice(0, 200) };
  });
  const overlay = d.parentElement ? (() => { const s = getComputedStyle(d.parentElement); return { cls: String(d.parentElement.className).slice(0,160), bg: s.backgroundColor, position: s.position, zIndex: s.zIndex }; })() : null;
  return {
    found: true, cls: String(d.className), role: d.getAttribute("role"), ariaModal: d.getAttribute("aria-modal"), ariaLabel: d.getAttribute("aria-label"),
    position: cs.position, zIndex: cs.zIndex, bg: cs.backgroundColor, radius: cs.borderRadius, padding: cs.padding, overflow: cs.overflow,
    w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y),
    display: cs.display, gridTemplate: cs.gridTemplateColumns, flexDir: cs.flexDirection,
    innerText: d.innerText, kids, panes, texts, inputs, btns, overlay,
    portalParent: d.parentElement && d.parentElement.parentElement ? d.parentElement.parentElement.tagName : null,
  };
})()`;

const MEASURE_CONTACT = `(() => {
  let form = document.querySelector("form");
  const forms = Array.from(document.querySelectorAll("form"));
  const modal = forms.map((f) => f.closest("div")).find(Boolean);
  const root = document.querySelector('[class*="fixed"][class*="z-"]') || document.body;
  const f = forms[forms.length - 1];
  if (!f) return { found: false };
  const fields = Array.from(f.querySelectorAll("input,select,textarea")).map((e) => {
    const s = getComputedStyle(e);
    const br = e.getBoundingClientRect();
    return { tag: e.tagName, name: e.name, id: e.id, type: e.type, placeholder: e.placeholder, required: e.required,
      h: Math.round(br.height), w: Math.round(br.width), pad: s.padding, font: s.fontFamily, size: s.fontSize,
      border: s.borderWidth + " " + s.borderStyle + " " + s.borderColor, radius: s.borderRadius, bg: s.backgroundColor, color: s.color, cls: e.className,
      options: e.tagName === "SELECT" ? Array.from(e.options).map((o) => o.value + "|" + o.text) : undefined };
  });
  const labels = Array.from(f.querySelectorAll("label")).map((e) => { const s = getComputedStyle(e); return { text: e.textContent.trim(), font: s.fontFamily, size: s.fontSize, weight: s.fontWeight, transform: s.textTransform }; });
  const container = f.parentElement;
  const cr = container.getBoundingClientRect();
  const ccs = getComputedStyle(container);
  const submit = f.querySelector('button[type="submit"],button');
  const sb = submit ? (() => { const s = getComputedStyle(submit); const br = submit.getBoundingClientRect(); return { text: submit.textContent.trim(), h: Math.round(br.height), w: Math.round(br.width), bg: s.backgroundColor, color: s.color, radius: s.borderRadius }; })() : null;
  return { found: true, containerCls: String(container.className).slice(0,200), containerW: Math.round(cr.width), containerH: Math.round(cr.height), containerPad: ccs.padding, containerBg: ccs.backgroundColor,
    formGap: getComputedStyle(f).gap, formDisplay: getComputedStyle(f).display, fields, labels, submit: sb, innerText: container.innerText };
})()`;

async function openContact(page) {
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(600);
  const clicked = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll("a,button"));
    const t = els.find((e) => /talk to humans/i.test(e.textContent || ""));
    if (t) { t.click(); return true; }
    return false;
  });
  if (!clicked) throw new Error("no Talk to Humans control found");
  await page.waitForTimeout(1500);
}

const STEPS = {
  async barCamps() {
    for (const vp of [{ width: 1440, height: 900 }, { width: 375, height: 800 }]) {
      await step(`bar-camps-${vp.width}`, vp, async (page) => {
        await go(page, `${AFTER}/programs/ekuzo-camps`);
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(800);
        say("BAR camps", vp.width, await page.evaluate(MEASURE_BAR));
      });
    }
  },
  async barBlog() {
    for (const variant of ["thumbs", "classic"]) {
      for (const vp of [{ width: 1440, height: 900 }, { width: 375, height: 800 }]) {
        await step(`bar-blog-${variant}-${vp.width}`, vp, async (page) => {
          await go(page, `${AFTER}${BLOG_POST}`);
          await page.evaluate(() => window.scrollTo(0, 500));
          await page.waitForTimeout(800);
          say(`BAR blog ${variant}`, vp.width, await page.evaluate(MEASURE_BAR));
        }, variant);
      }
    }
  },
  async popupSite() {
    for (const vp of [{ width: 1440, height: 900 }, { width: 375, height: 800 }]) {
      await step(`popup-site-${vp.width}`, vp, async (page) => {
        await go(page, `${BEFORE}/`);
        await page.waitForSelector('[role="dialog"]', { timeout: 20000 });
        await page.waitForTimeout(800);
        say("POPUP site", vp.width, await page.evaluate(MEASURE_DIALOG));
        await page.screenshot({ path: path.join(OUT_DIR, `popup-site-${vp.width}-open.png`) });
        say("saved", `popup-site-${vp.width}-open.png`);
      });
    }
  },
  async popupBlog() {
    for (const variant of ["thumbs", "classic"]) {
      for (const vp of [{ width: 1440, height: 900 }, { width: 375, height: 800 }]) {
        await step(`popup-blog-${variant}-${vp.width}`, vp, async (page) => {
          await go(page, `${AFTER}${BLOG_POST}`);
          await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.6));
          await page.waitForSelector('[role="dialog"]', { timeout: 20000 });
          await page.waitForTimeout(800);
          say(`POPUP blog ${variant}`, vp.width, await page.evaluate(MEASURE_DIALOG));
        }, variant);
      }
    }
  },
  async popupBlogShots() {
    for (const variant of ["thumbs", "classic"]) {
      for (const vp of [{ width: 1440, height: 900 }, { width: 375, height: 800 }]) {
        await step(`popup-blog-shot-${variant}-${vp.width}`, vp, async (page) => {
          await go(page, `${AFTER}${BLOG_POST}`);
          await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.6));
          await page.waitForSelector('[role="dialog"]', { timeout: 20000 });
          // wait for the brand-pane image to finish decoding
          for (let i = 0; i < 40; i++) {
            const st = await page.evaluate(() => {
              const imgs = Array.from(document.querySelectorAll('[role="dialog"] img'));
              return imgs.map((im) => ({ src: im.currentSrc || im.src, complete: im.complete, w: im.naturalWidth }));
            });
            if (st.length && st.every((s) => s.complete && s.w > 0)) { say("IMGS ready", st); break; }
            if (i === 39) say("IMGS NOT ready", st);
            await page.waitForTimeout(500);
          }
          await page.waitForTimeout(500);
          await page.screenshot({ path: path.join(OUT_DIR, `steward-popup-blog-${variant}-${vp.width}-open.png`) });
          say("saved", `steward-popup-blog-${variant}-${vp.width}-open.png`);
        }, variant);
      }
    }
  },
  async popupFit() {
    const FIT = `(() => {
      const d = document.querySelector('[role="dialog"]');
      if (!d) return { found: false };
      const vh = window.innerHeight, vw = window.innerWidth;
      const items = Array.from(d.querySelectorAll("*")).filter((e) => (e.children.length === 0 && e.textContent.trim()) || /^(INPUT|BUTTON|IMG)$/.test(e.tagName));
      const rows = items.map((e) => {
        const r = e.getBoundingClientRect();
        const s = getComputedStyle(e);
        return { tag: e.tagName, text: (e.textContent || e.getAttribute("placeholder") || e.getAttribute("aria-label") || "").trim().slice(0, 48),
          top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height),
          fullyVisible: r.top >= 0 && r.bottom <= vh, partiallyClipped: r.top < vh && r.bottom > vh,
          offscreen: r.top >= vh, display: s.display };
      }).filter((r) => r.display !== "none" && r.h > 0);
      // scrollability of the dialog and its panes
      const scroll = Array.from(d.querySelectorAll("*")).concat([d]).map((e) => {
        const s = getComputedStyle(e);
        return { tag: e.tagName, cls: String(e.className).slice(0, 80), overflowY: s.overflowY, scrollH: e.scrollHeight, clientH: e.clientHeight, canScroll: e.scrollHeight > e.clientHeight + 2 && /auto|scroll/.test(s.overflowY) };
      }).filter((x) => x.scrollH > x.clientH + 2);
      return { found: true, vh, vw, docScrollLocked: getComputedStyle(document.body).overflow, rows, scroll };
    })()`;
    for (const variant of ["thumbs", "classic"]) {
      for (const vp of [{ width: 375, height: 800 }, { width: 375, height: 667 }]) {
        await step(`popup-fit-${variant}-${vp.width}x${vp.height}`, vp, async (page) => {
          await go(page, `${AFTER}${BLOG_POST}`);
          await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.6));
          await page.waitForSelector('[role="dialog"]', { timeout: 20000 });
          await page.waitForTimeout(1200);
          say(`FIT blog ${variant}`, `${vp.width}x${vp.height}`, await page.evaluate(FIT));
        }, variant);
      }
    }
    for (const vp of [{ width: 375, height: 800 }, { width: 375, height: 667 }]) {
      await step(`popup-fit-site-${vp.width}x${vp.height}`, vp, async (page) => {
        await go(page, `${BEFORE}/`);
        await page.waitForSelector('[role="dialog"]', { timeout: 20000 });
        await page.waitForTimeout(1200);
        say("FIT site", `${vp.width}x${vp.height}`, await page.evaluate(FIT));
      });
    }
  },
  async contactBefore() {
    for (const vp of [{ width: 1440, height: 900 }, { width: 375, height: 800 }]) {
      await step(`contact-before-${vp.width}`, vp, async (page) => {
        await go(page, `${BEFORE}/`);
        // dismiss the site popup if it opened
        await page.evaluate(() => { try { window.localStorage.setItem("ekuzo_newsletter_dismissed", "1"); } catch {} });
        await page.reload({ waitUntil: "domcontentloaded" });
        await page.waitForTimeout(1200);
        await openContact(page);
        say("CONTACT before", vp.width, await page.evaluate(MEASURE_CONTACT));
        await page.screenshot({ path: path.join(OUT_DIR, `contact-before-${vp.width}-open.png`) });
        say("saved", `contact-before-${vp.width}-open.png`);
      });
    }
  },
  async contactAfter() {
    for (const vp of [{ width: 1440, height: 900 }, { width: 375, height: 800 }]) {
      await step(`contact-after-${vp.width}`, vp, async (page) => {
        await go(page, `${AFTER}/`);
        await openContact(page);
        say("CONTACT after", vp.width, await page.evaluate(MEASURE_CONTACT));
        await page.screenshot({ path: path.join(OUT_DIR, `contact-after-${vp.width}-open.png`) });
        say("saved", `contact-after-${vp.width}-open.png`);
      });
    }
  },
  async jamie() {
    for (const vp of [{ width: 1440, height: 900 }, { width: 375, height: 800 }]) {
      await step(`jamie-popup-${vp.width}`, vp, async (page) => {
        await go(page, `${AFTER}${JAMIE_POST}`);
        const byline = await page.evaluate(() => {
          const t = document.body.innerText;
          const i = t.indexOf("\n");
          return { head: t.slice(0, 900) };
        });
        say("JAMIE page head", vp.width, byline);
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.6));
        await page.waitForSelector('[role="dialog"]', { timeout: 20000 });
        await page.waitForTimeout(800);
        const d = await page.evaluate(MEASURE_DIALOG);
        say("JAMIE dialog", vp.width, { innerText: d.innerText, ariaLabel: d.ariaLabel });
        // what is visible behind the dialog: article byline near viewport
        const around = await page.evaluate(() => {
          const els = Array.from(document.querySelectorAll("*")).filter((e) => e.children.length === 0 && /jamie|karlin/i.test(e.textContent || ""));
          return els.slice(0, 12).map((e) => {
            const r = e.getBoundingClientRect();
            return { text: e.textContent.trim().slice(0, 120), inView: r.top < window.innerHeight && r.bottom > 0, top: Math.round(r.top) };
          });
        });
        say("JAMIE author mentions", vp.width, around);
        await page.screenshot({ path: path.join(OUT_DIR, `steward-jamie-popup-${vp.width}-open.png`) });
        say("saved", `steward-jamie-popup-${vp.width}-open.png`);
      }, "thumbs");
    }
  },
};

async function main() {
  const wanted = process.argv.slice(2);
  browser = await chromium.launch({ executablePath: CHROMIUM_PATH, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  try {
    for (const w of wanted) {
      if (!STEPS[w]) { say("UNKNOWN STEP", w); continue; }
      say("\n===== " + w + " =====");
      await STEPS[w]();
    }
  } finally {
    await browser.close();
  }
  say("DONE");
}

main().catch((e) => { say("FATAL", e.message); process.exit(1); });
