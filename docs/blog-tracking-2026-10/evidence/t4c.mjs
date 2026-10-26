import { open, events, flush, save, BASE, POST, stay } from './h.mjs';
const R = {};
await Promise.all([['Control'], ['Shift'], []].map(async (mods) => {
  const o = await open(); const p = await o.ctx.newPage(); await p.goto(BASE + POST, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(2000); await stay(p);
  const l = p.locator('article a[href="/parents"]').first(); await l.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
  await p.evaluate(()=>{ window.__dp=[]; document.addEventListener('click',e=>window.__dp.push(e.defaultPrevented)); });
  await l.click({ modifiers: mods }); await p.waitForTimeout(500);
  const dl = await p.evaluate(() => ({ dp: window.__dp, ev: (window.dataLayer || []).map(a => Array.from(a)).filter(a => a[0] === 'event' && a[1] === 'blog_link_click').map(a => a.slice(1)) }));
  await p.waitForTimeout(6500); await flush(p, 2500);
  R['real_link_mods_' + (mods.join('+') || 'none')] = { ...dl, beacons: events(o.ctx).filter(e => e.en === 'blog_link_click').map(e => ({ en: e.en, ...e.params })) }; await o.b.close();
}));
save('T4_real_link_modifiers', R); console.log(JSON.stringify(R));
