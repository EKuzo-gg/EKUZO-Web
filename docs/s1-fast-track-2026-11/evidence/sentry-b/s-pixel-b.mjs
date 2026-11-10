// Sentry B check 3: pixel parity main(3101) vs branch(3100), section-aligned, with a 1 px tolerant diff mask and bounding boxes.
// usage: node s-pixel-b.mjs <outDir>
import { createRequire } from "module"; import fs from "fs"; import path from "path"; import crypto from "crypto";
const { chromium } = createRequire("/home/claude/")("playwright");
const sharp = createRequire("/home/claude/wt-sentry/")("sharp");
const outDir = process.argv[2]; const MODE = process.argv[3] || "plain"; fs.mkdirSync(outDir, { recursive: true });
const STUB = /(^|\.)(googletagmanager\.com|google-analytics\.com|clarity\.ms|facebook\.(net|com)|doubleclick\.net|bing\.com)$/i;
const ALLOWED = new Set(["localhost","127.0.0.1","fonts.googleapis.com","fonts.gstatic.com"]);
const offenders = new Set();
const browser = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY, bypass: "localhost,127.0.0.1" } });
const ADS = process.env.ADS ? process.env.ADS.split(",").map(x=>x==="noad"?"":x) : ["", "d18","d19","d2","d4","d6","d9","d11","d13","d14","d21"];
const vps = [{n:"412",w:412,h:915,dpr:2.625,m:true},{n:"1440",w:1440,h:900,dpr:1,m:false}];
const md5 = b => crypto.createHash("md5").update(b).digest("hex");
async function open(base, ad, vp, isBranch) {
  const ctx = await browser.newContext({ viewport:{width:vp.w,height:vp.h}, deviceScaleFactor:vp.dpr, isMobile:vp.m, hasTouch:vp.m, reducedMotion:"reduce" });
  await ctx.route("**/*", r => { const q=r.request(); const u=new URL(q.url());
    if (STUB.test(u.hostname)) return r.fulfill({status:204,body:""});
    if (q.method()==="POST" && u.pathname==="/api/season-one") return r.fulfill({status:200,contentType:"application/json",body:'{"ok":true}'});
    if (q.resourceType()==="image") return r.abort();
    return r.continue(); });
  ctx.on("response", res => { const u=new URL(res.url()); if(u.protocol.startsWith("http")&&!ALLOWED.has(u.hostname)&&!STUB.test(u.hostname)) offenders.add(u.hostname); });
  await ctx.addInitScript(()=>{ Math.random=()=>0.25; try{localStorage.clear()}catch(_){} });
  const page = await ctx.newPage();
  await page.goto(base+"/season1"+(ad?"?ad="+ad:""),{waitUntil:"load"});
  await page.addStyleTag({content:"*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition:none!important;caret-color:transparent!important}#sticky{display:none!important}"+(MODE==="mask"&&isBranch?".ready,.ready-note,.lock{display:none!important}":"")});
  await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(1500);
  return { ctx, page };
}
const rectsJs = () => { const R=e=>{ if(!e) return null; const b=e.getBoundingClientRect(); return {x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}; };
  const secs=[...document.querySelectorAll("#lp > *")].filter(e=>e.tagName!=="SCRIPT"&&e.getBoundingClientRect().height>0).map((e,i)=>({key:e.tagName+(e.id?"#"+e.id:"")+(e.className?"."+String(e.className).split(" ")[0]:""),r:R(e)}));
  const vis=e=>e&&e.getBoundingClientRect().height>0;
  return { secs,
    joinTop:R(document.getElementById("join-top")), joinEnd:R(document.getElementById("join-end")),
    ctas:[...document.querySelectorAll(".hero .cta, .ihero .cta")].filter(vis).map(R),
    mini:[...document.querySelectorAll(".mini-cta")].filter(vis).map(R),
    faq:[...document.querySelectorAll(".faq details")].map(R),
    ctaText:[...document.querySelectorAll(".hero .cta, .ihero .cta")].map(e=>e.textContent.trim()),
    w:document.documentElement.scrollWidth, h:document.documentElement.scrollHeight }; };
