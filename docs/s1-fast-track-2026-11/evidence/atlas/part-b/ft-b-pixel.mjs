// s1-fast-track Part B pixel pairs, main (3101) vs branch (3103), 412x915@2.625, three states per ad:
//  first  : fonts.gstatic.com aborted (fallback faces, the first paint's layout), viewport + per-section shots
//  fit    : fonts loaded, fonts.ready, two frames after (fitHero has run on loadingdone), per-section shots + full page
//  conf   : a stubbed submit from the top form (POST /api/season-one fulfilled locally), per-child shots of .conf-in
// Sections are the children of #lp (ihero, hero, join-top, bridge, mod, how, faq, join-end, footer) plus #sticky,
// so a height change in one section does not mask equality in the others. Analytics hosts are stubbed to 204 by
// host regex; an offender check lists hosts that answered from the network other than localhost and font hosts.
// Layout shifts with their sources are recorded (buffered PerformanceObserver) in the fit state.
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import crypto from "crypto";
const { chromium } = createRequire("/home/claude/")("playwright");
const [mainBase, branchBase, outDir, mode] = process.argv.slice(2);
// mode "mask": on the branch only, hide the two additions (.ready, .ready-note, .lock) before any shot, so every
// remaining difference is a copy change at the same position (removes sub-pixel offsets from the 59 px they add).
const MASK = ".ready,.ready-note,.lock{display:none!important}";
fs.mkdirSync(outDir, { recursive: true });
const STUB = /(^|\.)(googletagmanager\.com|google-analytics\.com|analytics\.google\.com|google\.com|doubleclick\.net|googleadservices\.com|googlesyndication\.com|clarity\.ms|bing\.com|facebook\.net|facebook\.com)$/i;
const ALLOWED = new Set(["localhost", "127.0.0.1", "fonts.googleapis.com", "fonts.gstatic.com"]);
const offenders = new Set();
const md5 = (b) => crypto.createHash("md5").update(b).digest("hex");
const browser = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY, bypass: "localhost,127.0.0.1" } });
const FREEZE = "*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition:none!important;caret-color:transparent!important}";

