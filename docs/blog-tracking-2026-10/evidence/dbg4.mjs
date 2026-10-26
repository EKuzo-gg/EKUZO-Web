import { open, BASE } from './h.mjs';
const o = await open(); const p = await o.ctx.newPage();
await p.goto(BASE + '/programs/ekuzo100', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
await p.evaluate(() => { window.__ev = []; for (const t of ['pointerdown','mousedown','mouseup','click']) window.addEventListener(t, e => window.__ev.push([t, e.target.tagName, e.target.getAttribute('href'), e.defaultPrevented, e.isTrusted]), true); const g = window.gtag; window.__g = []; window.gtag = function () { window.__g.push(Array.from(arguments)); return g.apply(this, arguments); }; });
const l = p.locator('a[href*="register?cta=hero"]').first(); await l.scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
await l.click({ noWaitAfter: true }); await p.waitForTimeout(1500);
console.log(p.url(), JSON.stringify(await p.evaluate(() => [window.__ev, window.__g])));
await o.b.close();
