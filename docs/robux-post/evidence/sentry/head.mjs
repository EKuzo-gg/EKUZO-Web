import { launchGuarded, newCtx, BASE } from '../lib.mjs';
const b = await launchGuarded(); const ctx = await newCtx(b); const p = await ctx.newPage();
await p.goto(BASE+'/blog/should-i-buy-my-kid-robux',{waitUntil:'load'});
const d = await p.evaluate(()=>{
 const norm=s=>s.replace(/\s+/g,' ').trim();
 const faq=[...document.querySelectorAll('.blog-content h3')].map(h=>({q:norm(h.textContent),a:norm(h.nextElementSibling.textContent)}));
 return {title:document.title, desc:document.querySelector('meta[name=description]').content,
  canon:document.querySelector('link[rel=canonical]').href,
  og:document.querySelector('meta[property="og:image"]').content, tw:document.querySelector('meta[name="twitter:image"]').content,
  ld:[...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>s.textContent), faq};
});
const out={};
const exp="Robux can be a cheap money lesson if you set the cap in dollars and talk about every purchase. What one 8-year-old did with $20, and the controls to turn on.";
console.log('title:',d.title,'| matches req:',d.title==="Should I buy my kid Robux? One dad’s $20 experiment");
console.log('desc exact:',d.desc===exp,'len',d.desc.length);
console.log('canonical:',d.canon);
console.log('og:',d.og,'tw:',d.tw,'same:',d.og===d.tw);
const local=d.og.replace('https://ekuzo.gg',BASE);
const r=await ctx.request.get(local); const buf=await r.body();
console.log('card status',r.status(),r.headers()['content-type'],buf.length);
// dims via jpeg/png parse
import fs from 'fs'; fs.writeFileSync('card.bin',buf);
console.log('JSON-LD blocks:',d.ld.length);
const objs=[];
d.ld.forEach((t,i)=>{ let o; try{o=JSON.parse(t);}catch(e){console.log(i,'PARSE ERROR',e.message);return;} const a=Array.isArray(o)?o:(o['@graph']||[o]); a.forEach(x=>objs.push({block:i,x})); console.log(`block ${i}: @type=${[].concat(a.map(x=>x['@type'])).join(',')}`);});
const faq=objs.find(o=>o.x['@type']==='FAQPage');
if(faq){ const q=faq.x.mainEntity; console.log('FAQ schema items',q.length,'visible',d.faq.length);
 q.forEach((e,i)=>{const v=d.faq[i]; console.log(i, 'Q eq',e.name===v.q,'A eq',e.acceptedAnswer.text.replace(/\s+/g,' ').trim()===v.a); if(e.acceptedAnswer.text.replace(/\s+/g,' ').trim()!==v.a){console.log('  schema:',e.acceptedAnswer.text);console.log('  visible:',v.a);} if(e.name!==v.q){console.log('  schema:',e.name,'| visible:',v.q)}});}
else console.log('NO FAQPage');
const bp=objs.filter(o=>o.x['@type']==='BlogPosting'||[].concat(o.x['@type']).includes('BlogPosting'));
bp.forEach(o=>console.log('BlogPosting', JSON.stringify({headline:o.x.headline,author:o.x.author,datePublished:o.x.datePublished,dateModified:o.x.dateModified,image:o.x.image,mainEntityOfPage:o.x.mainEntityOfPage,url:o.x.url,desc:o.x.description},null,1)));
const bc=objs.find(o=>o.x['@type']==='BreadcrumbList'); console.log('Breadcrumb',JSON.stringify(bc&&bc.x.itemListElement));
objs.filter(o=>!['FAQPage','BlogPosting','BreadcrumbList'].includes(o.x['@type'])).forEach(o=>console.log('other',o.block,JSON.stringify(o.x).slice(0,300)));
// author person @id resolves?
const ids=objs.map(o=>o.x['@id']).filter(Boolean); console.log('ids defined:',ids);
await b.close();
