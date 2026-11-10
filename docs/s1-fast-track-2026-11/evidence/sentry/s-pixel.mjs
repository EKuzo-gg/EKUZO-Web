// Sentry check 3: pixel parity main(3101) vs branch(3100). Images aborted the same way on both. Class Q stubs + offender check.
import { createRequire } from "module"; import fs from "fs"; import path from "path"; import crypto from "crypto";
const { chromium } = createRequire("/home/claude/")("playwright");
let sharp; try { sharp = createRequire("/home/claude/wt-sentry/")("sharp"); } catch { sharp = null; }
const outDir = process.argv[2]; fs.mkdirSync(outDir, { recursive: true });
const STUB = /(^|\.)(googletagmanager\.com|google-analytics\.com|clarity\.ms|facebook\.(net|com)|doubleclick\.net|bing\.com)$/i;
const ALLOWED = new Set(["localhost","127.0.0.1","fonts.googleapis.com","fonts.gstatic.com"]);
const offenders = new Set();
const browser = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY, bypass: "localhost,127.0.0.1" } });
const paths = ["/season1","/season1?ad=d18","/season1?ad=d19","/season1?ad=d2","/season1?ad=d4","/season1/join","/season1/join/b","/season1/join/jersey?ad=d21"];
const vps = [{n:"412",w:412,h:915,dpr:2.625,m:true},{n:"1440",w:1440,h:900,dpr:1,m:false}];
async function shoot(base, p, vp, label, i) {
  const ctx = await browser.newContext({ viewport:{width:vp.w,height:vp.h}, deviceScaleFactor:vp.dpr, isMobile:vp.m, hasTouch:vp.m, reducedMotion:"reduce" });
  await ctx.route("**/*", r => { const q=r.request(); const u=new URL(q.url());
    if (STUB.test(u.hostname)) return r.fulfill({status:204,body:""});
    if (q.method()==="POST" && u.pathname==="/api/season-one") return r.fulfill({status:200,contentType:"application/json",body:'{"ok":true}'});
    if (q.resourceType()==="image") return r.abort();
    return r.continue(); });
  ctx.on("response", res => { const u=new URL(res.url()); if(!ALLOWED.has(u.hostname)&&!STUB.test(u.hostname)) offenders.add(u.hostname); });
  await ctx.addInitScript(()=>{ Math.random=()=>0.25; try{localStorage.clear()}catch(_){} });
  const page = await ctx.newPage();
  await page.goto(base+p,{waitUntil:"load"});
  await page.addStyleTag({content:"*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition:none!important;caret-color:transparent!important}"});
  await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(1500);
  const f = path.join(outDir, `${i}-${vp.n}-${label}.png`);
  await page.screenshot({path:f, fullPage:true}); await ctx.close();
  return { f, md5: crypto.createHash("md5").update(fs.readFileSync(f)).digest("hex") };
}
const rows=[];
for (const [i,p] of paths.entries()) for (const vp of vps) {
  const m = await shoot("http://localhost:3101",p,vp,"main",i), b = await shoot("http://localhost:3100",p,vp,"branch",i);
  let diff=null;
  if (m.md5!==b.md5 && sharp) { const A=await sharp(m.f).raw().ensureAlpha().toBuffer({resolveWithObject:true}); const B=await sharp(b.f).raw().ensureAlpha().toBuffer({resolveWithObject:true});
    diff = (A.info.width!==B.info.width||A.info.height!==B.info.height)?"size mismatch":{px:[...Array(A.info.width*A.info.height).keys()].filter(k=>A.data[k*4]!==B.data[k*4]||A.data[k*4+1]!==B.data[k*4+1]||A.data[k*4+2]!==B.data[k*4+2]).length}; }
  const row={path:p,vp:vp.n,mainMd5:m.md5,branchMd5:b.md5,equal:m.md5===b.md5,diff}; rows.push(row); console.log(JSON.stringify(row));
}
console.log("offenders",JSON.stringify([...offenders]));
fs.writeFileSync(path.join(outDir,"pixel.json"),JSON.stringify({rows,offenders:[...offenders]},null,1));
await browser.close();
