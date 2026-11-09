#!/usr/bin/env node
// Field-vitals harness for the Season 01 landing page. See README.md in this folder.
//
//   npm run vitals -- --target local:3101 --ads d18,d19,d2,noad --profile fb-android-412,ig-android-412 \
//     --runs 5 --label main-baseline [--network slow4g|mid|none|400k/400] [--cpu 4] [--viewport 360x640]
//     [--failure fonts-blocked|fonts-slow|fonts-slow-8s|hero-404|small-script-throws|big-script-fails]
//     [--fontDelay ms] [--fontCssDelay ms] [--fontScale 1.3] [--toolbar on|off] [--journey full|load]
//     [--wait 10000] [--expectMarker <sha>] [--requireReady] [--noForm] [--out <dir>]
//
// Exit codes: 0 ok; 1 usage or runtime error; 2 build marker differs from --expectMarker, or
// Playwright/Chromium missing; 3 a POST to /api/* was attempted (aborted); 4 an analytics host
// answered from the network (block failed); 5 --requireReady and s1Ready missing after the wait.
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import os from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { clsSummary, round4 } from "./lib/cls.mjs";
import { resolveProfile, resolveNetwork, FAILURES, ANALYTICS_HOST_RULES, ANALYTICS_RE, analyticsHost } from "./lib/profiles.mjs";
import { INIT, collectMetrics, domChecks, inpFrom } from "./lib/collect.mjs";
import { makeJourney } from "./lib/journey.mjs";
import { writeReport, listRunFiles } from "./lib/report.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const INSTALL = "npm i --no-save playwright && npx playwright install chromium";

// ---------- args ----------
function parseArgs(argv) {
  const a = { runs: 1, network: "slow4g", cpu: 4, wait: 10000, toolbar: "on", journey: "full" };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (!k.startsWith("--")) throw new Error(`unexpected argument "${k}"`);
    const key = k.slice(2);
    if (["requireReady", "noForm", "help"].includes(key)) { a[key] = true; continue; }
    const v = argv[++i];
    if (v === undefined) throw new Error(`${k} needs a value`);
    a[key] = v;
  }
  return a;
}
const args = (() => { try { return parseArgs(process.argv.slice(2)); } catch (e) { console.error(e.message); process.exit(1); } })();
if (args.help || !args.target || !args.ads || !args.profile || !args.label) {
  console.error("usage: npm run vitals -- --target <url|local:PORT> --ads d18,d19,noad --profile fb-android-412[,..] --runs N --label <name> [options]\nsee scripts/field-vitals/README.md");
  process.exit(args.help ? 0 : 1);
}
if (args.failure && !FAILURES[args.failure]) { console.error(`unknown --failure "${args.failure}". Known: ${Object.keys(FAILURES).join(", ")}`); process.exit(1); }
if (!/^[\w.-]+$/.test(args.label)) { console.error("--label: letters, digits, dot, dash, underscore only"); process.exit(1); }

const base = args.target.startsWith("local:") ? `http://localhost:${args.target.slice(6)}` : new URL(args.target).origin;
const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(base);
const network = resolveNetwork(args.network);
const cpu = Number(args.cpu);
const runs = Math.max(1, Number(args.runs));
const ads = args.ads.split(",").map((s) => s.trim()).filter(Boolean);
const profiles = args.profile.split(",").map((s) => resolveProfile(s.trim(), args.viewport));
const fontDelay = args.fontDelay != null ? Number(args.fontDelay) : args.failure === "fonts-slow-8s" ? 8000 : args.failure === "fonts-slow" ? 20000 : 0;
const fontCssDelay = args.fontCssDelay != null ? Number(args.fontCssDelay) : 0;
const fontScale = args.fontScale ? Number(args.fontScale) : null;
const formCheckOn = isLocal && !args.noForm;
const outRoot = resolve(ROOT, args.out || "docs/s1-cls-field-2026-11/evidence/vitals");
const labelDir = join(outRoot, args.label);
const adUrl = (ad) => (ad === "noad" ? `${base}/season1` : `${base}/season1?ad=${encodeURIComponent(ad)}`) + (args.query ? (ad === "noad" ? "?" : "&") + args.query : "");

