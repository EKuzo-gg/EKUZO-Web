import { open, events, flush, save, BASE, POST, stay } from './h.mjs';
const R = {};
const S = { parents: 'article a[href="/parents"]', post: 'article a[href="/blog/should-you-ban-fortnite"]', card: 'a[href="/blog/gaming-programs-for-kids"]', nav: 'nav a[href="/parents"]', foot: 'footer a[href="/parents"]', ext: 'article a[href^="https://en.help.roblox.com"]' };
async function run(name, { sel, opts = {}, touch = false, scroll = false, dialog = false, keep = false }) {
  const o = await open(touch ? { viewport: { width: 375, height: 812 }, ctx: { hasTouch: true, isMobile: true }, suppressPopup: !dialog } : { suppressPopup: !dialog });
  const p = await o.ctx.newPage(); await p.goto(BASE + POST, { waitUntil: 'domcontentloaded' });
  if (dialog) await p.waitForSelector('[role=dialog]', { timeout: 9000 }); else await p.waitForTimeout(2000);
  if (!keep) await stay(p);
  let note = '';
  if (dialog) { await p.evaluate(() => { const a = document.createElement('a'); a.href = '/parents'; a.textContent = 'QA'; a.id = 'qa-d'; a.style.cssText = 'position:fixed;top:80px;left:80px;z-index:99999;background:#ff0;color:#000;padding:8px'; document.querySelector('[role=dialog]').append(a); }); sel = '#qa-d'; note = 'dialog has no native links; injected <a href=/parents> in [role=dialog]'; }
  const l = p.locator(sel).first(); await l.scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
  const y0 = await p.evaluate(() => scrollY);
  if (scroll) { const bb = await l.boundingBox(); const x = bb.x + Math.min(bb.width / 2, 20), y = bb.y + bb.height / 2; const c = await o.ctx.newCDPSession(p);
    await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let i = 1; i <= 8; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - 25 * i }] }); await p.waitForTimeout(30); }
    await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
  else if (touch) { const bb = await l.boundingBox(); await p.touchscreen.tap(bb.x + Math.min(bb.width / 2, 20), bb.y + bb.height / 2); }
  else await l.click(opts);
  await p.waitForTimeout(600);
  const y1 = await p.evaluate(() => scrollY).catch(() => 'nav');
  const dl = await p.evaluate(() => (window.dataLayer || []).map(a => Array.from(a)).filter(a => a[0] === 'event' && a[1] === 'blog_link_click').map(a => a.slice(1))).catch(() => ['page gone']);
  await p.waitForTimeout(6500); await flush(p, 2500).catch(() => {});
  R[name] = { url: p.url(), y0, y1, dataLayer: dl, beacons: events(o.ctx).filter(e => e.en === 'blog_link_click').map(e => ({ en: e.en, ...e.params })), note };
  console.log(name.padEnd(22), 'dl=' + JSON.stringify(dl.map(d => d[1] && d[1].link_path + '/' + d[1].link_type)), 'beacons=' + R[name].beacons.length, R[name].beacons.map(b => `${b['ep.link_path']}/${b['ep.link_type']}/${b['ep.post_slug']}`).join(';'), note);
  await o.b.close();
}
const T = [
 ['pos_parents', { sel: S.parents, keep: true }], ['pos_post', { sel: S.post, keep: true }], ['pos_keepreading', { sel: S.card, keep: true }],
 ['pos_touch_tap_parents', { sel: S.parents, touch: true, keep: true }],
 ['neg_ctrl', { sel: S.parents, opts: { modifiers: ['Control'] } }], ['neg_meta', { sel: S.parents, opts: { modifiers: ['Meta'] } }], ['neg_shift', { sel: S.parents, opts: { modifiers: ['Shift'] } }], ['neg_alt', { sel: S.parents, opts: { modifiers: ['Alt'] } }], ['neg_middle', { sel: S.parents, opts: { button: 'middle' } }],
 ['neg_nav', { sel: S.nav, keep: true }], ['neg_footer', { sel: S.foot, keep: true }], ['neg_external', { sel: S.ext }], ['neg_dialog', { dialog: true }],
 ['neg_touch_scroll_real', { sel: S.parents, touch: true, scroll: true }],
];
for (let i = 0; i < T.length; i += 5) await Promise.all(T.slice(i, i + 5).map(([n, o]) => run(n, o)));
save('RT_T4', R);
