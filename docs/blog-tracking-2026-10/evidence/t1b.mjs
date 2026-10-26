import { open, events, flush, save, BASE, POST, stay } from './h.mjs';
const R = {};
{ const o = await open(); const p = await o.ctx.newPage(); await p.goto(BASE + '/programs/ekuzo100', { waitUntil: 'networkidle' }); await p.waitForTimeout(2000); await stay(p);
  const l = p.locator('a[href*="register?cta=hero"]').first(); await l.scrollIntoViewIfNeeded(); await l.click(); await p.waitForTimeout(500);
  const dl = await p.evaluate(() => (window.dataLayer || []).map(a => Array.from(a)).filter(a => a[0] === 'event'));
  await p.waitForTimeout(7000); await flush(p, 3000);
  R.register = { url: p.url(), dl, events: events(o.ctx).map(e => ({ en: e.en, ...e.params })) }; await o.b.close(); }
{ const o = await open(); await o.ctx.route('**/api/newsletter', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
  const p = await o.ctx.newPage(); await p.goto(BASE + POST, { waitUntil: 'networkidle' }); await p.waitForTimeout(1000); await p.evaluate(() => scrollTo(0, 1500)); await p.waitForTimeout(2500);
  const html = await p.evaluate(() => { const i = document.querySelector('input[type=email]'); return i.closest('form').outerHTML.slice(0, 600); }); console.log(html);
  await p.locator('input[type=email]').first().fill('qa-news@example.com'); await p.locator('input[type=email]').first().locator('xpath=ancestor::form//button').first().click(); await p.waitForTimeout(1500);
  const dl = await p.evaluate(() => (window.dataLayer || []).map(a => Array.from(a)).filter(a => a[0] === 'event' && a[1] !== 'page_view'));
  await p.waitForTimeout(7000); await flush(p, 3000);
  R.newsletter = { dl, events: events(o.ctx).map(e => ({ en: e.en, ...e.params })) }; await o.b.close(); }
save('T1_register_newsletter', R); console.log(JSON.stringify(R));