async function crop(buf, info, dpr, y0, y1, x0=0, x1=null) {
  const W=info.width,H=info.height; const top=Math.max(0,Math.round(y0*dpr)), bot=Math.min(H,Math.round(y1*dpr));
  const left=Math.round(x0*dpr), right=x1==null?W:Math.min(W,Math.round(x1*dpr));
  return { top, h:bot-top, w:right-left, data: await sharp(buf,{raw:{width:W,height:H,channels:4}}).extract({left,top,width:right-left,height:Math.max(1,bot-top)}).raw().toBuffer() };
}
// tolerant diff: strict differing pixels (delta>16) that have no match within +-1 px in the other image
function diffMask(A,B,w,h) {
  const bad=[]; const D=(a,i,b,j)=>Math.max(Math.abs(a[i]-b[j]),Math.abs(a[i+1]-b[j+1]),Math.abs(a[i+2]-b[j+2]));
  let strict=0;
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const i=(y*w+x)*4; if(D(A,i,B,i)<=16) continue; strict++;
    let ok=false; for(let dy=-1;dy<=1&&!ok;dy++) for(let dx=-1;dx<=1&&!ok;dx++){ const yy=y+dy,xx=x+dx; if(yy<0||xx<0||yy>=h||xx>=w) continue; const j=(yy*w+xx)*4; if(D(A,i,B,j)<=16||D(B,i,A,j)<=16) ok=true; }
    if(!ok) bad.push(y*w+x); }
  return {strict,bad};
}
function boxes(bad,w,cell=24){ const cells=new Map(); for(const k of bad){ const y=(k/w)|0,x=k%w; const c=((y/cell)|0)+","+((x/cell)|0); let o=cells.get(c); if(!o){o={x0:x,x1:x,y0:y,y1:y};cells.set(c,o);} o.x0=Math.min(o.x0,x);o.x1=Math.max(o.x1,x);o.y0=Math.min(o.y0,y);o.y1=Math.max(o.y1,y);} 
  const keys=[...cells.keys()]; const seen=new Set(); const out=[];
  for(const k of keys){ if(seen.has(k)) continue; const st=[k]; seen.add(k); let b={...cells.get(k)}; while(st.length){ const [cy,cx]=st.pop().split(",").map(Number); for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){ const n=(cy+dy)+","+(cx+dx); if(cells.has(n)&&!seen.has(n)){seen.add(n);st.push(n);const o=cells.get(n);b.x0=Math.min(b.x0,o.x0);b.x1=Math.max(b.x1,o.x1);b.y0=Math.min(b.y0,o.y0);b.y1=Math.max(b.y1,o.y1);}}} out.push(b);} return out; }
