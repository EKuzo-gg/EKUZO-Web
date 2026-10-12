import { chromium } from "playwright";
const CP="/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const POST="/blog/gaming-study-13-7-years-younger-what-it-means-for-kids";
const A="http://localhost:3001";
const b=await chromium.launch({executablePath:CP,args:["--no-sandbox","--disable-dev-shm-usage"]});
async function mk(vp,variant){const c=await b.newContext({viewport:vp});
 if(variant) await c.addInitScript((v)=>{try{localStorage.setItem("ekuzo_nl_variant",v)}catch{}},variant);
 await c.route("**/*",(r)=>{const u=r.request().url();return u.startsWith("http://localhost")||u.startsWith("data:")?r.continue():r.abort();});
 const p=await c.newPage(); p.setDefaultNavigationTimeout(60000); return {c,p};}
// 1. gate sizes unchanged after the repair
for (const w of [1440,375]) for (const [label,url,variant] of [["camps",A+"/programs/ekuzo-camps",null],["blog-thumbs",A+POST,"thumbs"],["blog-classic",A+POST,"classic"]]) {
  const {c,p}=await mk({width:w,height:w===1440?900:800},variant);
  await p.goto(url,{waitUntil:"domcontentloaded"}); await p.waitForTimeout(1200);
  await p.evaluate(()=>scrollTo(0,500)); await p.waitForTimeout(800);
  const m=await p.evaluate(()=>{const bar=[...document.querySelectorAll("div")].find(e=>{const cs=getComputedStyle(e);return cs.position==="fixed"&&cs.bottom==="0px"&&e.offsetHeight>30});
   const white=[...bar.querySelectorAll("div")].find(e=>getComputedStyle(e).backgroundColor==="rgb(255, 255, 255)");
   const cta=[...bar.querySelectorAll("a,button")].pop(); const R=e=>{const r=e.getBoundingClientRect();return{r:Math.round(r.right),h:Math.round(r.height)}};
   const sp=[...bar.querySelectorAll("span")].filter(e=>getComputedStyle(e).display!=="none"&&e.textContent.trim().length>8).map(e=>{const s=getComputedStyle(e);return{size:s.fontSize,font:s.fontFamily.split(",")[0],tt:s.textTransform}});
   return{barH:Math.round(bar.getBoundingClientRect().height),whitePad:white?getComputedStyle(white).padding:null,spans:sp,ctaH:R(cta).h,ctaOverflow:Math.max(0,R(cta).r-innerWidth),innerText:bar.innerText};});
  console.log(`GATE BAR ${label}@${w}: ${JSON.stringify(m)}`);
  await c.close();
}
// 2. popup durability at very short viewports + byline contrast
function lum(c){const [r,g,bb]=c;const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return 0.2126*f(r)+0.7152*f(g)+0.0722*f(bb);}
for (const vp of [{width:375,height:560},{width:320,height:480}]) {
  const {c,p}=await mk(vp,"thumbs");
  await p.goto(A+POST,{waitUntil:"domcontentloaded"}); await p.waitForTimeout(1300);
  await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight*0.6));
  await p.waitForSelector('[role="dialog"]',{timeout:20000}); await p.waitForTimeout(1000);
  let m=await p.evaluate(()=>{const d=document.querySelector('[role="dialog"]');const btn=d.querySelector('button[type="submit"]');const r=btn.getBoundingClientRect();
    const sc=[...d.querySelectorAll("*"),d].map(e=>{const s=getComputedStyle(e);return{cls:String(e.className).slice(0,50),oy:s.overflowY,sh:e.scrollHeight,ch:e.clientHeight,can:e.scrollHeight>e.clientHeight+2&&/auto|scroll/.test(s.overflowY)};}).filter(x=>x.sh>x.ch+2);
    return{submitTop:Math.round(r.top),submitBottom:Math.round(r.bottom),fits:r.bottom<=innerHeight,scroll:sc};});
  // scroll inside the pane
  await p.mouse.move(vp.width/2,vp.height/2); await p.mouse.wheel(0,400); await p.waitForTimeout(500);
  const after=await p.evaluate(()=>{const d=document.querySelector('[role="dialog"]');const btn=d.querySelector('button[type="submit"]');const r=btn.getBoundingClientRect();
    const cx=r.left+r.width/2,cy=Math.min(r.top+r.height/2,innerHeight-1);const el=document.elementFromPoint(cx,cy);
    const ps=[...d.querySelectorAll("p")];const mi=ps[ps.length-1].getBoundingClientRect();
    return{submitBottom:Math.round(r.bottom),reachable:r.top>=0&&r.bottom<=innerHeight,hitIsSubmit:!!(el&&(el===btn||btn.contains(el))),microVisible:mi.top>=0&&mi.bottom<=innerHeight};});
  console.log(`POPUP-SHORT ${vp.width}x${vp.height}: before=${JSON.stringify(m)} afterWheel=${JSON.stringify(after)}`);
  await c.close();
}
// 3. byline contrast at 1440 (dark pane) and 375 (purple pane)
for (const w of [1440,375]) {
  const {c,p}=await mk({width:w,height:w===1440?900:800},"thumbs");
  await p.goto(A+POST,{waitUntil:"domcontentloaded"}); await p.waitForTimeout(1300);
  await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight*0.6));
  await p.waitForSelector('[role="dialog"]'); await p.waitForTimeout(900);
  const m=await p.evaluate(()=>{const d=document.querySelector('[role="dialog"]');
    const by=[...d.querySelectorAll("p")].find(e=>/founder, EKUZO/.test(e.textContent));
    const s=getComputedStyle(by); let bg=null,el=by;
    while(el){const cs=getComputedStyle(el);if(cs.backgroundColor!=="rgba(0, 0, 0, 0)"){bg=cs.backgroundColor;break;}el=el.parentElement;}
    return{cls:by.className,color:s.color,size:s.fontSize,bg};});
  const pr=(s)=>s.match(/[\d.]+/g).slice(0,3).map(Number);
  const pa=(s)=>{const n=s.match(/[\d.]+/g).map(Number);return n.length>3?n[3]:1;};
  let fg=pr(m.color), a=pa(m.color), bg=pr(m.bg);
  if(m.color.startsWith("oklab")||m.color.startsWith("lab")){fg=[255,255,255];}
  const blend=fg.map((v,i)=>a*v+(1-a)*bg[i]);
  const L1=lum(blend),L2=lum(bg);
  const ratio=((Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05)).toFixed(2);
  console.log(`BYLINE@${w}: cls=${m.cls} color=${m.color} size=${m.size} bg=${m.bg} contrast=${ratio}:1`);
  await c.close();
}
// 4. double ask re-test
for (const variant of ["thumbs","classic"]) {
  const c=await b.newContext({viewport:{width:1440,height:900}});
  await c.addInitScript((v)=>{try{localStorage.setItem("ekuzo_nl_variant",v)}catch{}},variant);
  await c.route("**/*",(r)=>{const u=r.request().url();
    if(u.includes("/api/newsletter")) return r.fulfill({status:200,contentType:"application/json",body:'{"success":true}'});
    return u.startsWith("http://localhost")||u.startsWith("data:")?r.continue():r.abort();});
  const p=await c.newPage(); p.setDefaultNavigationTimeout(60000);
  await p.goto(A+POST,{waitUntil:"domcontentloaded"}); await p.waitForTimeout(1300);
  await p.evaluate(()=>scrollTo(0,500)); await p.waitForTimeout(800);
  await p.evaluate(()=>{const bar=[...document.querySelectorAll("div")].find(e=>{const cs=getComputedStyle(e);return cs.position==="fixed"&&cs.bottom==="0px"&&e.offsetHeight>30&&e.querySelector('input[type=email]')});bar.querySelector('input[type=email]').focus();});
  await p.keyboard.type("r@e.com"); await p.keyboard.press("Enter"); await p.waitForTimeout(1600);
  const bar=await p.evaluate(()=>{const b2=[...document.querySelectorAll("div")].find(e=>{const cs=getComputedStyle(e);return cs.position==="fixed"&&cs.bottom==="0px"&&e.offsetHeight>20});return b2?b2.innerText:null;});
  const ls=await p.evaluate(()=>({sub:localStorage.getItem("ekuzo_nl_blog_subscribed_at"),dis:localStorage.getItem("ekuzo_nl_blog_dismissed_at")}));
  await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight*0.7)); await p.waitForTimeout(2600);
  const dlg=await p.evaluate(()=>{const d=document.querySelector('[role="dialog"]');return d?d.innerText.slice(0,60):null;});
  console.log(`DOUBLE-ASK ${variant}: bar=${JSON.stringify(bar)} storage=${JSON.stringify(ls)} popup=${JSON.stringify(dlg)}`);
  await c.close();
}
await b.close();
