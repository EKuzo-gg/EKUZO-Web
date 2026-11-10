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
  await page.goto(base + "/season1/join/jersey?ad=d21&utm_source=x&utm_content=y", { waitUntil: "load" });
  await page.waitForTimeout(300);
  const st = await page.evaluate(() => ({
    search: location.search,
    dataAd: document.getElementById("jh").dataset.ad,
    tTag: getComputedStyle(document.querySelector(".t-tag")).display,
    tTeam: getComputedStyle(document.querySelector(".t-team")).display,
    back: getComputedStyle(document.querySelector(".jh-back")).display,
  }));
  const views = (await dl(page)).filter((a) => a[0] === "event" && a[1] === "season1_join_view");
  await page.screenshot({ path: path.join(outDir, "q1-jersey-d21-412.png") });
  out.q1 = { ...st, views };
  await ctx.close();
}
// (2) join b
{
  const { ctx, page } = await ctxFor();
  await page.goto(base + "/season1/join?src=ad&ad=d18", { waitUntil: "load" });
  await page.waitForTimeout(300);
  out.q2 = { search: await page.evaluate(() => location.search), views: (await dl(page)).filter((a) => a[0] === "event" && a[1] === "season1_join_view") };
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
// (4) href builder and (5) click handler
{
  const { ctx, page } = await ctxFor();
  await page.goto(base + "/season1?ad=d19&utm_source=meta&utm_medium=paid_social&utm_campaign=s1&utm_content=d19-a", { waitUntil: "load" });
  await page.waitForTimeout(500);
  const tagged = await page.evaluate(() => window.S1.joinHref());
  const joinEls = await page.evaluate(() => document.querySelectorAll("[data-join]").length);
  const count = async () => {
    const ev = (await dl(page)).filter((a) => a[0] === "event" && a[1] === "s1_join_click");
    const cl = await page.evaluate(() => ((window.clarity && window.clarity.q) || []).map((a) => Array.from(a)).filter((a) => a[0] === "event" && a[1] === "join_click").length);
    return { ga: ev, clarity: cl };
  };
  const before = await count();
  await page.evaluate(() => {
    const a = document.createElement("a");
    a.setAttribute("data-join", "top"); a.href = "#ft"; a.id = "ftj"; a.textContent = "synthetic";
    a.style.cssText = "position:fixed;left:10px;top:200px;z-index:99999;background:#fff;padding:12px";
    document.body.appendChild(a);
  });
  await page.mouse.wheel(0, 600); await page.waitForTimeout(200);
  await page.evaluate(() => { window.scrollBy(0, 400); document.getElementById("ftj").focus(); document.getElementById("ftj").dispatchEvent(new FocusEvent("focus")); });
  await page.keyboard.press("Tab");
  await page.waitForTimeout(200);
  const afterNoClick = await count();
  await page.tap("#ftj"); await page.waitForTimeout(150);
  const afterOne = await count();
  await page.click("#ftj"); await page.waitForTimeout(150);
  const afterTwo = await count();
  await page.click("h1, body", { position: { x: 5, y: 5 } }).catch(() => {});
  const afterOther = await count();
  out.q4 = { tagged, joinEls };
  out.q5 = { before, afterNoClick, afterOne, afterTwo, afterOther };
  await ctx.close();
  const b = await ctxFor();
  await b.page.goto(base + "/season1", { waitUntil: "load" });
  out.q4.bare = await b.page.evaluate(() => window.S1.joinHref());
  await b.ctx.close();
}
out.offenders = [...offenders];
out.stubbed = [...stubbed];
out.errors = errors;
fs.writeFileSync(path.join(outDir, "classq.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
await browser.close();
