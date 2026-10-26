import { open, events, flush, save, BASE, POST } from './h.mjs';
const { b, ctx } = await open();
const p = await ctx.newPage();
await p.goto(BASE + POST, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
// observe at the event level: is defaultPrevented already true at document bubble?
await p.evaluate(() => { window.__dp = []; document.addEventListener('click', e => window.__dp.push({ dp: e.defaultPrevented, href: e.target.closest('a')?.getAttribute('href') }), false); });
const before = events(ctx).length;
const l = p.locator('article a[href="/parents"]').first(); await l.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
await l.click(); await p.waitForTimeout(1500);
console.log('url after', p.url(), JSON.stringify(await p.evaluate(() => window.__dp)));
await flush(p, 2500); await p.waitForTimeout(6000); await flush(p, 2500);
const ev = events(ctx).slice(before);
console.log(JSON.stringify(ev));
save('T4_probe_defaultPrevented', { url: p.url(), ev });
await b.close();
