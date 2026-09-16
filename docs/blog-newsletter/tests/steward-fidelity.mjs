// Steward Phase 4: rendered-string fidelity + mechanical lint on rendered innerText.
// Compares the rendered innerText of every blog capture surface (idle, loading,
// success, error) against 02-copy-deck.md v2, then lints the rendered text.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const AFTER = "http://localhost:3001";
const CHROMIUM_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const BLOG_POST = "/blog/gaming-study-13-7-years-younger-what-it-means-for-kids";
const OUT = path.resolve("docs/blog-newsletter/tests/steward-fidelity-output.txt");
fs.writeFileSync(OUT, "");
function say(...a) {
  const s = a.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join(" ");
  console.log(s);
  fs.appendFileSync(OUT, s + "\n");
}

const DECK = {
  sticky: {
    thumbs: { line: "One email tomorrow, then you decide to stay or go.", button: "Try it", success: "Got it. Look for it tomorrow.", error: "That didn't go through. Try once more." },
    classic: { line: "One email a week on kids and gaming, with the sources.", button: "Join", success: "You're on the list.", error: "That didn't go through. Try once more." },
  },
  popup: {
    thumbs: {
      eyebrow: "The EKUZO weekly",
      headline: "One email after you read this. Then you decide.",
      body: "Leave your address and you're on the list today. Tomorrow I'll send one message with a thumbs up and a thumbs down, and the thumbs down takes you straight off, no questions. Thumbs up and the weekly keeps coming: what I'm seeing in kids' gaming, sources attached.",
      byline: "Karlin Oei, founder, EKUZO",
      firstName: "First name (optional)", email: "Email address",
      button: "Send me the one email", loading: "One moment...", success: "Got it.",
      micro: "No spam. Unsubscribe any time, or use the thumbs down tomorrow.",
      error: "That didn't go through. Try once more.",
    },
    classic: {
      eyebrow: "The EKUZO weekly",
      headline: "For parents of gamers, once a week.",
      body: "One email a week on making gaming count. I coach kids who play, so it's what I'm actually seeing. Sources attached, no hype.",
      byline: "Karlin Oei, founder, EKUZO",
      firstName: "First name (optional)", email: "Email address",
      button: "Join the weekly", loading: "One moment...", success: "You're in.",
      micro: "No spam. Unsubscribe any time.",
      error: "That didn't go through. Try once more.",
    },
  },
  contact: {
    label: "How did you hear about us?", def: "Choose one",
    helper: "Optional. It tells us where parents are finding us.",
    options: ["X (Twitter)", "Instagram", "TikTok or YouTube", "Google search", "ChatGPT or another AI", "A friend or another parent", "My kid's school", "Other"],
  },
};

let pass = 0, fail = 0;
function check(name, actualHay, needle) {
  const exact = actualHay.includes(needle);
  const ci = actualHay.toLowerCase().includes(needle.toLowerCase());
  if (exact) { pass++; say("PASS", name); }
  else { fail++; say("FAIL", name, "| exact=no ci=" + (ci ? "yes" : "no"), "| expected:", JSON.stringify(needle)); }
  return exact;
}

