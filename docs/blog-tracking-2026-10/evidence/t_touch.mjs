import { open, events, flush, save, BASE, POST, stay } from './h.mjs';
const R = {};
async function t(name, setup, action) {
  const o = await open({ viewport: { width: 375, height: 812 }, ctx: { hasTouch: true, isMobile: true } });
  const p = await o.ctx.newPage(); await p.goto(BASE + POST, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(2000); await stay(p);
  const sel = await setup(p);
  const bb = await p.locator(sel).first().boundingBox();
  const x = bb.x + Math.min(bb.width / 2, 20), y = bb.y + bb.height / 2;
  const s0 = await p.evaluate(() => scrollY);
  await action(p, x, y);
  await p.waitForTimeout(600);
  const s1 = await p.evaluate(() => scrollY);
  const dl = await p.evaluate(() => (window.dataLayer || []).map(a => Array.from(a)).filter(a => a[0] === 'event' && a[1] !== 'page_view').map(a => a.slice(1)));
  await p.waitForTimeout(6000); await flush(p, 2500);
  R[name] = { scrollBefore: s0, scrollAfter: s1, dataLayer: dl, beacons: events(o.ctx).filter(e => e.en !== 'page_view').map(e => ({ en: e.en, ...e.params })) };
  console.log(name, JSON.stringify(R[name])); await o.b.close();
}
const plain = (href) => async (p) => { await p.evaluate((h) => { const a = document.createElement('a'); a.href = h; a.textContent = 'QA LINK PLAIN'; a.id = 'qa-inj'; a.style.cssText = 'display:block;padding:16px;background:#ff0;color:#000;font-size:20px'; document.querySelector('article').prepend(a); window.scrollTo(0, 1500); a.style.position='fixed'; a.style.top='300px'; a.style.left='20px'; a.style.zIndex=99999; }, href); await p.waitForTimeout(500); return '#qa-inj'; };
const realLink = async (p) => { await p.evaluate(() => { const a = document.querySelector('article a[href="/parents"]'); a.scrollIntoView({ block: 'center' }); }); await p.waitForTimeout(600); return 'article a[href="/parents"]'; };
const scrollFromLink = async (p, x, y) => {
  const c = await p.context().newCDPSession(p);
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let i = 1; i <= 8; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - 25 * i }] }); await p.waitForTimeout(30); }
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
};
// plain anchors: fixed position would not scroll with page; for scroll test use non-fixed one
const plainScrollable = (href) => async (p) => { await p.evaluate((h) => { const a = document.createElement('a'); a.href = h; a.textContent = 'QA LINK PLAIN'; a.id = 'qa-inj'; a.style.cssText = 'display:block;padding:24px;background:#ff0;color:#000;font-size:20px'; const art=document.querySelector('article'); art.insertBefore(a, art.children[Math.min(5, art.children.length-1)]); a.scrollIntoView({ block: 'center' }); }, href); await p.waitForTimeout(600); return '#qa-inj'; };
await t('touch_scroll_from_plain_link', plainScrollable('/parents'), scrollFromLink);
await t('touch_scroll_from_real_link', realLink, scrollFromLink);
await t('touch_tap_plain_link_control', plainScrollable('/parents'), async (p, x, y) => { await p.touchscreen.tap(x, y); });
await t('touch_tap_real_link', realLink, async (p, x, y) => { await p.touchscreen.tap(x, y); });
save('T4_touch', R);
