import { chromium } from "playwright";
import fs from "fs";
const base=process.argv[2], outdir=process.argv[3];
const URLS={d2:"ad=d2",d4:"ad=d4",d1:"ad=d1",d3:"ad=d3","d19-games":"ad=d19&hero=games"};
const BLOCK=/google-analytics\.com|googletagmanager\.com|clarity\.ms|facebook\.com\/tr|connect\.facebook\.net|doubleclick\.net/;
const UA="Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0";
const b=await chromium.launch(); const res={}; let blocked=0;
for(const [k,q] of Object.entries(URLS)){
  const ctx=await b.newContext({viewport:{width:375,height:667},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:UA});
  await ctx.route("**/*",r=>BLOCK.test(r.request().url())?(blocked++,r.fulfill({status:204,body:""})):r.continue());
  const page=await ctx.newPage(); const cdp=await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions",{offline:false,latency:150,downloadThroughput:1.6*1024*1024/8,uploadThroughput:750*1024/8});
  await cdp.send("Emulation.setCPUThrottlingRate",{rate:4});
  await page.addInitScript(()=>{window.__ls=[];window.__t0=0;
    const d=n=>{if(!n)return"?";if(n.nodeType!==1)return"#text";return n.tagName.toLowerCase()+(n.id?"#"+n.id:"")+(typeof n.className==="string"&&n.className?"."+n.className.trim().split(/\s+/).slice(0,3).join("."):"")};
    const r=x=>x&&[Math.round(x.x),Math.round(x.y),Math.round(x.width),Math.round(x.height)];
    new PerformanceObserver(l=>{for(const e of l.getEntries()){window.__ls.push({t:Math.round(e.startTime),v:+e.value.toFixed(4),input:e.hadRecentInput,src:(e.sources||[]).map(s=>({n:d(s.node),prev:r(s.previousRect),cur:r(s.currentRect)}))})}}).observe({type:"layout-shift",buffered:true});
    // timeline of ihero/join state
    window.__tl=[];const t0=performance.now();
    const snap=()=>{const lp=document.getElementById("lp");if(!lp)return;const h=document.getElementById("hero"),ih=document.getElementById("ihero"),j=document.getElementById("join-top"),br=document.getElementById("bridge");
      const g=e=>e?Math.round(e.getBoundingClientRect().height):null;
      window.__tl.push({t:Math.round(performance.now()),hero:g(h),ih:g(ih),ihHidden:ih&&ih.hidden,join:g(j),joinParent:j&&j.parentElement.className,bridgeY:br?Math.round(br.getBoundingClientRect().y):null,cls:lp.className,fonts:document.fonts&&document.fonts.status})};
    const iv=setInterval(snap,100);setTimeout(()=>clearInterval(iv),9000);
  });
  const url=`${base}/season1?${q}&utm_source=meta&utm_content=${k}-qa`;
  const t0=Date.now();
  const shots=[1000,3000,6000]; 
  const nav=page.goto(url,{waitUntil:"load",timeout:90000});
  for(const s of shots){await page.waitForTimeout(Math.max(0,s-(Date.now()-t0)));await page.screenshot({path:`${outdir}/${k}-${s/1000}s.png`}).catch(()=>{});}
  await nav.catch(()=>{});
  await page.waitForTimeout(1500);
  const ls=await page.evaluate(()=>window.__ls), tl=await page.evaluate(()=>window.__tl);
  let max=0,cur=0,st=-1,la=-1;for(const e of ls){if(e.input)continue;if(st<0||e.t-la>1000||e.t-st>5000){cur=0;st=e.t}cur+=e.v;la=e.t;if(cur>max)max=cur}
  // compress timeline to changes
  const comp=[];let prev="";for(const x of tl){const key=JSON.stringify({...x,t:0});if(key!==prev){comp.push(x);prev=key}}
  res[k]={cls:+max.toFixed(4),total:+ls.reduce((a,e)=>a+e.v,0).toFixed(4),shifts:ls,timeline:comp};
  await ctx.close();
}
await b.close();
fs.writeFileSync(`${outdir}/raw.json`,JSON.stringify({blocked,res},null,1));
for(const[k,v]of Object.entries(res)){console.log("==",k,"CLS",v.cls);for(const s of v.shifts)console.log(" t",s.t,"v",s.v,JSON.stringify(s.src.slice(0,4)))}
