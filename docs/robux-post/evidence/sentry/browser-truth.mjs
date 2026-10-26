import { launchGuarded, newCtx, BASE } from '../lib.mjs';
import fs from 'fs';
const pages=['/blog/should-i-buy-my-kid-robux','/blog/gaming-programs-for-kids','/blog/should-you-ban-fortnite','/blog/what-your-kids-gaming-is-telling-you','/blog/when-your-sons-only-friends-are-online','/parents','/blog','/blog/author/karlin-oei','/blog/author/jamie-fitch','/blog/author/muhammad-hossain','/blog/gaming-study-13-7-years-younger-what-it-means-for-kids'];
const b = await launchGuarded(); const res=[]; const ext=new Set();
for(const w of [375,1440]){
 for(const path of pages){
  const ctx=await newCtx(b,{viewport:{width:w,height:900}}); const p=await ctx.newPage(); const bad4=[]; p.on('response',r=>{if(r.status()>=400)bad4.push(r.status()+' '+r.url())});
  await p.goto(BASE+path,{waitUntil:'load'}); await p.waitForTimeout(2500);
  // scroll to trigger lazy things
  await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,60))}scrollTo(0,0)}); await p.waitForTimeout(800);
  const sw=await p.evaluate(()=>({sw:document.scrollingElement.scrollWidth,cw:document.documentElement.clientWidth}));
  ctx.qaRec.external.forEach(e=>ext.add(e.url.split('?')[0]));
  res.push({w,path,console:[...ctx.qaRec.console],pageErrors:[...ctx.qaRec.pageErrors],http:[...new Set(bad4)],overflow:sw.sw>w,sw:sw.sw});
  if(path==='/blog/should-i-buy-my-kid-robux') await p.screenshot({path:`shots/post-${w}.png`,fullPage:true});
  await ctx.close();
 }
}
// 768 shot of post
{const ctx=await newCtx(b,{viewport:{width:768,height:900}});const p=await ctx.newPage();await p.goto(BASE+pages[0],{waitUntil:'load'});await p.waitForTimeout(1500);await p.screenshot({path:'shots/post-768.png',fullPage:true});await ctx.close();}
fs.writeFileSync('browser-truth.json',JSON.stringify(res,null,1));
const known=/torn-paper-red-top-2@2x\.png|new%20torn%20paper/;
let bad=0;
for(const r of res){ const nk=r.http.filter(x=>known.test(x)).length; const c=r.console.slice(nk), h=r.http.filter(x=>!known.test(x)); const knownN=r.console.length-c.length+r.http.length-h.length;
 const flag=c.length||h.length||r.pageErrors.length||r.overflow; if(flag)bad++;
 console.log(`${flag?'ISSUE':'ok   '} ${r.w} ${r.path} consoleErr=${c.length} pageErr=${r.pageErrors.length} http4xx=${h.length} knownEnv=${knownN} scrollW=${r.sw}`);
 c.forEach(x=>console.log('    console:',x.slice(0,200))); h.forEach(x=>console.log('    http:',x)); r.pageErrors.forEach(x=>console.log('    pageerr:',x.slice(0,200)));}
console.log('external URLs attempted (all stubbed by guard):',[...ext].join(', '));
console.log('pages with issues',bad);
await b.close();