async function run(base, ad, label) {
  const out = { first: {}, fit: {}, conf: {}, errors: [], shifts: [], heroCta: null, joinHrefs: null };
  for (const state of ["first", "fit", "conf"]) {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    await ctx.route("**/*", (r) => {
      const req = r.request(); const u = new URL(req.url());
      if (STUB.test(u.hostname)) return r.fulfill({ status: 204, body: "" });
      if (state === "first" && u.hostname === "fonts.gstatic.com") return r.abort();
      if (req.method() === "POST" && u.pathname === "/api/season-one") return r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
      return r.continue();
    });
    ctx.on("response", (res) => { const u = new URL(res.url()); if (!ALLOWED.has(u.hostname) && !STUB.test(u.hostname)) offenders.add(u.hostname); });
    await ctx.addInitScript(() => {
      Math.random = () => 0.25; try { localStorage.clear(); } catch (_) {}
      window.__ls = []; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__ls.push({ v: +e.value.toFixed(5), t: Math.round(e.startTime), src: (e.sources || []).map((s) => { const n = s.node; return n ? (n.id ? "#" + n.id : n.nodeName + (n.className && typeof n.className === "string" ? "." + n.className.split(" ").join(".") : "")) : "?"; }) }); }).observe({ type: "layout-shift", buffered: true }); } catch (_) {}
    });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => out.errors.push(state + " pageerror: " + e.message));
    page.on("console", (m) => { if (m.type() === "error" && !/ERR_FAILED|net::/.test(m.text())) out.errors.push(state + " " + m.text()); });
    await page.goto(base + "/season1" + (ad === "noad" ? "" : "?ad=" + ad), { waitUntil: "load" });
    await page.addStyleTag({ content: FREEZE + (mode === "mask" && label === "branch" ? MASK : "") });
    await page.evaluate(async () => {
      await document.fonts.ready;
      const imgs = [...document.images].filter((i) => i.loading !== "lazy");
      await Promise.all(imgs.map((i) => (i.complete ? i.decode().catch(() => {}) : new Promise((r) => { i.onload = i.onerror = r; }))));
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    });
    await page.waitForTimeout(600);
    const shotSections = async (tgt) => {
      const sel = await page.evaluate(() => [...document.querySelectorAll("#lp > *:not(script):not(header)")].filter((e) => !e.hidden && e.getBoundingClientRect().height > 0).map((e) => (e.id ? "#" + e.id : e.tagName.toLowerCase() + (e.className ? "." + e.className.split(" ").join(".") : ""))).concat(["#sticky"]));
      for (const s of sel) {
        const el = page.locator("#lp > " + (s.startsWith("#") && s !== "#sticky" ? s : s === "#sticky" ? "x" : s)).first();
        const loc = s === "#sticky" ? page.locator("#sticky") : el;
        if (!(await loc.count()) || !(await loc.isVisible())) { tgt[s] = { hidden: true }; continue; }
        const buf = await loc.screenshot({ animations: "disabled" });
        const bb = await loc.boundingBox();
        tgt[s] = { md5: md5(buf), h: Math.round(bb.height) };
        fs.writeFileSync(path.join(outDir, `${ad}-${state}-${s.replace(/[^a-z0-9-]/gi, "_")}-${label}.png`), buf);
      }
    };
    if (state === "first" || state === "fit") {
      const vp = await page.screenshot();
      out[state]._viewport = { md5: md5(vp) };
      fs.writeFileSync(path.join(outDir, `${ad}-${state}-viewport-${label}.png`), vp);
      await shotSections(out[state]);
      if (state === "fit") {
        const fp = await page.screenshot({ fullPage: true });
        out.fit._full = { md5: md5(fp), h: await page.evaluate(() => document.documentElement.scrollHeight) };
        fs.writeFileSync(path.join(outDir, `${ad}-fit-full-${label}.png`), fp);
        out.shifts = await page.evaluate(() => window.__ls);
        out.heroCta = await page.evaluate(() => [...document.querySelectorAll(".hero .cta")].map((e) => e.textContent));
        out.joinHrefs = await page.evaluate(() => [...document.querySelectorAll("[data-join]")].map((e) => e.dataset.join + " " + e.getAttribute("href")));
      }
    } else {
      // The top form on an interactive-hero page sits in the closed hero slot; use the bottom form there.
      const where = await page.evaluate(() => (document.getElementById("em-top").offsetParent ? "top" : "end"));
      await page.locator("#em-" + where).scrollIntoViewIfNeeded();
      await page.fill("#em-" + where, "qa-pixel@example.com");
      await page.locator("#em-" + where).press("Enter");
      out.confFrom = where;
      await page.waitForSelector("#conf:not([hidden])");
      await page.addStyleTag({ content: FREEZE });
      await page.waitForTimeout(500);
      const h = await page.evaluate(() => Math.ceil(document.querySelector("#conf .conf-in").scrollHeight + 160));
      await page.setViewportSize({ width: 412, height: Math.max(915, h) });
      await page.waitForTimeout(300);
      const kids = await page.evaluate(() => [...document.querySelectorAll("#conf .conf-in > *")].map((e, i) => i + ":" + (e.id ? "#" + e.id : e.tagName.toLowerCase() + (e.className ? "." + e.className.split(" ")[0] : ""))));
      for (const k of kids) {
        const i = +k.split(":")[0];
        const loc = page.locator("#conf .conf-in > *").nth(i);
        if (!(await loc.isVisible())) { out.conf[k.split(":")[1]] = { hidden: true }; continue; }
        const buf = await loc.screenshot({ animations: "disabled" }); const bb = await loc.boundingBox();
        out.conf[k.split(":")[1]] = { md5: md5(buf), h: Math.round(bb.height) };
      }
      const vp = await page.screenshot();
      out.conf._overlay = { md5: md5(vp) };
      fs.writeFileSync(path.join(outDir, `${ad}-conf-overlay-${label}.png`), vp);
    }
    await ctx.close();
  }
  return out;
}
const result = {};
for (const ad of ["d18", "d19", "d2", "d6", "d9", "noad"]) {
  const m = await run(mainBase, ad, "main"); const b = await run(branchBase, ad, "branch");
  const cmp = {};
  for (const st of ["first", "fit", "conf"]) {
    const keys = [...new Set([...Object.keys(m[st]), ...Object.keys(b[st])])];
    cmp[st] = { same: keys.filter((k) => m[st][k] && b[st][k] && m[st][k].md5 === b[st][k].md5 && m[st][k].hidden === b[st][k].hidden), differ: keys.filter((k) => !(m[st][k] && b[st][k] && m[st][k].md5 === b[st][k].md5 && m[st][k].hidden === b[st][k].hidden)).map((k) => `${k} (h ${m[st][k]?.h ?? (m[st][k]?.hidden ? "hidden" : "absent")} -> ${b[st][k]?.h ?? (b[st][k]?.hidden ? "hidden" : "absent")})`) };
  }
  result[ad] = { cmp, main: { shifts: m.shifts, heroCta: m.heroCta, joinHrefs: m.joinHrefs, errors: m.errors }, branch: { shifts: b.shifts, heroCta: b.heroCta, joinHrefs: b.joinHrefs, errors: b.errors } };
  console.log(ad, JSON.stringify(result[ad]));
}
result._offenders = [...offenders];
console.log("offenders", JSON.stringify([...offenders]));
fs.writeFileSync(path.join(outDir, "_pixel.json"), JSON.stringify(result, null, 1));
await browser.close();
