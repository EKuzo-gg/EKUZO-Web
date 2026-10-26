import { launchGuarded, newCtx, BASE } from '../lib.mjs';
import fs from 'fs';
const b = await launchGuarded(); const ctx = await newCtx(b); const p = await ctx.newPage();
await p.goto(BASE+'/blog/should-i-buy-my-kid-robux',{waitUntil:'load'});
const links = await p.evaluate(()=>{
 const vis=e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'};
 const f=(root,area)=>[...root.querySelectorAll('a[href]')].map(a=>({area,text:a.textContent.trim().replace(/\s+/g,' ').slice(0,90),href:a.getAttribute('href'),visible:vis(a)}));
 const bc=document.querySelector('.blog-content');
 const rest=[...document.querySelectorAll('article ~ *, article a')].length;
 return [...f(bc,'body'), ...f(document.querySelector('article'),'article-all').filter(x=>true)];
});
const body=links.filter(l=>l.area==='body');
fs.writeFileSync('links-body.json',JSON.stringify(body,null,1));
const keep = await p.evaluate(()=>[...document.querySelectorAll('section a[href^="/blog/"]')].map(a=>({text:a.textContent.trim().replace(/\s+/g,' ').slice(0,80),href:a.getAttribute('href')})));
console.log('BODY LINKS',body.length); body.forEach((l,i)=>console.log(i,l.href.startsWith('/')?'INT':'EXT',l.href,'|',l.text.slice(0,50),'| vis',l.visible));
console.log('first "Roblox" link:', body.find(l=>l.text==='Roblox'));
console.log('KEEP READING cards:'); keep.forEach(k=>console.log(' ',k.href,'|',k.text));
const targets=[...new Set([...body.map(l=>l.href),...keep.map(k=>k.href)].filter(h=>h.startsWith('/')))];
console.log('INTERNAL STATUS');
for(const t of targets){const r=await ctx.request.get(BASE+t,{maxRedirects:0}); console.log(r.status(),t);}
await b.close();
