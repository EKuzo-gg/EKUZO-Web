import { launchGuarded, newCtx, BASE } from '../lib.mjs';
const b = await launchGuarded(); const ctx = await newCtx(b); const p = await ctx.newPage();
const T='/blog/should-i-buy-my-kid-robux';
for(const path of ['/blog/gaming-programs-for-kids','/blog/should-you-ban-fortnite','/blog/what-your-kids-gaming-is-telling-you','/blog/when-your-sons-only-friends-are-online']){
 await p.goto(BASE+path,{waitUntil:'load'});
 const r=await p.evaluate((T)=>{
  const as=[...document.querySelectorAll(`a[href="${T}"]`)];
  const vis=e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&s.opacity!=='0'};
  const body=document.querySelector('.blog-content');
  return {count:as.length, inBody:as.filter(a=>body&&body.contains(a)).length, items:as.map(a=>({vis:vis(a),text:a.textContent.trim(),sentence:(a.closest('p,li')||a.parentElement).textContent.trim().replace(/\s+/g,' ')})),
   updated:(document.body.innerText.match(/Updated\s+[A-Z][a-z]+ \d+, \d{4}/)||[null])[0]};
 },T);
 console.log(path,JSON.stringify(r,null,1));
}
await p.goto(BASE+'/parents',{waitUntil:'load'});
const q=p.getByText('How do you keep online spaces safe?').first();
console.log('faq q count',await p.getByText('How do you keep online spaces safe?').count());
await q.scrollIntoViewIfNeeded(); await q.click(); await p.waitForTimeout(800);
const r=await p.evaluate((T)=>{const a=[...document.querySelectorAll(`a[href="${T}"]`)];const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0};
 return a.map(x=>({vis:vis(x),text:x.textContent.trim(),ctx:(x.closest('p,li,div')||x.parentElement).textContent.trim().replace(/\s+/g,' ')}))},T);
console.log('parents after open',JSON.stringify(r,null,1));
await p.screenshot({path:'parents-faq-open.png'});
// before open check
const ctx2=await newCtx(b); const p2=await ctx2.newPage(); await p2.goto(BASE+'/parents',{waitUntil:'load'});
console.log('parents link visible BEFORE opening:',await p2.evaluate((T)=>[...document.querySelectorAll(`a[href="${T}"]`)].map(x=>{const r=x.getBoundingClientRect();return r.width>0&&r.height>0}),T));
await b.close();
