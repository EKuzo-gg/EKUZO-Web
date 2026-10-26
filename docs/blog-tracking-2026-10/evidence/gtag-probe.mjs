import { launchGuarded, newCtx, BASE } from '../lib.mjs';
import fs from 'fs';
const js = fs.readFileSync('/home/claude/qa/gtag/gtag.js', 'utf8');
const b = await launchGuarded();
const ctx = await newCtx(b);
await ctx.route('https://www.googletagmanager.com/gtag/js**', r => r.fulfill({ status: 200, contentType: 'application/javascript', body: js }));
const p = await ctx.newPage();
await p.goto(`${BASE}/blog/should-i-buy-my-kid-robux`, { waitUntil: 'networkidle' });
await p.waitForTimeout(4000);
await p.evaluate(() => { window.gtag('event', 'register_click', { source: 'header' }); window.gtag('event', 'probe_ctl', { cta_source: 'header' }); });
await p.waitForTimeout(9000); await p.evaluate(()=>{Object.defineProperty(document,"visibilityState",{value:"hidden",configurable:true});document.dispatchEvent(new Event("visibilitychange"));}); await p.waitForTimeout(2000);
await p.close(); await ctx.close(); await b.close();
const ga = ctx.qaRec.external.filter(e => /google-analytics|g\/collect|analytics.google/.test(e.url));
for (const e of ga) { console.log(decodeURIComponent(e.url).slice(0,900)); console.log("POST:", e.post); }
