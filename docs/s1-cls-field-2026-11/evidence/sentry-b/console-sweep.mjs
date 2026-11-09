// Check 4: console sweep over d1..d21 and noad on dev. Class T. Analytics hosts routed to 204 (logged). No ?s1qa, no form input.
import { createRequire } from "module";
import fs from "fs";
import { PROFILES } from "../../../../scripts/field-vitals/lib/profiles.mjs";
const { chromium } = createRequire("/home/claude/")("playwright");
const P = PROFILES["fb-android-412"];
const BASE = "https://dev--ekuzo.netlify.app/season1";
const variants = ["noad", ...Array.from({ length: 21 }, (_, i) => "d" + (i + 1))];
const HOSTS = ["**/googletagmanager.com/**", "**/google-analytics.com/**", "**/clarity.ms/**", "**/connect.facebook.net/**", "**/www.facebook.com/**", "**/doubleclick.net/**"];
const browser = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY } });
const rows = [];
for (const v of variants) {
  const ctx = await browser.newContext({ userAgent: P.ua, viewport: { width: P.width, height: P.height }, deviceScaleFactor: P.dpr, isMobile: true, hasTouch: true });
  const analytics = [];
  for (const h of HOSTS) await ctx.route(h, (r) => { analytics.push(r.request().url()); r.fulfill({ status: 204, body: "" }); });
  const page = await ctx.newPage();
  const errors = [], pageerrors = [], failed = [], warns = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); if (m.type() === "warning") warns.push(m.text().slice(0, 200)); });
  page.on("pageerror", (e) => pageerrors.push(String(e).slice(0, 200)));
  page.on("requestfailed", (r) => failed.push(r.url().slice(0, 140) + " " + (r.failure()?.errorText || "")));
  const url = v === "noad" ? BASE : `${BASE}?ad=${v}`;
  const resp = await page.goto(url, { waitUntil: "load", timeout: 60000 }).catch((e) => ({ status: () => "ERR " + e.message }));
  await page.waitForTimeout(8000);
  const dom = await page.evaluate(() => ({
    marker: document.querySelector('meta[name="s1-build"]')?.content ?? null,
    ready: document.documentElement.dataset.s1Ready ?? null,
    pre: document.getElementById("lp")?.dataset.s1Pre ?? null,
    preload: [...document.querySelectorAll('head link[rel=preload][as=image]')].map((l) => l.getAttribute("href")),
    fonts: document.getElementById("s1-fonts")?.getAttribute("href") ?? null,
  })).catch((e) => ({ err: e.message }));
  rows.push({ v, status: resp.status?.(), ...dom, errors, pageerrors, failed, analytics, warns });
  console.log(v, resp.status?.(), dom.marker, dom.ready, dom.pre, JSON.stringify(dom.preload), "err", errors.length, "pe", pageerrors.length, "rf", failed.length, "an", analytics.length);
  await ctx.close();
}
await browser.close();
fs.writeFileSync(new URL("console-sweep.json", import.meta.url), JSON.stringify(rows, null, 1));
