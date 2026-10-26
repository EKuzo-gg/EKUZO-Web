import { launchGuarded, newCtx, BASE } from '../lib.mjs';
const b = await launchGuarded(); const ctx = await newCtx(b); const p = await ctx.newPage();
await p.goto(BASE+'/blog/should-i-buy-my-kid-robux',{waitUntil:'load'});
const r = await p.evaluate(()=>{
 const a=document.querySelector('article');
 const out=[];
 function walk(e,d){ if(d>5)return; for(const c of e.children){ out.push(' '.repeat(d)+c.tagName+'.'+(c.className||'').toString().slice(0,60)+' | '+c.textContent.trim().slice(0,50).replace(/\n/g,' ')); walk(c,d+1);} }
 walk(a,0); return out.slice(0,80).join('\n');});
console.log(r); await b.close();
