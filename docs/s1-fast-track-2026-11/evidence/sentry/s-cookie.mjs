// Sentry check 5 cookies (Class Q) on 3100.
import { createRequire } from "module"; import fs from "fs";
const { chromium } = createRequire("/home/claude/")("playwright");
const base="http://localhost:3100";
const STUB=/(^|\.)googletagmanager\.com$|(^|\.)google-analytics\.com$|(^|\.)clarity\.ms$|(^|\.)facebook\.(net|com)$|(^|\.)doubleclick\.net$|(^|\.)bing\.com$/i;
const ALLOWED=new Set(["localhost","fonts.googleapis.com","fonts.gstatic.com"]); const off=new Set();
const b=await chromium.launch({proxy:{server:process.env.HTTPS_PROXY,bypass:"localhost,127.0.0.1"}});
const urls=["/season1?ad=D019&utm_source=meta&utm_medium=paid_social&utm_campaign=season1&utm_content=d19-a","/season1/join?src=ad&ad=d18","/season1?ad=zz","/season1?ad=d19&utm_source=share&utm_medium=referral"];
const out={};
for (const u of urls){ const ctx=await b.newContext({viewport:{width:412,height:915},isMobile:true,hasTouch:true});
 await ctx.route("**/*",r=>{const h=new URL(r.request().url()).hostname; if(STUB.test(h)) return r.fulfill({status:204,body:""}); r.continue();});
 ctx.on("response",rs=>{const h=new URL(rs.url()); if(h.protocol.startsWith("http")&&!ALLOWED.has(h.hostname)&&!STUB.test(h.hostname)) off.add(h.hostname);});
 const p=await ctx.newPage(); await p.goto(base+u+(u.includes("?")?"&":"?")+"s1qa=1",{waitUntil:"load"});
 const cdp=await ctx.newCDPSession(p); const {cookies}=await cdp.send("Network.getAllCookies"); const lc=cookies.find(c=>c.name==="ekuzo_lc");
 out[u]=lc?{httpOnly:lc.httpOnly,path:lc.path,value:JSON.parse(decodeURIComponent(lc.value))}:null; await ctx.close(); }
out._offenders=[...off]; fs.writeFileSync(process.argv[2],JSON.stringify(out,null,1)); console.log(JSON.stringify(out,null,1)); await b.close();