// ---- mechanical lint on rendered text ----
const BANNED_WORDS = ["delve","realm","tapestry","paradigm","intricate","intricacies","showcasing","pivotal","surpass","meticulously","vibrant","unparalleled","underscore","synergy","game-changer","testament","commendable","meticulous","holistic","garner","accentuate","pioneering","trailblazing","unleash","transformative","redefine","frictionless","mission-critical","visionary","disruptive","reimagine","unprecedented","leading-edge","synergize","democratize","supercharge","paradigm-shifting","plug-and-play","turnkey","future-proof"];
const COPULATIVE = ["serves as","stands as","marks a","represents a","boasts a","features a","offers a"];
const BANNED_PHRASES = ["in today's","it's important to note","it's worth noting","in order to","straightforward","let's dive in","let's explore","let's unpack","delve into","at the end of the day","moving forward","to put this in perspective","what makes this particularly interesting","the implications here are","in other words","it goes without saying","nobody's talking about","what nobody tells you","most people don't realize"];
const BANNED_TRANSITIONS = ["furthermore","additionally","moreover","that said","that being said","with that in mind","it is also worth mentioning","on top of that"];
const BAIT = ["let that sink in","read that again","full stop","this changes everything","are you paying attention","you're not ready for this"];
const NEG_PARALLEL = [
  /\bis\s?n[o']t\s+[^.!?]{1,60}\.\s*(it|this|that)\s?['’]?s\s/i,
  /\bnot\s+[^.!?]{1,40}\.\s+(it|this|that)\s?['’]?s\s/i,
  /\bnot only\b[^.!?]{1,60}\bbut also\b/i,
  /\bless\s+\w+,\s*more\s+\w+/i,
  /\bno\s+\w+,\s*no\s+\w+,\s*just\s+\w+/i,
  /\bthe question is\s?n[o']t\b[^.!?]{0,60}\bthe question is\b/i,
  /\byou do\s?n[o']t need\b[^.!?]{0,60}\byou need\b/i,
  /\bstop thinking\b[^.!?]{0,60}\bstart thinking\b/i,
  /\bforget\s+[^.!?]{1,40}\.\s*(this|it)\s?['’]?s\s/i,
  /\bis dead\b[^.!?]{0,40}\bis the future\b/i,
  /\bit'?s not about\b[^.!?]{0,60}\bit'?s about\b/i,
  /\bwhile\s+[^.!?]{1,50}\bmight seem\b[^.!?]{0,50}\bactually\b/i,
];

function lint(label, text) {
  const t = text.replace(/\s+/g, " ").trim();
  const low = t.toLowerCase();
  const hits = [];
  const em = (t.match(/[—―]/g) || []).length;
  const en = (t.match(/–/g) || []).length;
  if (em) hits.push(`em-dash x${em}`);
  if (en) hits.push(`en-dash x${en}`);
  for (const w of BANNED_WORDS) if (new RegExp(`\\b${w.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i").test(t)) hits.push(`banned-word:${w}`);
  for (const w of COPULATIVE) if (low.includes(w)) hits.push(`copulative:${w}`);
  for (const w of BANNED_PHRASES) if (low.includes(w)) hits.push(`banned-phrase:${w}`);
  for (const w of BANNED_TRANSITIONS) if (new RegExp(`\\b${w}\\b`, "i").test(t)) hits.push(`banned-transition:${w}`);
  for (const w of BAIT) if (low.includes(w)) hits.push(`engagement-bait:${w}`);
  NEG_PARALLEL.forEach((re, i) => { if (re.test(t)) hits.push(`neg-parallel#${i}`); });
  const excl = (t.match(/!/g) || []).length;
  if (excl) hits.push(`exclamation x${excl}`);
  const digits = t.match(/\d+/g) || [];
  const curly = (t.match(/[‘’“”…]/g) || []).length;
  say(`LINT ${label}: ${hits.length ? hits.join(", ") : "clean"} | digits=${JSON.stringify(digits)} | curly/ellipsis=${curly} | chars=${t.length}`);
  return hits;
}

async function ctx(browser, viewport, variant, mock) {
  const c = await browser.newContext({ viewport });
  if (variant) await c.addInitScript((v) => { try { localStorage.setItem("ekuzo_nl_variant", v); } catch {} }, variant);
  await c.route("**/*", (route) => {
    const u = route.request().url();
    if (u.includes("/api/newsletter") && mock) {
      if (mock === "hang") return; // never fulfil: leaves the loading label on screen
      return route.fulfill({ status: mock, contentType: "application/json", body: JSON.stringify(mock === 200 ? { success: true } : { error: "nope" }) });
    }
    if (u.startsWith("http://localhost") || u.startsWith("data:") || u.startsWith("blob:")) return route.continue();
    return route.abort();
  });
  return c;
}

async function barText(page) {
  return page.evaluate(() => {
    const bar = Array.from(document.querySelectorAll("div")).find((el) => {
      const cs = getComputedStyle(el);
      return cs.position === "fixed" && cs.bottom === "0px" && el.offsetHeight > 30;
    });
    if (!bar) return { innerText: "", visibleText: "" };
    const vis = Array.from(bar.querySelectorAll("*")).filter((e) => e.children.length === 0 && e.textContent.trim() && !!(e.offsetWidth || e.offsetHeight)).map((e) => e.textContent.trim());
    return { innerText: bar.innerText, visibleText: vis.join(" | ") };
  });
}

async function dialogText(page) {
  return page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    if (!d) return { innerText: "", visibleText: "", placeholders: [] };
    const vis = Array.from(d.querySelectorAll("*")).filter((e) => e.children.length === 0 && e.textContent.trim() && !!(e.offsetWidth || e.offsetHeight)).map((e) => e.textContent.trim());
    const ph = Array.from(d.querySelectorAll("input")).map((e) => e.placeholder);
    return { innerText: d.innerText, visibleText: vis.join(" | "), placeholders: ph, all: d.textContent };
  });
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROMIUM_PATH, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  try {
    for (const variant of ["thumbs", "classic"]) {
      for (const w of [1440, 375]) {
        const vp = { width: w, height: w === 1440 ? 900 : 800 };
        // -------- sticky bar: idle, then success, then error
        for (const state of ["idle", 200, 500]) {
          const c = await ctx(browser, vp, variant, state === "idle" ? null : state);
          const page = await c.newPage();
          page.setDefaultNavigationTimeout(60000);
          await page.goto(AFTER + BLOG_POST, { waitUntil: "domcontentloaded" });
          await page.waitForTimeout(1200);
          await page.evaluate(() => window.scrollTo(0, 500));
          await page.waitForTimeout(800);
          if (state !== "idle") {
            const ok = await page.evaluate(() => {
              const bar = Array.from(document.querySelectorAll("div")).find((el) => {
                const cs = getComputedStyle(el);
                return cs.position === "fixed" && cs.bottom === "0px" && el.offsetHeight > 30 && el.querySelector('input[type="email"]');
              });
              if (!bar) return "no bar";
              const input = bar.querySelector('input[type="email"]');
              input.focus();
              return "ok";
            });
            if (ok !== "ok") throw new Error("sticky bar not found: " + ok);
            await page.keyboard.type("reader@example.com");
            await page.keyboard.press("Enter");
            await page.waitForTimeout(1800);
          }
          const t = await barText(page);
          say(`\n== STICKY ${variant} @${w} state=${state} ==`);
          say("visibleText:", JSON.stringify(t.visibleText));
          const deck = DECK.sticky[variant];
          if (state === "idle") { check(`sticky.${variant}@${w}.line exact-case rendered`, t.visibleText, deck.line); check(`sticky.${variant}@${w}.button`, t.visibleText, deck.button); }
          if (state === 200) check(`sticky.${variant}@${w}.success`, t.visibleText, deck.success);
          if (state === 500) check(`sticky.${variant}@${w}.error`, t.visibleText, deck.error);
          lint(`sticky.${variant}@${w}.${state}`, t.visibleText);
          await c.close();
        }
        // -------- popup: idle, loading, success, error
        for (const state of ["idle", "hang", 200, 500]) {
          const c = await ctx(browser, vp, variant, state === "idle" ? null : state);
          const page = await c.newPage();
          page.setDefaultNavigationTimeout(60000);
          await page.goto(AFTER + BLOG_POST, { waitUntil: "domcontentloaded" });
          await page.waitForTimeout(1200);
          await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.6));
          await page.waitForSelector('[role="dialog"]', { timeout: 20000 });
          await page.waitForTimeout(600);
          if (state !== "idle") {
            await page.fill('[role="dialog"] input[type="email"]', "reader@example.com");
            await page.evaluate(() => document.querySelector('[role="dialog"] button[type="submit"]').click());
            await page.waitForTimeout(state === 200 ? 400 : 1200);
          }
          const t = await dialogText(page);
          say(`\n== POPUP ${variant} @${w} state=${state} ==`);
          say("visibleText:", JSON.stringify(t.visibleText));
          say("placeholders:", JSON.stringify(t.placeholders));
          const deck = DECK.popup[variant];
          if (state === "idle") {
            check(`popup.${variant}@${w}.eyebrow exact-case rendered`, t.visibleText, deck.eyebrow);
            check(`popup.${variant}@${w}.headline`, t.visibleText, deck.headline);
            check(`popup.${variant}@${w}.body`, t.visibleText, deck.body);
            check(`popup.${variant}@${w}.byline`, t.visibleText, deck.byline);
            check(`popup.${variant}@${w}.button`, t.visibleText, deck.button);
            check(`popup.${variant}@${w}.micro`, t.visibleText, deck.micro);
            check(`popup.${variant}@${w}.ph.firstName`, t.placeholders.join("|"), deck.firstName);
            check(`popup.${variant}@${w}.ph.email`, t.placeholders.join("|"), deck.email);
          }
          if (state === "hang") check(`popup.${variant}@${w}.loading`, t.visibleText, deck.loading);
          if (state === 200) check(`popup.${variant}@${w}.success`, t.visibleText, deck.success);
          if (state === 500) check(`popup.${variant}@${w}.error`, t.visibleText, deck.error);
          lint(`popup.${variant}@${w}.${state}`, t.visibleText);
          await c.close();
        }
      }
    }
    // -------- contact modal
    for (const w of [1440, 375]) {
      const c = await ctx(browser, { width: w, height: w === 1440 ? 900 : 800 }, null, null);
      const page = await c.newPage();
      page.setDefaultNavigationTimeout(60000);
      await page.goto(AFTER + "/", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      await page.evaluate(() => window.scrollTo(0, 600));
      await page.waitForTimeout(600);
      await page.evaluate(() => { const e = Array.from(document.querySelectorAll("a,button")).find((x) => /talk to humans/i.test(x.textContent || "")); e && e.click(); });
      await page.waitForTimeout(1500);
      const t = await page.evaluate(() => {
        const sel = document.querySelector("#contact-heard-about") || document.querySelector('select[name="heardAbout"]');
        const modal = sel ? sel.closest("form").parentElement : null;
        return { modalText: modal ? modal.innerText : "", options: sel ? Array.from(sel.options).map((o) => o.text) : [], label: sel && sel.labels && sel.labels[0] ? sel.labels[0].textContent.trim() : null };
      });
      say(`\n== CONTACT @${w} ==`);
      say("options:", JSON.stringify(t.options));
      check(`contact@${w}.label`, t.modalText, DECK.contact.label);
      check(`contact@${w}.default`, t.options.join("|"), DECK.contact.def);
      check(`contact@${w}.helper`, t.modalText, DECK.contact.helper);
      DECK.contact.options.forEach((o, i) => check(`contact@${w}.option${i + 1}`, t.options.join("|"), o));
      lint(`contact@${w}`, t.modalText);
      await c.close();
    }
  } finally {
    await browser.close();
  }
  say(`\nTOTAL pass=${pass} fail=${fail}`);
}
main().catch((e) => { say("FATAL", e.message); process.exit(1); });