// ---------- playwright ----------
async function loadPlaywright() {
  try { return await import("playwright"); } catch (_) {}
  const tries = [process.cwd() + "/", ROOT + "/", os.homedir() + "/"];
  try { tries.push(execSync("npm root -g", { encoding: "utf8" }).trim() + "/"); } catch (_) {}
  for (const t of tries) { try { return createRequire(t)("playwright"); } catch (_) {} }
  return null;
}
const pw = await loadPlaywright();
if (!pw) { console.error(`Playwright not found. Install it without touching package.json:\n  ${INSTALL}`); process.exit(2); }
const pwVersion = (() => { for (const t of [ROOT + "/", os.homedir() + "/", "/opt/npm-tools/node_modules/"]) { try { return createRequire(t)("playwright/package.json").version; } catch (_) {} } return "unknown"; })();

// ---------- helpers ----------
const sh = (cmd, cwd) => { try { return execSync(cmd, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch (_) { return null; } };
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
function calibrate() {
  const t = performance.now();
  let x = 0;
  for (let i = 1; i < 2e7; i++) x += Math.sqrt(i) % 3;
  return { ms: Math.round(performance.now() - t), x: x > 0 };
}
function targetCommit() {
  if (!isLocal) return { kind: "remote", ref: null };
  const port = base.split(":").pop();
  const pid = sh(`lsof -t -iTCP:${port} -sTCP:LISTEN -P -n`) || (sh(`fuser ${port}/tcp 2>/dev/null`) || "").trim().split(/\s+/)[0] || null;
  if (!pid) return { kind: "local", port, ref: null, note: "no listener found" };
  const p = pid.split("\n")[0];
  let cwd = null;
  try { cwd = execSync(`readlink /proc/${p}/cwd`, { encoding: "utf8" }).trim(); } catch (_) { cwd = sh(`lsof -a -p ${p} -d cwd -Fn`)?.split("\n").find((l) => l.startsWith("n"))?.slice(1) ?? null; }
  return { kind: "local", port, pid: +p, cwd, ref: cwd ? sh("git rev-parse --short=7 HEAD", cwd) : null, dirty: cwd ? !!sh("git status --porcelain -- app lib", cwd) : null };
}

// HTML rewrites for the two script failure profiles (OR3).
function rewriteHtml(html, failure) {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => ({ start: m.index, len: m[0].length, body: m[1] }));
  if (failure === "small-script-throws") {
    const s = scripts.find((x) => /classList\.add\("pa"\)|"pre-ih"/.test(x.body));
    if (!s) return { html, applied: "small script not found" };
    const open = s.start + "<script>".length;
    const tryIdx = html.indexOf("try{", open);
    if (tryIdx > 0 && tryIdx < s.start + s.len) {
      const at = tryIdx + 4;
      return { html: html.slice(0, at) + 'throw new Error("fv-injected small-script-throws");' + html.slice(at), applied: "throw inside first try{ of the small script" };
    }
    return { html: html.slice(0, open) + 'throw new Error("fv-injected small-script-throws");' + html.slice(open), applied: "throw at start of the small script (no try block found)" };
  }
  if (failure === "big-script-fails") {
    const s = scripts.slice().sort((a, b) => b.len - a.len)[0];
    if (!s) return { html, applied: "no inline script" };
    const open = s.start + "<script>".length;
    return { html: html.slice(0, open) + ")(; /* fv-injected syntax error */" + html.slice(open), applied: `syntax error at start of the largest inline script (${s.len} chars)` };
  }
  return { html, applied: null };
}

// ---------- run ----------
mkdirSync(labelDir, { recursive: true });
const launchArgs = [`--host-resolver-rules=${ANALYTICS_HOST_RULES.map((h) => `MAP ${h} ~NOTFOUND`).join(", ")}`];
const proxyServer = process.env.HTTPS_PROXY || process.env.https_proxy;
const browser = await pw.chromium.launch({
  args: launchArgs,
  ...(proxyServer ? { proxy: { server: proxyServer, bypass: ["<-loopback>", "localhost", "127.0.0.1", ...ANALYTICS_HOST_RULES].join(",") } } : {}),
}).catch((e) => { console.error(`Chromium failed to launch (${e.message.split("\n")[0]}). Install: ${INSTALL}`); process.exit(2); });
const browserVersion = browser.version();
const invocation = {
  command: "node scripts/field-vitals/run.mjs " + process.argv.slice(2).join(" "),
  startedAt: new Date().toISOString(),
  harnessCommit: sh("git rev-parse --short=7 HEAD", ROOT),
  harnessDirty: !!sh("git status --porcelain -- scripts/field-vitals", ROOT),
  target: base,
  targetCommit: targetCommit(),
  versions: { node: process.version, playwright: pwVersion, chromium: browserVersion, os: `${os.type()} ${os.release()} ${os.arch()}`, cpus: `${os.cpus().length} x ${os.cpus()[0]?.model}` },
  calibration: calibrate(),
  options: { network, cpu, runs, ads, profiles: profiles.map((p) => p.name), viewport: args.viewport || null, failure: args.failure || null, fontDelay, fontCssDelay, fontScale, toolbar: args.toolbar, journey: args.journey, wait: Number(args.wait), formCheck: formCheckOn, expectMarker: args.expectMarker || null },
};
console.error(`[vitals] ${args.label}: ${base} ads=${ads.join(",")} profiles=${profiles.map((p) => p.name).join(",")} runs=${runs} network=${network.name} cpu=${cpu}x failure=${args.failure || "none"} target=${invocation.targetCommit.ref || "?"}`);

let exitCode = 0;
const totals = { posts: 0, leaks: 0, attempts: 0, readyMissing: 0 };

for (const profile of profiles) {
  const cell = [profile.name, profile.viewportOverride, network.name !== "slow4g" ? network.name.replace("/", "-") : null, cpu !== 4 ? `cpu${cpu}` : null, args.failure, fontDelay && !args.failure ? `fontdelay${fontDelay}` : null, fontCssDelay ? `csdelay${fontCssDelay}` : null, fontScale ? `fs${fontScale}` : null, args.toolbar === "off" ? "notoolbar" : null, args.journey === "load" ? "loadonly" : null].filter(Boolean).join("__");
  const cellDir = join(labelDir, cell);
  mkdirSync(cellDir, { recursive: true });
  for (const ad of ads) {
    for (let n = 1; n <= runs; n++) {
      const url = adUrl(ad);
      const calib = calibrate();
      const ctx = await browser.newContext({
        viewport: { width: profile.width, height: profile.height },
        deviceScaleFactor: profile.dpr, isMobile: true, hasTouch: true, userAgent: profile.ua,
        locale: "en-US", serviceWorkers: "block",
      });
      const t0 = Date.now();
      const blocked = [], posts = [], failureHits = [], consoleMsgs = [], pageErrors = [];
      let rewriteApplied = null;
      await ctx.route("**/*", async (route) => {
        const req = route.request();
        const u = req.url();
        const method = req.method();
        if (ANALYTICS_RE.test(u)) {
          blocked.push({ host: analyticsHost(u), url: u.slice(0, 160), t: Date.now() - t0, type: req.resourceType(), frame: (() => { try { return req.frame().parentFrame() ? "sub" : "main"; } catch (_) { return "?"; } })() });
          return route.fulfill({ status: 204, body: "", headers: { "x-fv-blocked": "1", "access-control-allow-origin": "*" } });
        }
        let path = "";
        try { path = new URL(u).pathname; } catch (_) {}
        if (method !== "GET" && method !== "HEAD" && /^\/api\//.test(path)) {
          posts.push({ method, url: u.slice(0, 160), t: Date.now() - t0, body: (req.postData() || "").slice(0, 200) });
          return route.abort("blockedbyclient");
        }
        const isFontCss = /^https:\/\/fonts\.googleapis\.com\//.test(u), isFontFile = /^https:\/\/fonts\.gstatic\.com\//.test(u);
        if (args.failure === "fonts-blocked" && (isFontCss || isFontFile)) { failureHits.push(u.slice(0, 100)); return route.abort("blockedbyclient"); }
        if ((args.failure === "fonts-slow" || args.failure === "fonts-slow-8s") && (isFontCss || isFontFile)) { failureHits.push(u.slice(0, 100)); await sleep(fontDelay); return route.continue().catch(() => {}); }
        if (!args.failure && fontDelay && isFontFile) { await sleep(fontDelay); return route.continue().catch(() => {}); }
        if (fontCssDelay && isFontCss) { await sleep(fontCssDelay); return route.continue().catch(() => {}); }
        if (args.failure === "hero-404" && /\/images\/season1\/(landing|jersey)\//.test(path)) { failureHits.push(path); return route.fulfill({ status: 404, body: "" }); }
        if ((args.failure === "small-script-throws" || args.failure === "big-script-fails") && req.resourceType() === "document" && /^\/season1\/?$/.test(path)) {
          const resp = await route.fetch();
          const r = rewriteHtml(await resp.text(), args.failure);
          rewriteApplied = r.applied;
          failureHits.push(r.applied);
          return route.fulfill({ response: resp, body: r.html });
        }
        return route.continue().catch(() => {});
      });
      const page = await ctx.newPage();
      page.on("console", (m) => { if (["error", "warning"].includes(m.type())) consoleMsgs.push({ type: m.type(), text: m.text().slice(0, 240), t: Date.now() - t0 }); });
      page.on("pageerror", (e) => pageErrors.push({ msg: String(e.message).slice(0, 240), t: Date.now() - t0 }));
      const cdp = await ctx.newCDPSession(page);
      const cdpReturns = {};
      cdpReturns.networkEnable = await cdp.send("Network.enable");
      cdpReturns.network = network.conditions ? await cdp.send("Network.emulateNetworkConditions", network.conditions) : "not throttled";
      cdpReturns.cpu = await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
      const net = new Map();
      cdp.on("Network.requestWillBeSent", (e) => {
        if (!net.has(e.requestId)) net.set(e.requestId, { url: e.request.url.slice(0, 200), method: e.request.method, type: e.type, priority: e.request.initialPriority, wall: e.wallTime });
      });
      cdp.on("Network.responseReceived", (e) => {
        const r = net.get(e.requestId); if (!r) return;
        const h = Object.fromEntries(Object.entries(e.response.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
        r.status = e.response.status; r.ip = e.response.remoteIPAddress || null; r.byHarness = h["x-fv-blocked"] === "1"; r.mime = e.response.mimeType; r.contentType = h["content-type"] || null;
      });
      cdp.on("Network.loadingFinished", (e) => { const r = net.get(e.requestId); if (r) r.bytes = e.encodedDataLength; });
      cdp.on("Network.loadingFailed", (e) => { const r = net.get(e.requestId); if (r) r.failed = e.errorText; });
      await page.addInitScript(INIT);
      if (fontScale) {
        await page.addInitScript((pct) => {
          const css = `html{-webkit-text-size-adjust:${pct}% !important;text-size-adjust:${pct}% !important}`;
          const add = () => { const s = document.createElement("style"); s.textContent = css; document.documentElement.appendChild(s); };
          if (document.documentElement) add(); else new MutationObserver((_, o) => { if (document.documentElement) { add(); o.disconnect(); } }).observe(document, { childList: true });
        }, Math.round(fontScale * 100));
      }
      let navError = null;
      try { await page.goto(url, { waitUntil: "load", timeout: 180000 }); } catch (e) { navError = String(e.message).split("\n")[0]; }
      const markerNow = await page.evaluate(() => document.querySelector('meta[name="s1-build"]')?.getAttribute("content") ?? null).catch(() => null);
      if (args.expectMarker && markerNow !== args.expectMarker) {
        console.error(`[vitals] build marker "${markerNow}" differs from --expectMarker "${args.expectMarker}" at ${url}. Stopping (exit 2).`);
        await ctx.close(); await browser.close(); process.exit(2);
      }
      await sleep(Number(args.wait));
      const journey = makeJourney(page, cdp, profile, { toolbar: args.toolbar !== "off", journey: args.journey });
      let steps = [], journeyError = null;
      try { steps = await journey.run(); } catch (e) { journeyError = String(e.message).split("\n")[0]; steps = journey.steps; }
      const m = await collectMetrics(page).catch((e) => ({ error: String(e.message) }));
      let dom = null;
      try { dom = await domChecks(page); } catch (e) { dom = { error: String(e.message).split("\n")[0] }; }
      let form = null;
      if (formCheckOn) { try { form = await journey.formCheck(); } catch (e) { form = { error: String(e.message).split("\n")[0], usable: false }; } }
      await sleep(300);
      await ctx.close();

      // ---------- summarise ----------
      const origin = m.timeOrigin || 0;
      const network_ = [...net.values()].map((r) => ({ ...r, start: r.wall ? Math.round(r.wall * 1000 - origin) : null, wall: undefined }));
      const leaks = network_.filter((r) => ANALYTICS_RE.test(r.url) && r.status != null && !r.byHarness);
      const hosts = [...new Set(network_.filter((r) => !r.byHarness && !r.failed && r.status != null).map((r) => { try { return new URL(r.url).host; } catch (_) { return "?"; } }))].filter(Boolean).sort();
      const c = clsSummary(m.shifts || []);
      const big = (c.worstEntries || []).slice().sort((a, b) => b.value - a.value)[0];
      const lcpFinal = (m.lcp || []).slice(-1)[0] || null;
      const hero = (m.resources || []).filter((r) => /\/images\/season1\//.test(r.url));
      const fontsCss = (m.resources || []).filter((r) => /fonts\.googleapis\.com\/css/.test(r.url));
      const lts = (m.longTasks || []).slice().sort((a, b) => a.startTime - b.startTime);
      const inp = inpFrom(m.events);
      const st = dom && dom.state ? dom.state : {};
      const summary = {
        cell, profile: profile.name, ad, run: n, failure: args.failure || null,
        clsWin: round4(c.windowed), clsWinIn: round4(c.windowedWithInput), clsTot: round4(c.total), clsTotIn: round4(c.totalWithInput),
        worstStart: c.worstWindow ? Math.round(c.worstWindow.start) : null,
        topSource: big ? big.sources.slice(0, 2).map((s) => s.sel).join(" + ") || "(no sources)" : null,
        firstPaint: m.paint?.firstPaint ?? null, fcp: m.paint?.fcp ?? null,
        lcp: lcpFinal ? lcpFinal.startTime : null, lcpEl: lcpFinal ? lcpFinal.sel + (lcpFinal.url ? " " + lcpFinal.url.split("/").pop() : "") : null,
        heroImgStart: hero.length ? Math.min(...hero.map((r) => r.start)) : null,
        heroImgEnd: hero.length ? Math.max(...hero.map((r) => r.end)) : null,
        heroImgBytes: hero.length ? hero.reduce((a, r) => a + (r.encodedBodySize || 0), 0) : null,
        fontsCssEnd: fontsCss.length ? Math.min(...fontsCss.map((r) => r.end)) : null,
        lt1Start: lts[0]?.startTime ?? null, lt1Dur: lts[0]?.duration ?? null, ltCount: lts.length,
        inp: inp.inp,
        marker: dom?.marker ?? null, s1Ready: dom?.sentinels?.s1Ready ?? null, s1Pre: dom?.sentinels?.s1Pre ?? null,
        heroState: dom?.state ? (st.ihVisible ? `ihero ${st.ihH}px` : st.heroFilled ? `hero ${st.heroH}px` : `hero empty ${st.heroH}px`) : "n/a",
        s2Off: dom?.s2Offenders ? dom.s2Offenders.length : null,
        u6Off: dom?.fonts ? Object.keys(dom.fonts.offenders) : null,
        formUsable: form ? !!form.usable : null,
        pageErrors: pageErrors.length,
        posts: posts.length, analyticsAttempts: blocked.length, leaks: leaks.length,
        navError, journeyError,
      };
      const record = {
        meta: {
          label: args.label, cell, profile: profile.name, ad, run: n, url, target: base,
          ua: profile.ua, viewport: { width: profile.width, height: profile.height }, dpr: profile.dpr,
          cpu, network, cdpReturns, failure: args.failure || null, failureDetail: args.failure ? FAILURES[args.failure] : null, rewriteApplied,
          fontDelay, fontCssDelay, fontScale, toolbar: args.toolbar, journey: args.journey,
          startedAt: new Date(t0).toISOString(), calibMs: calib.ms, browser: browserVersion, harnessCommit: invocation.harnessCommit,
          targetCommit: invocation.targetCommit.ref, marker: markerNow,
        },
        summary,
        cls: { ...c, worstEntries: undefined },
        shifts: m.shifts, lcp: m.lcp, paint: m.paint, inp, events: m.events, longTasks: m.longTasks,
        fontEvents: m.fontEvents, fontFaces: m.fontFaces, fontsStatus: m.fontsStatus,
        nav: m.nav, resources: m.resources, network: network_, hosts, timeline: m.timeline,
        steps, dom, form, console: consoleMsgs, pageErrors, jsErrors: m.jsErrors,
        blocked, posts, leaks, failureHits: failureHits.slice(0, 20), collectError: m.error || null,
      };
      const file = join(cellDir, `${ad}-run${n}.json`);
      writeFileSync(file, JSON.stringify(record, null, 1));
      if ((summary.clsWin ?? 0) >= 0.1 || leaks.length || posts.length) copyFileSync(file, join(labelDir, `keep-${cell}-${ad}-run${n}.json`));
      totals.posts += posts.length; totals.leaks += leaks.length; totals.attempts += blocked.length;
      if (args.requireReady && summary.s1Ready !== "1") totals.readyMissing++;
      console.error(`[vitals] ${cell} ${ad} run${n}: CLS ${summary.clsWin} (+in ${summary.clsWinIn}, total ${summary.clsTot}) src=${summary.topSource} LCP ${Math.round(summary.lcp ?? -1)} ${summary.lcpEl} FCP ${Math.round(summary.fcp ?? -1)} blocked=${blocked.length} posts=${posts.length} leaks=${leaks.length} form=${summary.formUsable} ready=${summary.s1Ready} err=${pageErrors.length}${navError ? " NAV " + navError : ""}${journeyError ? " JOURNEY " + journeyError : ""}`);
    }
  }
}
await browser.close();
invocation.finishedAt = new Date().toISOString();
invocation.totals = totals;

// ---------- report, blocked log, manifest ----------
const { summaries } = writeReport(labelDir, args.label);
const runFiles = listRunFiles(labelDir);
const blockedAll = { byHost: {}, attempts: 0, leaks: [], posts: [], runs: runFiles.length };
for (const f of runFiles) {
  const r = JSON.parse(readFileSync(f, "utf8"));
  for (const b of r.blocked || []) { blockedAll.byHost[b.host] = (blockedAll.byHost[b.host] || 0) + 1; blockedAll.attempts++; }
  for (const l of r.leaks || []) blockedAll.leaks.push({ file: relative(labelDir, f), url: l.url, status: l.status, ip: l.ip });
  for (const p of r.posts || []) blockedAll.posts.push({ file: relative(labelDir, f), ...p });
}
blockedAll.samples = {};
for (const f of runFiles.slice(0, 50)) {
  for (const b of JSON.parse(readFileSync(f, "utf8")).blocked || []) if (!blockedAll.samples[b.host]) blockedAll.samples[b.host] = b.url;
}
writeFileSync(join(labelDir, "blocked.json"), JSON.stringify(blockedAll, null, 1));
const manifestPath = join(labelDir, "manifest.json");
const prev = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : { label: args.label, invocations: [] };
prev.invocations.push(invocation);
prev.files = Object.fromEntries(runFiles.map((f) => [relative(labelDir, f), sha256(readFileSync(f))]));
prev.blocked = { byHost: blockedAll.byHost, attempts: blockedAll.attempts, leaks: blockedAll.leaks.length, posts: blockedAll.posts.length };
prev.runs = summaries.length;
writeFileSync(manifestPath, JSON.stringify(prev, null, 1));
console.error(`[vitals] wrote ${relative(ROOT, join(labelDir, "table.md"))}, manifest.json, blocked.json (${summaries.length} runs in label)`);

if (totals.posts) { console.error(`[vitals] ${totals.posts} POST attempt(s) to /api/* were aborted. Exit 3.`); exitCode = 3; }
else if (totals.leaks) { console.error(`[vitals] ${totals.leaks} analytics response(s) came from the network. Exit 4.`); exitCode = 4; }
else if (totals.readyMissing) { console.error(`[vitals] s1Ready missing in ${totals.readyMissing} run(s). Exit 5.`); exitCode = 5; }
process.exit(exitCode);
