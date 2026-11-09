// M1d, X1/L2/L3a, X3, N3: node classq-dom.mjs <port> <label> <part: m1d|head|x3|console|all>
import fs from "fs";
import { launch, newCtx, hostsLeft, sleep } from "./classq-lib.mjs";
const [port, label, part = "all"] = process.argv.slice(2);
const base = `http://localhost:${port}`;
fs.mkdirSync("classq", { recursive: true });
const browser = await launch();
const adUrl = (a) => (a === "noad" ? "/season1" : a === "zz" ? "/season1?ad=zz" : `/season1?ad=${a}`);
async function open(path, { throttle = false, settle = 4000 } = {}) {
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  const rec = ctx.__rec; const cdp = await ctx.newCDPSession(page);
  const net = [];
  await cdp.send("Network.enable");
  cdp.on("Network.requestWillBeSent", (e) => net.push({ url: e.request.url, prio: e.request.initialPriority, ts: e.timestamp, type: e.type }));
  if (throttle) await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6e6 / 8), uploadThroughput: (0.75e6 / 8) });
  page.on("pageerror", (e) => rec.pageErrors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") rec.console.push(m.type() + ": " + m.text().slice(0, 240)); });
  await page.goto(base + path, { waitUntil: "load" });
  await sleep(settle);
  return { ctx, page, rec, net };
}
if (part === "m1d" || part === "all") {
  const out = {};
  for (const a of ["d18", "d19", "d2", "noad"]) {
    const { ctx, page } = await open(adUrl(a), { settle: 1500 });
    out[a] = await page.evaluate(() => Object.fromEntries(["em-top", "em-end", "tk-ph", "tk"].map((i) => { const e = document.getElementById(i); return [i, e ? e.getAttribute("data-clarity-mask") : "MISSING"]; })));
    await ctx.close();
  }
  fs.writeFileSync(`classq/${label}-m1d.json`, JSON.stringify(out, null, 1)); console.log(label, "m1d", JSON.stringify(out));
}
if (part === "head" || part === "all") {
  const out = {};
  for (const a of ["d1", "d2", "d4", "d10", "d18", "d19", "d21", "noad", "zz"]) {
    const { ctx, page, net, rec } = await open(adUrl(a), { throttle: true, settle: 6000 });
    const r = await page.evaluate(() => {
      const fams = (h) => { try { return [...new URL(h).searchParams.getAll("family")].map((f) => f.split(":")[0]); } catch { return []; } };
      const links = [...document.querySelectorAll("link")].map((l) => ({ rel: l.rel, as: l.getAttribute("as"), href: l.href, id: l.id, media: l.media, fp: l.getAttribute("fetchpriority"), parent: l.parentElement.tagName }));
      const res = performance.getEntriesByType("resource").map((e) => ({ n: e.name, start: Math.round(e.startTime), end: Math.round(e.responseEnd), init: e.initiatorType }));
      return {
        preloadImages: links.filter((l) => l.rel === "preload" && l.as === "image").map((l) => ({ href: l.href.replace(location.origin, ""), fp: l.fp })),
        fontLinks: links.filter((l) => /fonts\.googleapis/.test(l.href)).map((l) => ({ rel: l.rel, id: l.id, media: l.media, parent: l.parent, families: fams(l.href).length, fam: fams(l.href) })),
        heroImg: res.filter((e) => /\/images\/season1\//.test(e.n)).map((e) => ({ n: e.n.replace(location.origin, ""), start: e.start, end: e.end })),
        fontCss: res.filter((e) => /fonts\.googleapis\.com/.test(e.n)).map((e) => ({ n: e.n.slice(0, 90), start: e.start, end: e.end })),
        gstatic: res.filter((e) => /fonts\.gstatic\.com/.test(e.n)).map((e) => ({ n: e.n.slice(-40), start: e.start, end: e.end })),
        longTask: (performance.getEntriesByType("longtask")[0] || {}).startTime,
      };
    });
    const t0 = net[0] ? net[0].ts : 0;
    r.imageRequests = net.filter((n) => /\/images\/season1\//.test(n.url)).map((n) => ({ u: n.url.replace(base, ""), prio: n.prio, type: n.type }));
    r.gstaticPrio = net.filter((n) => /fonts\.gstatic\.com/.test(n.url)).map((n) => ({ u: n.url.slice(-30), prio: n.prio, atMs: Math.round((n.ts - t0) * 1000) }));
    r.cssPrio = net.filter((n) => /fonts\.googleapis\.com/.test(n.url)).map((n) => ({ prio: n.prio, atMs: Math.round((n.ts - t0) * 1000) }));
    r.errors = [...rec.pageErrors, ...rec.console];
    out[a] = r; await ctx.close();
    console.log(label, "head", a, "preloads", JSON.stringify(r.preloadImages.map((p) => p.href)), "fontCssLinks", r.fontLinks.length);
  }
  fs.writeFileSync(`classq/${label}-head.json`, JSON.stringify(out, null, 1));
}
if (part === "x3" || part === "all") {
  const out = {};
  for (const a of ["d18", "d19", "d2"]) {
    const { ctx, page } = await open(adUrl(a), { settle: 2500 });
    out[a] = await page.evaluate(async () => {
      await document.fonts.ready;
      const sels = { h1: "h1", h3: "h3", cta: ".cta, .join button, button[type=submit]", input: "#em-top" };
      const cs = {};
      for (const [k, s] of Object.entries(sels)) { const e = document.querySelector(s); cs[k] = e ? getComputedStyle(e).fontFamily + " | " + getComputedStyle(e).fontWeight : "none"; }
      const fams = new Set(); Object.values(cs).forEach((v) => v.split("|")[0].split(",").forEach((f) => { f = f.trim().replace(/^["']|["']$/g, ""); if (f && !/^(Helvetica Neue|Arial|sans-serif|ui-monospace|Menlo|monospace|system-ui)$/.test(f)) fams.add(f); }));
      const check = {}; fams.forEach((f) => (check[f] = document.fonts.check(`16px "${f}"`)));
      const loaded = [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/"/g, "") + " " + f.weight);
      return { computed: cs, check, loadedCount: loaded.length, loaded: [...new Set(loaded)].sort() };
    });
    await ctx.close();
  }
  fs.writeFileSync(`classq/${label}-x3.json`, JSON.stringify(out, null, 1)); console.log(label, "x3", JSON.stringify(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.check]))));
}
if (part === "console" || part === "all") {
  const out = {};
  for (const a of [...Array.from({ length: 21 }, (_, i) => "d" + (i + 1)), "noad"]) {
    const { ctx, page, rec } = await open(adUrl(a), { settle: 3500 });
    out[a] = { pageErrors: rec.pageErrors, console: rec.console, failed: rec.failed, offHost: hostsLeft(rec).offenders, ready: await page.evaluate(() => document.documentElement.dataset.s1Ready || "absent") };
    await ctx.close();
    console.log(label, "console", a, out[a].pageErrors.length, out[a].console.length, out[a].failed.length, out[a].ready);
  }
  fs.writeFileSync(`classq/${label}-console.json`, JSON.stringify(out, null, 1));
}
await browser.close();
