import { open, events, flush, save, BASE, POST, stay } from './h.mjs';
const R = {};
const ALL=[]; const TASKS=[];
async function run(name, fn, { noStay = false } = {}) {
  const o = await open(); const ctx = o.ctx; const p = await ctx.newPage();
  await p.goto(BASE + POST, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(1500);
  if (!noStay) await stay(p);
  const before = events(ctx).length; let note = '';
  try { note = (await fn(p)) || ''; } catch (e) { note = 'ERR ' + String(e).split('\n')[0]; }
  await p.waitForTimeout(400); const dl = await p.evaluate(()=>(window.dataLayer||[]).map(a=>Array.from(a)).filter(a=>a[0]==='event'&&a[1]!=='page_view').map(a=>a.slice(1))).catch(()=>['(page navigated away)']); await p.waitForTimeout(6000); await flush(p, 2500);
  const ev = events(ctx).slice(before).filter(e => !['page_view'].includes(e.en)); ALL.push([name, events(ctx)]);
  R[name] = { events: ev.map(e => ({ en: e.en, ...e.params })), dataLayer: dl, note };
  console.log(name.padEnd(28), JSON.stringify(R[name].events), 'DL', JSON.stringify(dl), note);
  await o.b.close();
}
const real = (sel, opts = {}) => async (p) => { const l = p.locator(sel).first(); await l.scrollIntoViewIfNeeded(); await p.waitForTimeout(300); await l.click(opts); return 'real next/link, ' + JSON.stringify(opts); };
const inj = (container, href, opts = {}, extra = '') => async (p) => {
  await p.evaluate(([c, h]) => { const a = document.createElement('a'); a.href = h; a.textContent = 'QA LINK'; a.id = 'qa-inj'; a.style.cssText = 'display:inline-block;padding:8px;background:#ff0;color:#000;position:relative;z-index:99999'; (document.querySelector(c) || document.body).prepend(a); a.scrollIntoView({block:'center'}); }, [container, href]);
  await p.waitForTimeout(300); await p.locator('#qa-inj').click(opts); return `injected PLAIN <a href="${href}"> into <${container}> ${JSON.stringify(opts)} ${extra}`;
};
// real Link positives (NO stay: real navigation is client-side)
for (const [n, s] of [['pos_parents', 'article a[href="/parents"]'], ['pos_post', 'article a[href="/blog/should-you-ban-fortnite"]'], ['pos_keepreading', 'a[href="/blog/gaming-programs-for-kids"]']]) TASKS.push(()=>run(n + '_REAL', real(s), { noStay: true }));
// plain-anchor control: filters
TASKS.push(()=>run('ctl_plain_parents_article', inj('article', '/parents')));
TASKS.push(()=>run('ctl_plain_post_article', inj('article', '/blog/should-you-ban-fortnite')));
TASKS.push(()=>run('ctl_plain_external', inj('article', 'https://example.org/x')));
TASKS.push(()=>run('ctl_plain_samepath', inj('article', POST)));
TASKS.push(()=>run('ctl_plain_hash', inj('article', '#sec')));
TASKS.push(()=>run('ctl_plain_nav', inj('nav', '/parents')));
TASKS.push(()=>run('ctl_plain_footer', inj('footer', '/parents')));
TASKS.push(()=>run('ctl_plain_right', inj('article', '/parents', { button: 'right' })));
TASKS.push(()=>run('ctl_plain_middle', inj('article', '/parents', { button: 'middle' })));
for (const m of ['Control', 'Meta', 'Shift', 'Alt']) TASKS.push(()=>run('ctl_plain_mod_' + m, inj('article', '/parents', { modifiers: [m] })));
// real nav/footer links (real Link, vacuous but required)
TASKS.push(()=>run('neg_nav_REAL', real('nav a[href="/parents"]'), { noStay: true }));
TASKS.push(()=>run('neg_footer_REAL', real('footer a[href="/parents"]'), { noStay: true }));
TASKS.push(()=>run('neg_external_REAL', real('article a[href^="https://en.help.roblox.com"]')));
TASKS.push(()=>run('neg_mouse_drag', async p => { const l = p.locator('article a[href="/parents"]').first(); await l.scrollIntoViewIfNeeded(); const bb = await l.boundingBox(); await p.mouse.move(bb.x + 3, bb.y + 3); await p.mouse.down(); await p.mouse.move(bb.x + 3, bb.y + 153, { steps: 5 }); await p.mouse.up(); return 'drag off a real link'; }));
for (let i=0;i<TASKS.length;i+=6) await Promise.all(TASKS.slice(i,i+6).map(f=>f()));
// popup dialog
{
  const o = await open({ suppressPopup: false }); const c2 = o.ctx;
  const p = await c2.newPage(); await p.goto(BASE + POST, { waitUntil: 'domcontentloaded' }); await p.waitForSelector('[role=dialog]', { timeout: 9000 }); await stay(p);
  const links = await p.evaluate(() => [...document.querySelectorAll('[role=dialog] a[href]')].map(a => a.getAttribute('href')));
  const before = events(c2).length;
  await p.evaluate(() => { const a = document.createElement('a'); a.href = '/parents'; a.textContent = 'QA'; a.id = 'qa-d'; a.style.cssText='position:fixed;top:80px;left:80px;z-index:99999;background:#ff0;color:#000;padding:8px'; document.querySelector('[role=dialog]').append(a); });
  await p.locator('#qa-d').click(); await p.waitForTimeout(6500); await flush(p, 2500);
  R.ctl_plain_in_dialog = { events: events(c2).slice(before).filter(e => e.en !== 'page_view').map(e => ({ en: e.en, ...e.params })), note: 'native dialog links: ' + JSON.stringify(links) + '; injected plain <a href=/parents> in [role=dialog]' };
  console.log('ctl_plain_in_dialog', JSON.stringify(R.ctl_plain_in_dialog)); await o.b.close();
}
save('T4_mouse', R); save('T4_all_events', ALL);
