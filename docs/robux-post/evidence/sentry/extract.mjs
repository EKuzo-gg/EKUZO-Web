import { launchGuarded, newCtx, BASE } from '../lib.mjs';
import fs from 'fs';
const b = await launchGuarded(); const ctx = await newCtx(b); const p = await ctx.newPage();
await p.goto(BASE+'/blog/should-i-buy-my-kid-robux',{waitUntil:'load'});
const r = await p.evaluate(()=>{
 const a=document.querySelector('article');
 const bc=a.querySelector('.blog-content');
 const clone=bc.cloneNode(true);
 clone.querySelectorAll('table').forEach(t=>t.remove());
 // block-level text lines
 const lines=[];
 clone.querySelectorAll('h2,h3,p,li').forEach(e=>{ if(e.tagName==='P'&&e.parentElement.tagName==='BLOCKQUOTE'){} lines.push(e.tagName+'\t'+e.textContent.replace(/\s+/g,' ').trim());});
 return {h1:a.querySelector('h1').textContent, sub:a.querySelector('h1').parentElement.querySelector('p').textContent, lines, rail:a.querySelector('.lg\\:sticky').innerText, tables:[...bc.querySelectorAll('table')].map(t=>t.innerText), imgs:[...a.querySelectorAll('img')].map(i=>({src:i.getAttribute('src'),alt:i.alt,w:i.naturalWidth,h:i.naturalHeight}))};
});
fs.writeFileSync('rendered.json',JSON.stringify(r,null,1));
console.log(r.lines.map(l=>l.slice(0,90)).join('\n')); console.log(r.rail, r.imgs, r.tables);
await b.close();
