import { launchGuarded, newCtx, BASE } from '../lib.mjs';
const b = await launchGuarded();
const ctx=await newCtx(b,{viewport:{width:375,height:800}}); const p=await ctx.newPage();
await p.goto(BASE+'/blog/should-i-buy-my-kid-robux',{waitUntil:'load'}); await p.waitForTimeout(2000);
const r=await p.evaluate(()=>{
 const doc=document.scrollingElement;
 const tables=[...document.querySelectorAll('.blog-content table')].map(t=>{const tr=t.getBoundingClientRect();let c=t.parentElement;const cr=c.getBoundingClientRect();const cs=getComputedStyle(c);
   return {caption:t.querySelector('caption')?.textContent,tableW:Math.round(tr.width),tableRight:Math.round(tr.right),container:c.tagName+'.'+c.className,containerW:Math.round(cr.width),overflowX:cs.overflowX,scrollW:c.scrollWidth,clientW:c.clientWidth,th:t.querySelectorAll('th').length,thead:!!t.tHead,thScopes:[...t.querySelectorAll('th')].map(x=>x.getAttribute('scope')),fitsViewport:tr.right<=375+0.5}});
 const imgs=[...document.querySelectorAll('img')].map(i=>({src:(i.getAttribute('src')||'').slice(0,80),alt:i.getAttribute('alt'),decorative:i.alt===''}));
 const hs=[...document.querySelectorAll('article h1, article h2, article h3')].map(h=>+h.tagName[1]);
 const blog=[...document.querySelectorAll('.blog-content h2,.blog-content h3')].map(h=>h.tagName+':'+h.textContent.slice(0,30));
 // main-body heading order across h1 + blog-content
 const seq=[...document.querySelectorAll('article h1, .blog-content h2, .blog-content h3, .blog-content h4')].map(h=>+h.tagName[1]);
 let skips=[];for(let i=1;i<seq.length;i++) if(seq[i]-seq[i-1]>1) skips.push([i,seq[i-1],seq[i]]);
 const allh=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h=>+h.tagName[1]); let allskips=[];for(let i=1;i<allh.length;i++) if(allh[i]-allh[i-1]>1) allskips.push([i,allh[i-1],allh[i]]);
 const h1s=document.querySelectorAll('h1').length;
 return {sw:doc.scrollWidth,cw:document.documentElement.clientWidth,tables,imgs,seq,skips,allskips,allh,h1s};
});
console.log(JSON.stringify(r,null,1));
// parents accordion state before open
const p2=await (await newCtx(b)).newPage(); await p2.goto(BASE+'/parents',{waitUntil:'load'});
console.log('parents link before open:',await p2.evaluate(()=>{const a=document.querySelector('a[href="/blog/should-i-buy-my-kid-robux"]');let e=a,chain=[];while(e&&e!==document.body){const s=getComputedStyle(e);const r=e.getBoundingClientRect();chain.push(e.tagName+' h='+Math.round(r.height)+' ov='+s.overflow+' vis='+s.visibility+' op='+s.opacity+' mh='+s.maxHeight+' hidden='+e.hidden+(e.inert?' inert':''));e=e.parentElement;if(chain.length>6)break}return chain}));
// inbound sentences dashes
const sents=["If your kid's Roblox ask is for Robux instead, here's how one dad turned it into a $20 money lesson.","If spending is the worry, one dad let his daughter spend $20 of Robux on purpose, as a money lesson with a cap he can see.","The same move works on smaller asks. When his daughter wanted Robux, one dad on our team gave it a container: $20, a cap he can see, and a talk about every purchase.","(A dad on our team is running a smaller version of that deal with $20 of Robux.)","Related reading: How one dad handled the Robux ask"];
for(const s of sents) console.log('dash check',JSON.stringify({em:(s.match(/—/g)||[]).length,en:(s.match(/–/g)||[]).length,sp:(s.match(/ - /g)||[]).length,dd:(s.match(/--/g)||[]).length}),s.slice(0,60));
await b.close();
