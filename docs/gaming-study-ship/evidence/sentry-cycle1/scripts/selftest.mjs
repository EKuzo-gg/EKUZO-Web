import fs from "node:fs";
import { startProxy, LOG } from "./proxy.mjs";
import { launchGuarded, newCtx, closeCtx, BASE, POST } from "./lib.mjs";
fs.writeFileSync(LOG, "");
const srv = startProxy(); await new Promise(r => setTimeout(r, 300));
const browser = await launchGuarded();
// A: normal page with routes (layer 2) and proxy (layer 1)
const ctx = await newCtx(browser, "selftest-post", { vp: "1440", suppressPopup: false });
const page = await ctx.newPage();
await page.goto(BASE + POST, { waitUntil: "load" });
await page.waitForTimeout(8000);
await page.close(); await closeCtx(ctx);
// B: positive control: NO route layer, proxy only. Deliberate external attempts must be denied by the proxy.
const c2 = await newCtx(browser, "selftest-control-proxy-only", { vp: "1440", routes: false });
const p2 = await c2.newPage();
await p2.goto(BASE + "/", { waitUntil: "load" });
const ctl = await p2.evaluate(async () => {
  const out = [];
  for (const u of ["https://www.google-analytics.com/g/collect?v=2&tid=G-QA", "https://www.clarity.ms/collect", "https://www.facebook.com/tr?id=0&ev=QA", "https://a.klaviyo.com/api/events", "http://example.com/qa"]) {
    try { const r = await fetch(u, { mode: "no-cors" }); out.push([u, "resolved", r.status]); } catch (e) { out.push([u, "failed", String(e).slice(0,40)]); }
  }
  navigator.sendBeacon("https://www.clarity.ms/collect", "x");
  return out;
});
await p2.waitForTimeout(500);
await closeCtx(c2);
await browser.close(); await new Promise(r => srv.close(r));
const lines = fs.readFileSync(LOG, "utf8").trim().split("\n").map(l => JSON.parse(l));
const reqs = lines.filter(l => l.kind !== "marker");
const hostsProxy = [...new Set(reqs.map(r => r.host))];
const routeHosts = [...new Set(ctx.qaRec.external.map(e => new URL(e.url).host))];
const notDenied = reqs.filter(r => !String(r.decision).startsWith("denied"));
const out = [];
out.push("GUARD SELF-TEST " + new Date().toISOString());
out.push(`Context A (post, popup not suppressed, route layer + proxy), 8 s wait, page then context closed.`);
out.push(`Layer 2 (context.route) intercepted external requests: ${ctx.qaRec.external.length}`);
for (const e of ctx.qaRec.external) out.push(`  route ${e.method} ${e.type} ${e.url}`);
out.push(`Hosts attempted (route layer): ${routeHosts.join(", ") || "none"}`);
out.push(`Context B (positive control, proxy only, route layer OFF): in-page results:`);
for (const c of ctl) out.push("  " + c.join(" | "));
out.push(`Layer 1 (proxy) requests received: ${reqs.length}; hosts: ${hostsProxy.join(", ") || "none"}`);
out.push(`Proxy entries NOT denied: ${notDenied.length}`);
out.push(`All non-local requests denied: ${notDenied.length === 0 && reqs.length > 0 ? "YES" : "NO"}`);
out.push(`Proxy exercised by control (nonzero): ${reqs.length > 0}`);
out.push("");
out.push("PROXY LOG (JSONL):"); out.push(...lines.map(l => JSON.stringify(l)));
fs.writeFileSync(process.argv[2], out.join("\n") + "\n");
console.log(out.slice(0, 40).join("\n"));
