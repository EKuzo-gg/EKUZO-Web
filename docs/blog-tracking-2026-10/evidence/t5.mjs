import { open, events, flush, save, BASE, POST } from './h.mjs';
const R = {};
const ge = (o) => events(o.ctx).filter(e => e.en !== 'page_view').map(e => ({ en: e.en, ...e.params }));
async function fin(o, p, w = 6000) { await p.waitForTimeout(w); await flush(p, 2500); }
const initHook = (o) => o.ctx.addInitScript(() => { window.__sc = []; const t0 = performance.now(); window.addEventListener('scroll', () => window.__sc.push([Math.round(performance.now()), Math.round(scrollY)]), { passive: true }); });
const dlev = (p) => p.evaluate(() => (window.dataLayer || []).map(a => Array.from(a)).filter(a => a[0] === 'event' && a[1] !== 'page_view').map(a => a.slice(1)));
// A: load, no scroll
{ const o = await open(); await initHook(o); const p = await o.ctx.newPage(); await p.goto(BASE + POST, { waitUntil: 'networkidle' }); await p.waitForTimeout(3000); await fin(o, p, 5000); R.A_load_no_scroll = { beacons: ge(o), dl: await dlev(p) }; await o.b.close(); }
// B: staged scroll with wheel: 60% (no), 74% boundary, then past, then more, up and down
{ const o = await open(); const p = await o.ctx.newPage(); await p.goto(BASE + POST, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  const m = await p.evaluate(() => { const r = document.querySelector('article').getBoundingClientRect(); return { top: r.top + scrollY, h: r.height, vh: innerHeight, thr: 0.75 * r.height + r.top + scrollY - innerHeight }; });
  const steps = {};
  await p.evaluate(y => scrollTo(0, y), m.thr - 60); await p.waitForTimeout(500); steps.below = await dlev(p);
  await p.evaluate(y => scrollTo(0, y), m.thr + 60); await p.waitForTimeout(500); steps.at_75 = await dlev(p);
  await p.mouse.move(400, 400); for (let i = 0; i < 10; i++) { await p.mouse.wheel(0, 400); await p.waitForTimeout(80); } await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300); await p.evaluate(y => scrollTo(0, y), m.thr + 500); await p.waitForTimeout(500); await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(500); steps.after_more = await dlev(p);
  await fin(o, p); R.B_staged = { metrics: m, steps, beacons: ge(o) }; await o.b.close(); }
// C: reload restoring deep scroll, 5 runs, various positions
for (const [i, y] of [[1, 8000], [2, 6500], [3, 9500], [4, 8000], [5, 7000]]) {
  const o = await open(); await initHook(o); const p = await o.ctx.newPage(); await p.goto(BASE + POST, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(1500);
  const pre = await dlev(p); // read_75 fired legitimately before reload
  const n0 = events(o.ctx).length;
  await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForTimeout(4000);
  const post = { dl: await dlev(p), sc: await p.evaluate(() => window.__sc), y: await p.evaluate(() => scrollY) };
  await fin(o, p, 4000);
  R['C' + i + '_reload_at_' + y] = { preReloadDL: pre, afterReload: post, beaconsAfterReloadOnly: events(o.ctx).slice(n0).filter(e => e.en !== 'page_view').map(e => ({ en: e.en, ...e.params })), allBeacons: ge(o) };
  console.log('C' + i, y, 'restoredY', post.y, 'DL after reload', JSON.stringify(post.dl), 'scrollEvents', JSON.stringify(post.sc.slice(0, 6)));
  await o.b.close(); }
// D: reload with slow loading (throttle JS chunks by 1.2s) to push restoration past 800ms
{ const o = await open(); await initHook(o); const p = await o.ctx.newPage(); await p.goto(BASE + POST, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  await p.evaluate(() => scrollTo(0, 8000)); await p.waitForTimeout(1500);
  await o.ctx.route('**/_next/static/chunks/**', async r => { await new Promise(s => setTimeout(s, 1500)); r.continue(); });
  await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForTimeout(6000);
  const post = { dl: await dlev(p), sc: await p.evaluate(() => window.__sc), y: await p.evaluate(() => scrollY) };
  await fin(o, p, 3000); R.D_reload_slow_chunks = { afterReload: post, beacons: ge(o) }; console.log('D', JSON.stringify(post).slice(0, 400)); await o.b.close(); }
// E: back navigation restore (go to /parents via link click then back)
{ const o = await open(); await initHook(o); const p = await o.ctx.newPage(); await p.goto(BASE + POST, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  await p.evaluate(() => scrollTo(0, 3000)); await p.waitForTimeout(800); await p.evaluate(() => { document.querySelector('article a[href="/parents"]').click(); }); await p.waitForTimeout(2000);
  await p.goBack({ waitUntil: 'domcontentloaded' }); await p.waitForTimeout(4000);
  R.E_back = { url: p.url(), y: await p.evaluate(() => scrollY), dl: await dlev(p) }; await o.b.close(); }
// F: /blog and author, scroll to bottom
for (const [n, path] of [['F_blog', '/blog'], ['F_author', '/blog/author/karlin-oei']]) {
  const o = await open(); const p = await o.ctx.newPage(); await p.goto(BASE + path, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  for (const f of [0.5, 0.8, 1]) { await p.evaluate(f => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f), f); await p.waitForTimeout(500); }
  await fin(o, p); R[n] = { beacons: ge(o), dl: await dlev(p) }; await o.b.close(); }
// G: client-side nav post -> post, read_75 resets with new slug
{ const o = await open(); const p = await o.ctx.newPage(); await p.goto(BASE + POST, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  await p.evaluate(() => scrollTo(0, 7000)); await p.waitForTimeout(600);
  await p.locator('a[href="/blog/gaming-programs-for-kids"]').first().click(); await p.waitForURL('**/gaming-programs-for-kids'); await p.waitForTimeout(1500);
  const ya = await p.evaluate(() => scrollY); const art = await p.evaluate(() => { const r = document.querySelector('article').getBoundingClientRect(); return r.height; });
  await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(600);
  R.G_spa_nav = { yAfterNav: ya, articleH: art, dl: await dlev(p) }; await fin(o, p, 3000); R.G_spa_nav.beacons = ge(o); console.log('G', JSON.stringify(R.G_spa_nav)); await o.b.close(); }
save('T5', R);
for (const k of Object.keys(R)) console.log(k, JSON.stringify(R[k]).slice(0, 330));