const inside=(b,rs,pad=3)=>rs.some(r=>r&&b.x0>=r.x-pad&&b.x1<=r.x+r.w+pad&&b.y0>=r.y-pad&&b.y1<=r.y+r.h+pad);
const rows=[]; const T0=Date.now();
for (const ad of ADS) for (const vp of vps) {
  const M=await open("http://localhost:3101",ad,vp,false), Bn=await open("http://localhost:"+(process.env.BRANCH_PORT||3100),ad,vp,true);
  const rm=await M.page.evaluate(rectsJs), rb=await Bn.page.evaluate(rectsJs);
  const sm=await M.page.screenshot({fullPage:true}), sb=await Bn.page.screenshot({fullPage:true});
  const im=await sharp(sm).raw().ensureAlpha().toBuffer({resolveWithObject:true}), ib=await sharp(sb).raw().ensureAlpha().toBuffer({resolveWithObject:true});
  const tag=(ad||"noad")+"-"+vp.n; const dpr=vp.dpr;
  fs.writeFileSync(path.join(outDir,`${tag}-main.png`),sm); fs.writeFileSync(path.join(outDir,`${tag}-branch.png`),sb);
  const allowed=[rb.joinTop,rb.joinEnd,...rb.ctas,...rb.mini];
  const secRows=[];
  for(let i=0;i<Math.min(rm.secs.length,rb.secs.length);i++){
    const a=rm.secs[i],b=rb.secs[i]; if(a.key!==b.key){ secRows.push({sec:a.key+" vs "+b.key,note:"section mismatch"}); continue; }
    const hh=Math.min(a.r.h,b.r.h);
    const ca=await crop(im.data,im.info,dpr,a.r.y,a.r.y+hh,a.r.x,a.r.x+a.r.w), cb=await crop(ib.data,ib.info,dpr,b.r.y,b.r.y+hh,b.r.x,b.r.x+b.r.w);
    const h=Math.min(ca.h,cb.h), w=Math.min(ca.w,cb.w);
    const equal=md5(ca.data)===md5(cb.data)&&ca.h===cb.h;
    let res={sec:b.key,mainH:a.r.h,branchH:b.r.h,md5Equal:equal};
    if(!equal){ const d=diffMask(ca.data,cb.data,w,h); res.strictPx=d.strict; res.badPx=d.bad.length;
      res.boxes=boxes(d.bad,w).map(bx=>{const pb={x0:b.r.x+bx.x0/dpr,x1:b.r.x+bx.x1/dpr,y0:b.r.y+bx.y0/dpr,y1:b.r.y+bx.y1/dpr}; return {x:+pb.x0.toFixed(1),y:+pb.y0.toFixed(1),w:+(pb.x1-pb.x0).toFixed(1),h:+(pb.y1-pb.y0).toFixed(1),inside:inside(pb,allowed)};}); }
    if(a.r.h!==b.r.h){ const lo=Math.min(a.r.h,b.r.h); const tail={x:b.r.x,y:b.r.y+lo,w:b.r.w,h:Math.abs(a.r.h-b.r.h)}; res.heightDelta=+(b.r.h-a.r.h).toFixed(1); res.heightInside=inside({x0:b.r.x,x1:b.r.x+b.r.w,y0:tail.y,y1:tail.y+tail.h},allowed); }
    secRows.push(res);
  }
  // above-the-top-form byte compare (page top to the top form's top edge)
  const topY=Math.min(rb.joinTop?.y??1e9, rm.joinTop?.y??1e9);
  let above=null; if(topY<1e8){ const ca=await crop(im.data,im.info,dpr,0,topY), cb=await crop(ib.data,ib.info,dpr,0,topY); above={y:topY,mainMd5:md5(ca.data),branchMd5:md5(cb.data),equal:md5(ca.data)===md5(cb.data)};
    if(!above.equal){ const d=diffMask(ca.data,cb.data,ca.w,Math.min(ca.h,cb.h)); const bx=boxes(d.bad,ca.w).map(b=>({x:+(b.x0/dpr).toFixed(1),y:+(b.y0/dpr).toFixed(1),w:+((b.x1-b.x0)/dpr).toFixed(1),h:+((b.y1-b.y0)/dpr).toFixed(1)})); above.boxes=bx; above.boxesInside=bx.map(b=>inside({x0:b.x,x1:b.x+b.w,y0:b.y,y1:b.y+b.h},[...rb.ctas,...rb.mini])); above.miniRects=rb.mini; above.ctaRects=rb.ctas; } }
  // FAQ open per details
  for(const P of [M.page,Bn.page]) await P.evaluate(()=>document.querySelectorAll(".faq details").forEach(d=>d.open=true));
  await M.page.waitForTimeout(200);
  const fm=await M.page.evaluate(rectsJs), fb=await Bn.page.evaluate(rectsJs);
  const sfm=await sharp(await M.page.screenshot({fullPage:true})).raw().ensureAlpha().toBuffer({resolveWithObject:true}), sfb=await sharp(await Bn.page.screenshot({fullPage:true})).raw().ensureAlpha().toBuffer({resolveWithObject:true});
  const faq=[];
  for(let i=0;i<fm.faq.length;i++){ const hh=Math.min(fm.faq[i].h,fb.faq[i].h); const ca=await crop(sfm.data,sfm.info,dpr,fm.faq[i].y,fm.faq[i].y+hh), cb=await crop(sfb.data,sfb.info,dpr,fb.faq[i].y,fb.faq[i].y+hh);
    const eq=md5(ca.data)===md5(cb.data)&&fm.faq[i].h===fb.faq[i].h; let bad=0; if(!eq){ bad=diffMask(ca.data,cb.data,Math.min(ca.w,cb.w),Math.min(ca.h,cb.h)).bad.length; }
    faq.push({i,mainH:fm.faq[i].h,branchH:fb.faq[i].h,md5Equal:eq,badPx:bad}); }
  // FAQ proof: copy the two main answers into the branch page, then every details must be md5-equal (so only those two answers differ)
  const ans=await M.page.evaluate(()=>[...document.querySelectorAll(".faq details")].map(d=>d.querySelector("p").innerHTML));
  const changed=await Bn.page.evaluate((a)=>{ const ds=[...document.querySelectorAll(".faq details")]; const ch=[]; ds.forEach((d,i)=>{ if(d.querySelector("p").innerHTML!==a[i]){ ch.push(i); d.querySelector("p").innerHTML=a[i]; } }); return ch; },ans);
  await Bn.page.waitForTimeout(200);
  const gm=await M.page.evaluate(rectsJs), gb=await Bn.page.evaluate(rectsJs);
  const sgm=await sharp(await M.page.screenshot({fullPage:true})).raw().ensureAlpha().toBuffer({resolveWithObject:true}), sgb=await sharp(await Bn.page.screenshot({fullPage:true})).raw().ensureAlpha().toBuffer({resolveWithObject:true});
  const faqEq=[];
  for(let i=0;i<gm.faq.length;i++){ const ca=await crop(sgm.data,sgm.info,dpr,gm.faq[i].y,gm.faq[i].y+gm.faq[i].h), cb=await crop(sgb.data,sgb.info,dpr,gb.faq[i].y,gb.faq[i].y+gb.faq[i].h); faqEq.push(md5(ca.data)===md5(cb.data)&&gm.faq[i].h===gb.faq[i].h); }
  const faqProof={answersChanged:changed,allEqualAfterCopy:faqEq.every(Boolean),perDetails:faqEq};
  // reload-free: restore not needed, sticky and conf use a fresh state below
  // sticky
  const stk={};
  for(const [lab,P] of [["main",M.page],["branch",Bn.page]]){ await P.evaluate(()=>{document.querySelectorAll(".faq details").forEach(d=>d.open=false); const s=document.querySelector("style:last-of-type"); document.querySelectorAll("style").forEach(st=>{ if(st.textContent.includes("#sticky{display:none!important}")) st.textContent=st.textContent.replace("#sticky{display:none!important}",""); }); window.scrollTo(0,700);}); await P.waitForTimeout(500);
    const el=P.locator("#sticky"); if(await el.isVisible()){ const b=await el.screenshot(); stk[lab]={md5:md5(b),text:(await el.innerText()).trim()}; } else stk[lab]={visible:false}; }
  // confirmation state (d18, d19 only)
  let conf=null;
  if(ad==="d18"||ad==="d19"){
    // put sticky hidden again, scroll top, submit from the visible form
    const confShot={};
    for(const [lab,P] of [["main",M.page],["branch",Bn.page]]){ await P.evaluate(()=>{window.scrollTo(0,0)}); const em=P.locator("#em-top"); await em.scrollIntoViewIfNeeded(); await em.fill("qa+sentry@example.com"); await P.locator("#join-top button[type=submit]").click(); await P.waitForSelector("#conf:not([hidden])",{timeout:10000}).catch(()=>{}); await P.waitForTimeout(800);
      const buf=await P.screenshot({fullPage:false}); confShot[lab]={buf,rect:await P.evaluate(()=>{const e=document.getElementById("conf"),b=e.getBoundingClientRect(); const lk=document.querySelector("#conf .lock"); return {conf:{x:b.left,y:b.top,w:b.width,h:b.height},lock:lk?(()=>{const l=lk.getBoundingClientRect();return {x:l.left,y:l.top,w:l.width,h:l.height}})():null, scroll:[document.querySelector("#conf .conf-in")?.scrollHeight, e.scrollHeight, e.clientHeight]}})};
      fs.writeFileSync(path.join(outDir,`${tag}-conf-${lab}.png`),buf); }
    const ca=await sharp(confShot.main.buf).raw().ensureAlpha().toBuffer({resolveWithObject:true}), cb=await sharp(confShot.branch.buf).raw().ensureAlpha().toBuffer({resolveWithObject:true});
    const d=diffMask(ca.data,cb.data,Math.min(ca.info.width,cb.info.width),Math.min(ca.info.height,cb.info.height));
    const bx=boxes(d.bad,ca.info.width).map(b=>({x:+(b.x0/dpr).toFixed(1),y:+(b.y0/dpr).toFixed(1),w:+((b.x1-b.x0)/dpr).toFixed(1),h:+((b.y1-b.y0)/dpr).toFixed(1)}));
    conf={md5Equal:md5(confShot.main.buf)===md5(confShot.branch.buf),badPx:d.bad.length,boxes:bx,confRect:confShot.branch.rect.conf,lockRect:confShot.branch.rect.lock,mainHasLock:!!confShot.main.rect.lock,allInsideConf:bx.every(b=>b.x>=confShot.branch.rect.conf.x-3&&b.y>=confShot.branch.rect.conf.y-3&&b.x+b.w<=confShot.branch.rect.conf.x+confShot.branch.rect.conf.w+3&&b.y+b.h<=confShot.branch.rect.conf.y+confShot.branch.rect.conf.h+3)};
  }
  const row={ad:ad||"noad",vp:vp.n,pageH:{main:rm.h,branch:rb.h},ctaText:{main:rm.ctaText,branch:rb.ctaText},above,sections:secRows,faq,faqProof,sticky:stk,conf};
  rows.push(row); console.log(tag, "done", Math.round((Date.now()-T0)/1000)+"s");
  await M.ctx.close(); await Bn.ctx.close();
}
fs.writeFileSync(path.join(outDir,"pixel-b.json"),JSON.stringify({rows,offenders:[...offenders]},null,1));
console.log("offenders",JSON.stringify([...offenders]));
await browser.close();
