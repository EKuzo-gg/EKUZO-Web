import { launchGuarded, newCtx, BASE } from '../lib.mjs';
const b = await launchGuarded(); const ctx = await newCtx(b);
const p = await ctx.newPage();
await p.goto(`${BASE}/blog/should-i-buy-my-kid-robux`, { waitUntil: 'networkidle' });
console.log(await p.evaluate(()=>({h:document.documentElement.scrollHeight, art:!!document.querySelector('article'), ah:document.querySelector('article')?.getBoundingClientRect().height, top:document.querySelector('article')?.getBoundingClientRect().top+scrollY,
 links:[...document.querySelectorAll('a[href]')].map(a=>[a.getAttribute('href'), a.closest('article')?'ART':a.closest('nav')?'NAV':a.closest('footer')?'FOOT':a.closest('header')?'HDR':'other', Math.round(a.getBoundingClientRect().top+scrollY)].join(' '))})));
await b.close();
