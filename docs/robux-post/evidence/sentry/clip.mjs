import { launchGuarded, newCtx, BASE } from '../lib.mjs';
const b = await launchGuarded();
for(const w of [375,768]){
const ctx=await newCtx(b,{viewport:{width:w,height:800}}); const p=await ctx.newPage();
await p.goto(BASE+'/blog/should-i-buy-my-kid-robux',{waitUntil:'load'}); await p.waitForTimeout(1500);
console.log('== width',w, await p.evaluate((w)=>{const o=[];document.querySelectorAll('.blog-content *').forEach(e=>{const r=e.getBoundingClientRect();if(r.width>0&&r.right>w+1)o.push(e.tagName+' right='+Math.round(r.right)+' w='+Math.round(r.width)+' | '+e.textContent.trim().slice(0,70))});
 const t=[...document.querySelectorAll('.blog-content table')].map(t=>[...t.querySelectorAll('td,th')].map(c=>c.scrollWidth>c.clientWidth+1?'CELL CLIPPED: '+c.textContent:null).filter(Boolean));
 return o.slice(0,20).join('\n')+'\ncells: '+JSON.stringify(t)+'\nbc clientW '+document.querySelector('.blog-content').clientWidth+' article overflow '+getComputedStyle(document.querySelector('article')).overflowX}, w));
}
const ctx=await newCtx(b,{viewport:{width:375,height:800}}); const p=await ctx.newPage();
await p.goto(BASE+'/blog/should-i-buy-my-kid-robux',{waitUntil:'load'}); await p.waitForTimeout(1500);
for(const [i,sel] of [[0,'.blog-content table:nth-of-type(1)'],[1,'.blog-content table:nth-of-type(2)']]) { const t=p.locator('.blog-content table').nth(i); await t.scrollIntoViewIfNeeded(); await t.screenshot({path:`shots/table${i+1}-375.png`}); }
const s=p.locator('.blog-content ul, .blog-content ol').last(); await s.scrollIntoViewIfNeeded(); await s.screenshot({path:'shots/sources-375.png'});
await b.close();
