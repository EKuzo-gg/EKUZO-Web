import { open, events, flush, save, BASE, POST, stay } from './h.mjs';
const R = {};
const raw = (o) => o.ctx.ga.map(g => ({ url: decodeURIComponent(g.url).slice(0, 600), post: g.post }));
// newsletter sticky on blog
{ const o = await open(); await o.ctx.route('**/api/newsletter', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
  const p = await o.ctx.newPage(); await p.goto(BASE + POST, { waitUntil: 'networkidle' }); await p.evaluate(() => scrollTo(0, 1500)); await p.waitForTimeout(2500);
  const inputs = await p.evaluate(() => [...document.querySelectorAll('input[type=email]')].map(i => ({ vis: i.offsetParent !== null, dlg: !!i.closest('[role=dialog]'), ph: i.placeholder })));
  console.log('inputs', JSON.stringify(inputs));
  const inp = p.locator('input[type=email]:visible').first();
  if (await inp.count()) { await inp.fill('qa-news@example.com'); await inp.press('Enter'); await p.waitForTimeout(1500); }
  await p.waitForTimeout(6000); await flush(p, 2500);
  R.newsletter = { inputs, events: events(o.ctx).map(e => ({ en: e.en, ...e.params })), netApi: 'stubbed' }; await o.b.close(); }
// register click
{ const o = await open(); const p = await o.ctx.newPage(); await p.goto(BASE + '/programs/ekuzo100', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500); await stay(p);
  const links = await p.evaluate(() => [...document.querySelectorAll('a[href*=register]')].map(a => a.getAttribute('href')));
  const l = p.locator('a[href*=register]:visible').first(); await l.scrollIntoViewIfNeeded(); await l.click(); await p.waitForTimeout(500);
  await p.waitForTimeout(6000); await flush(p, 2500);
  R.register = { links, events: events(o.ctx).map(e => ({ en: e.en, ...e.params })) }; await o.b.close(); }
// season1 landing lead
{ const o = await open({ suppressPopup: true }); await o.ctx.route('**/api/season-one**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
  const p = await o.ctx.newPage(); const posts = []; p.on('request', r => { if (r.method() === 'POST' && !/g\/collect/.test(r.url())) posts.push(r.url()); });
  await p.goto(BASE + '/season1', { waitUntil: 'networkidle' }); await p.waitForTimeout(2000);
  const f = p.locator('.join form').first(); await f.scrollIntoViewIfNeeded(); await f.locator('input[name=email]').fill('qa-s1@example.com');
  await f.locator('button').click(); await p.waitForTimeout(2500); await p.waitForTimeout(6000); await flush(p, 2500);
  R.season1 = { posts, events: events(o.ctx).map(e => ({ en: e.en, ...e.params })), raw: raw(o).map(r => r.url.slice(0, 300)) }; await o.b.close(); }
save('T1_T6_live', R); console.log(JSON.stringify(R, null, 1).slice(0, 4000));
