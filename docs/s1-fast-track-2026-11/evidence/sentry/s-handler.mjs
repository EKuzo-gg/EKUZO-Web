// Sentry check 6 (Class Q) on 3100.
import { createRequire } from "module"; import fs from "fs";
const { chromium } = createRequire("/home/claude/")("playwright");
const base="http://localhost:3100";
const UA="Mozilla/5.0 (Linux; Android 14; SM-S921U Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.6778.135 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/490.0.0.50.109;]";
const STUB=/(^|\.)googletagmanager\.com$|(^|\.)google-analytics\.com$|(^|\.)clarity\.ms$|(^|\.)facebook\.(net|com)$|(^|\.)doubleclick\.net$|(^|\.)bing\.com$/i;
const ALLOWED=new Set(["localhost","fonts.googleapis.com","fonts.gstatic.com"]); const off=new Set();
const b=await chromium.launch({proxy:{server:process.env.HTTPS_PROXY,bypass:"localhost,127.0.0.1"}});
async function mk(){ const ctx=await b.newContext({viewport:{width:412,height:915},deviceScaleFactor:2.625,isMobile:true,hasTouch:true,userAgent:UA});
 await ctx.route("**/*",r=>{const q=r.request();const u=new URL(q.url()); if(STUB.test(u.hostname)) return r.fulfill({status:204,body:""}); if(q.method()==="POST"&&u.pathname==="/api/season-one") return r.fulfill({status:200,contentType:"application/json",body:'{"ok":true}'}); r.continue();});
 ctx.on("response",rs=>{const u=new URL(rs.url()); if(u.protocol.startsWith("http")&&!ALLOWED.has(u.hostname)&&!STUB.test(u.hostname)) off.add(u.hostname);});
 return {ctx,page:await ctx.newPage()}; }
const out={};
// href
{ const {ctx,page}=await mk(); await page.goto(base+"/season1?ad=d19&utm_source=meta&utm_medium=paid_social&utm_campaign=s1&utm_content=d19-a&s1qa=1",{waitUntil:"load"}); await page.waitForTimeout(500);
  out.tagged=await page.evaluate(()=>window.S1.joinHref()); await ctx.close(); }
{ const {ctx,page}=await mk(); await page.goto(base+"/season1?s1qa=1",{waitUntil:"load"}); await page.waitForTimeout(500);
  out.bare=await page.evaluate(()=>window.S1.joinHref()); await ctx.close(); }
// zero [data-join] on every variant
out.joinEls={};
for (const v of [...Array.from({length:21},(_,i)=>"?ad=d"+(i+1)),""]) { const {ctx,page}=await mk(); await page.goto(base+"/season1"+v+(v?"&":"?")+"s1qa=1",{waitUntil:"load"}); await page.waitForTimeout(400);
  out.joinEls[v||"noad"]=await page.evaluate(()=>document.querySelectorAll("[data-join]").length); await ctx.close(); }
// clicks
{ const {ctx,page}=await mk(); await page.goto(base+"/season1?ad=d19&utm_source=meta&utm_medium=paid_social&utm_campaign=s1&utm_content=d19-a&s1qa=1",{waitUntil:"load"}); await page.waitForTimeout(1500);
  const count=async()=>page.evaluate(()=>({ga:(window.dataLayer||[]).map(a=>Array.from(a)).filter(a=>a[0]==="event"&&a[1]==="s1_join_click").map(a=>({n:a[1],p:{location:a[2].location,ad:a[2].ad}})),clarity:(window.clarity&&window.clarity.q||[]).map(a=>Array.from(a)).filter(a=>a[0]==="event"&&a[1]==="join_click").length}));
  await page.evaluate(()=>{const a=document.createElement("a");a.setAttribute("data-join","top");a.id="ftj";a.href="#ft";a.textContent="x";a.style.cssText="position:fixed;left:10px;top:300px;z-index:99999;background:#fff;padding:14px";document.body.appendChild(a);});
  out.t0=await count();
  // raw touch scroll (CDP touch events) down and back
  const cdp=await ctx.newCDPSession(page);
  const swipe=async(y0,y1)=>{ await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:200,y:y0}]}); for(let i=1;i<=8;i++){ await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:200,y:y0+(y1-y0)*i/8}]}); await page.waitForTimeout(16);} await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]}); await page.waitForTimeout(300); };
  await swipe(700,200); await swipe(700,200); await swipe(200,700);
  out.scrollY=await page.evaluate(()=>scrollY);
  out.tAfterScroll=await count();
  await page.evaluate(()=>document.getElementById("ftj").focus()); await page.keyboard.press("Tab"); await page.keyboard.press("Shift+Tab");
  await page.evaluate(()=>{const i=document.getElementById("em-top"); i.focus(); i.value="qa+sentry@example.com"; i.dispatchEvent(new Event("input",{bubbles:true})); i.dispatchEvent(new Event("change",{bubbles:true})); i.dispatchEvent(new ClipboardEvent("paste",{bubbles:true}));});
  await page.waitForTimeout(300);
  out.tAfterFocusTabPaste=await count();
  await page.tap("#ftj"); await page.waitForTimeout(200); out.tClick1=await count();
  await page.tap("#ftj"); await page.waitForTimeout(200); out.tClick2=await count();
  await ctx.close(); }
out._offenders=[...off]; fs.writeFileSync(process.argv[2],JSON.stringify(out,null,1)); console.log(JSON.stringify(out)); await b.close();
