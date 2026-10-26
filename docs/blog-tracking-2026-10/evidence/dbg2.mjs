import { open, events, flush, save, BASE, stay } from './h.mjs';
const o = await open(); const p = await o.ctx.newPage();
await p.goto(BASE + '/programs/ekuzo100', { waitUntil: 'networkidle' }); await p.waitForTimeout(2000); await stay(p);
const l = p.locator('a[href*="register?cta=hero"]').first(); await l.scrollIntoViewIfNeeded();
console.log(await p.evaluate(() => { const a = document.querySelector('a[href*="register?cta=hero"]'); const r = a.getBoundingClientRect(); const e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { r: [r.x, r.y, r.width, r.height], hit: e && e.outerHTML.slice(0, 150), same: a.contains(e) }; }));
await l.click(); await p.waitForTimeout(300);
console.log(JSON.stringify(await p.evaluate(() => (window.dataLayer || []).map(a => Array.from(a)).filter(a => a[0] === 'event'))));
await o.b.close();
