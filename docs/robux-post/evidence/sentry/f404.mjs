import { launchGuarded, newCtx, BASE } from '../lib.mjs';
const b = await launchGuarded();
for(const path of ['/blog/should-i-buy-my-kid-robux','/blog/author/muhammad-hossain','/blog/should-you-ban-fortnite']){
const ctx=await newCtx(b); const p=await ctx.newPage();
p.on('requestfailed',r=>console.log(path,'FAILED',r.url(),r.failure()?.errorText));
p.on('response',r=>{if(r.status()>=400)console.log(path,r.status(),r.url())});
await p.goto(BASE+path,{waitUntil:'load'});await p.waitForTimeout(2500);
await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,60))}});await p.waitForTimeout(800);
console.log(path,'done, console:',ctx.qaRec.console.length);}
await b.close();
