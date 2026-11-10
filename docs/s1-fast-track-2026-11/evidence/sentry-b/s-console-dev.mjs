// Sentry B check 8 (dev, Class T): 22 landing variants, no ?s1qa, no form. Analytics hosts are aborted and counted (expected 0 attempts).
import { createRequire } from "module"; import fs from "fs";
const { chromium } = createRequire("/home/claude/")("playwright");
const [base, out] = process.argv.slice(2);
const UA="Mozilla/5.0 (Linux; Android 14; SM-S921U Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.6778.135 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/490.0.0.50.109;]";
const AN=/(^|\.)(googletagmanager\.com|google-analytics\.com|analytics\.google\.com|clarity\.ms|facebook\.(net|com)|doubleclick\.net|bing\.com)$/i;
const b=await chromium.launch({proxy:{server:process.env.HTTPS_PROXY,bypass:"localhost,127.0.0.1"}});
const paths=["/season1",...Array.from({length:21},(_,i)=>"/season1?ad=d"+(i+1))];
const rows=[];
for(const p of paths){ const ctx=await b.newContext({viewport:{width:412,height:915},deviceScaleFactor:2.625,isMobile:true,hasTouch:true,userAgent:UA});
 const e={path:p,console:[],pageerror:[],requestfailed:[],analytics:[],http4xx:[],posts:0};
 await ctx.route("**/*",r=>{const q=r.request(); const u=new URL(q.url()); if(AN.test(u.hostname)){ e.analytics.push(u.hostname); return r.abort(); } if(q.method()==="POST") e.posts++; return r.continue();});
 const page=await ctx.newPage();
 page.on("console",m=>{if(m.type()==="error")e.console.push(m.text().slice(0,200));}); page.on("pageerror",x=>e.pageerror.push(x.message));
 page.on("requestfailed",r=>{ const u=r.url(); if(!AN.test(new URL(u).hostname)) e.requestfailed.push(u.slice(0,140)+" "+(r.failure()?.errorText||"")); });
 page.on("response",r=>{if(r.status()>=400) e.http4xx.push(r.status()+" "+r.url().slice(0,120));});
 let resp=null; try{ resp=await page.goto(base+p,{waitUntil:"load",timeout:60000}); }catch(err){ e.gotoError=String(err).slice(0,120); resp=await page.goto(base+p,{waitUntil:"domcontentloaded",timeout:60000}).catch(()=>null); } e.status=resp?resp.status():null; await page.waitForTimeout(8000);
 e.marker=await page.evaluate(()=>document.querySelector('meta[name="s1-build"]')?.content); e.ready=await page.evaluate(()=>document.documentElement.dataset.s1Ready);
 rows.push(e); await ctx.close(); console.log(p,e.status,e.marker,"ready",e.ready,"console",e.console.length,"pageerror",e.pageerror.length,"reqfailed",e.requestfailed.length,"analytics",e.analytics.length,"posts",e.posts); }
fs.writeFileSync(out,JSON.stringify(rows,null,1)); await b.close();
