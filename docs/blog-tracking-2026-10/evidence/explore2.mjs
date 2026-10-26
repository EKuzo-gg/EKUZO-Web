import { launchGuarded, newCtx, BASE } from '../lib.mjs';
const b = await launchGuarded(); const ctx = await newCtx(b,{suppressPopup:false});
await ctx.route('**/api/season-one', r=>r.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'}));
const p = await ctx.newPage();
await p.goto(`${BASE}/blog/should-i-buy-my-kid-robux`, { waitUntil: 'networkidle' });
await p.waitForTimeout(3500);
console.log(await p.evaluate(()=>document.querySelector('[role=dialog]')?.outerHTML.slice(0,3000)));
console.log(await p.evaluate(()=>typeof window.fbq+' '+String(window.fbq).slice(0,200)+' '+JSON.stringify(window.clarity?.q)));
await b.close();
