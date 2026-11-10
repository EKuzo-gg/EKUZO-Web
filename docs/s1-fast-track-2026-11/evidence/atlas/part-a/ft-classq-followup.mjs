// s1-fast-track Part A, Class Q on localhost. usage: node ft-classq.mjs <base> <outDir>
import { createRequire } from "module";
import fs from "fs";
import path from "path";
const { chromium } = createRequire("/home/claude/")("playwright");
const [base, outDir] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });

const STUB = /(^|\.)(googletagmanager\.com|google-analytics\.com|analytics\.google\.com|google\.com|doubleclick\.net|googleadservices\.com|googlesyndication\.com|clarity\.ms|bing\.com|facebook\.net|facebook\.com)$/i;
const ALLOWED = new Set(["localhost", "127.0.0.1", "fonts.googleapis.com", "fonts.gstatic.com"]);
const browser = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY, bypass: "localhost,127.0.0.1" } });
const offenders = new Set();
const stubbed = new Set();
const errors = [];

async function ctxFor() {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true });
  await ctx.addCookies([{ name: "s1_qa", value: "1", url: base }]);
  await ctx.route("**/*", (r) => {
    const req = r.request();
    const u = new URL(req.url());
    if (STUB.test(u.hostname)) { stubbed.add(u.hostname); return r.fulfill({ status: 204, body: "" }); }
    if (req.method() === "POST" && u.pathname === "/api/season-one") return r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    return r.continue();
  });
  ctx.on("response", (res) => {
    const u = new URL(res.url());
    if (u.protocol.startsWith("http") && !ALLOWED.has(u.hostname) && !STUB.test(u.hostname)) offenders.add(u.hostname);
  });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  return { ctx, page };
}
const dl = (page) => page.evaluate(() => (window.dataLayer || []).map((a) => JSON.parse(JSON.stringify(Array.from(a)))));
const out = {};

// (1) jersey
{
  const { ctx, page } = await ctxFor();
  await page.goto(base + "/season1/join/jersey?ad=D021&utm_source=x&utm_content=y", { waitUntil: "load" });
  await page.waitForTimeout(300);
  const st = await page.evaluate(() => ({
    search: location.search,
    dataAd: document.getElementById("jh").dataset.ad,
    tTag: getComputedStyle(document.querySelector(".t-tag")).display,
    tTeam: getComputedStyle(document.querySelector(".t-team")).display,
    back: getComputedStyle(document.querySelector(".jh-back")).display,
  }));
  const views = (await dl(page)).filter((a) => a[0] === "event" && a[1] === "season1_join_view");
  await page.screenshot({ path: path.join(outDir, "q1b-jersey-D021-412.png") });
  out.q1 = { ...st, views };
  await ctx.close();
}
// (3) cookie
{
  const cookieOf = async (url) => {
    const { ctx, page } = await ctxFor();
    await page.goto(base + url, { waitUntil: "load" });
    const cdp = await ctx.newCDPSession(page);
    const { cookies } = await cdp.send("Network.getAllCookies");
    const lc = cookies.find((c) => c.name === "ekuzo_lc");
    await ctx.close();
    return lc ? { httpOnly: lc.httpOnly, value: JSON.parse(decodeURIComponent(lc.value)) } : null;
  };
  out.q3 = {
    tagged: await cookieOf("/season1?ad=D019&utm_source=meta&utm_medium=paid_social&utm_campaign=season1&utm_content=d19-a"),
    zz: await cookieOf("/season1?ad=zz"),
  };
}
out.offenders = [...offenders];
out.stubbed = [...stubbed];
out.errors = errors;
fs.writeFileSync(path.join(outDir, "classq-followup.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
await browser.close();
