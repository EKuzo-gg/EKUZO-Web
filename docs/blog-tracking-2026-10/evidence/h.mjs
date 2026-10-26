import { launchGuarded, newCtx, BASE } from '../lib.mjs';
import fs from 'fs';
export { BASE };
const gjs = fs.readFileSync('/home/claude/qa/gtag/gtag.js', 'utf8');
export const POST = '/blog/should-i-buy-my-kid-robux';
export async function open(opts = {}) {
  const b = await launchGuarded();
  const ctx = await newCtx(b, opts);
  await ctx.route('https://www.googletagmanager.com/gtag/js**', r => r.fulfill({ status: 200, contentType: 'application/javascript', body: gjs }));
  await ctx.route('**/api/season-one', r => { ctx.s1 = (ctx.s1||[]); ctx.s1.push(r.request().postData()); return r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); });
  ctx.ga = [];
  ctx.on('request', rq => { if (/analytics\.google\.com\/g\/collect/.test(rq.url())) ctx.ga.push({ url: rq.url(), post: rq.postData() }); });
  return { b, ctx };
}
export function events(ctx) {
  const out = [];
  for (const g of ctx.ga) {
    const u = new URL(g.url); const dl = u.searchParams.get('dl');
    const parse = (qs) => { const sp = new URLSearchParams(qs); const o = { dl, params: {} }; for (const [k, v] of sp) { if (k === 'en') o.en = v; else if (k.startsWith('ep.') || k.startsWith('epn.')) o.params[k] = v; } return o; };
    if (u.searchParams.get('en')) out.push(parse(u.search.slice(1)));
    for (const line of (g.post || '').split('\n').filter(Boolean)) { if (/(^|&)en=/.test(line)) out.push(parse(line)); }
  }
  return out;
}
export async function flush(p, ms = 1500) {
  await p.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await p.waitForTimeout(ms);
  await p.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
}
export const clarityQ = (p) => p.evaluate(() => (window.clarity?.q || []).map(a => Array.from(a)));
export const save = (name, o) => fs.writeFileSync(`/home/claude/qa/tracking/ev/${name}.json`, JSON.stringify(o, null, 1));
// block navigation on page so we can click links and stay put (listener on window = after tracker's document listener)
export const stay = (p) => p.evaluate(() => window.addEventListener('click', e => { e.preventDefault(); }));
