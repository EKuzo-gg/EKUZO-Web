import { chromium } from "playwright";
const CP="/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const POST="/blog/gaming-study-13-7-years-younger-what-it-means-for-kids";
const A="http://localhost:3001", B="http://localhost:3002";
const b=await chromium.launch({executablePath:CP,args:["--no-sandbox","--disable-dev-shm-usage"]});
const M=`(()=>{const d=document.querySelector('[role="dialog"]');if(!d)return{found:false};
 const vh=innerHeight, vw=innerWidth;
 const R=e=>{const r=e.getBoundingClientRect();return{t:Math.round(r.top),b:Math.round(r.bottom),l:Math.round(r.left),r:Math.round(r.right),w:Math.round(r.width),h:Math.round(r.height)}};
 const close=d.querySelector('button[aria-label="Close"]');
 const h3=d.querySelector("h3");
 const items=[...d.querySelectorAll("*")].filter(e=>(e.children.length===0&&e.textContent.trim())||/^(INPUT|BUTTON|IMG)$/.test(e.tagName))
   .filter(e=>getComputedStyle(e).display!=="none"&&(e.offsetWidth||e.offsetHeight));
 const rows=items.map(e=>{const r=R(e);return{tag:e.tagName,text:(e.textContent||e.placeholder||e.getAttribute("alt")||e.getAttribute("aria-label")||"").trim().slice(0,40),
   t:r.t,b:r.b,vis:r.t>=0&&r.b<=vh?"OK":(r.t<vh&&r.b>0?"CLIPPED":"OFFSCREEN")};});
 const imgs=[...d.querySelectorAll("img")].filter(e=>e.offsetWidth>0).map(e=>({src:e.getAttribute("src").slice(0,46),alt:e.getAttribute("alt"),...R(e),natural:e.naturalWidth+"x"+e.naturalHeight,complete:e.complete}));
 // collision: does the headline's first text line intersect the close button box?
 const rng=document.createRange();rng.selectNodeContents(h3.firstChild);
 const lines=[...rng.getClientRects()].map(r=>({t:Math.round(r.top),b:Math.round(r.bottom),r:Math.round(r.right)}));
 const cb=R(close);
 const collide=lines.some(L=>L.r>cb.l && L.b>cb.t && L.t<cb.b);
 // centring: first and last visible content element vs pane
 const pane=[...d.querySelectorAll(":scope > *")].find(e=>getComputedStyle(e).display!=="none");
 const content=rows.filter(r=>r.tag!=="BUTTON"||true);
 const firstT=Math.min(...rows.filter(r=>r.text!=="Close").map(r=>r.t));
 const lastB=Math.max(...rows.filter(r=>r.text!=="Close").map(r=>r.b));
 const sc=[...d.querySelectorAll("*"),d].map(e=>{const s=getComputedStyle(e);return{cls:String(e.className).slice(0,46),oy:s.overflowY,sh:e.scrollHeight,ch:e.clientHeight,can:e.scrollHeight>e.clientHeight+2&&/auto|scroll/.test(s.overflowY)};}).filter(x=>x.sh>x.ch+2||x.can);
 return{found:true,vh,vw,bodyOverflow:getComputedStyle(document.body).overflow,
  close:cb,closeInScroller:!!close.closest('[class*="overflow-y-auto"]'),h3:R(h3),collide,
  imgs,firstT,lastB,topGap:firstT,bottomGap:vh-lastB,symmetry:Math.abs(firstT-(vh-lastB)),
  paneJustify:getComputedStyle(pane).justifyContent,paneCls:String(pane.className).slice(0,110),
  scroll:sc,ekuzoTokens:(d.innerText.match(/EKUZO/g)||[]).length,rows};})()`;
const cases=[
  ["blog-thumbs",A+POST,"thumbs",{width:375,height:800}],
  ["blog-thumbs",A+POST,"thumbs",{width:375,height:667}],
  ["blog-thumbs",A+POST,"thumbs",{width:320,height:568}],
  ["blog-thumbs",A+POST,"thumbs",{width:320,height:480}],
  ["blog-classic",A+POST,"classic",{width:375,height:800}],
  ["blog-classic",A+POST,"classic",{width:320,height:568}],
  ["site-ref",B+"/",null,{width:375,height:800}],
];
for (const [label,url,variant,vp] of cases) {
  const c=await b.newContext({viewport:vp});
  if(variant) await c.addInitScript((v)=>{try{localStorage.setItem("ekuzo_nl_variant",v)}catch{}},variant);
  await c.route("**/*",(r)=>{const u=r.request().url();return u.startsWith("http://localhost")||u.startsWith("data:")?r.continue():r.abort();});
  const p=await c.newPage(); p.setDefaultNavigationTimeout(60000);
  await p.goto(url,{waitUntil:"domcontentloaded"}); await p.waitForTimeout(1300);
  if(variant) await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight*0.6));
  await p.waitForSelector('[role="dialog"]',{timeout:20000});
  for(let i=0;i<20;i++){const ok=await p.evaluate(()=>[...document.querySelectorAll('[role="dialog"] img')].filter(e=>e.offsetWidth>0).every(e=>e.complete&&e.naturalWidth>0));if(ok)break;await p.waitForTimeout(400);}
  await p.waitForTimeout(600);
  const m=await p.evaluate(M);
  console.log(`\n#### ${label} ${vp.width}x${vp.height}`);
  console.log(` close=${JSON.stringify(m.close)} inScroller=${m.closeInScroller} h3=${JSON.stringify(m.h3)} COLLIDE=${m.collide}`);
  console.log(` imgs=${JSON.stringify(m.imgs)} ekuzoTokens=${m.ekuzoTokens}`);
  console.log(` topGap=${m.topGap} bottomGap=${m.bottomGap} symmetryDelta=${m.symmetry} justify=${m.paneJustify} pane="${m.paneCls}"`);
  console.log(` scrollable=${JSON.stringify(m.scroll)} bodyOverflow=${m.bodyOverflow}`);
  for(const r of m.rows) console.log(`   ${r.vis.padEnd(9)} ${r.tag.padEnd(6)} t=${String(r.t).padStart(4)} b=${String(r.b).padStart(4)} ${JSON.stringify(r.text)}`);
  // reachability after scrolling inside the pane
  await p.mouse.move(vp.width/2,vp.height/2); await p.mouse.wheel(0,500); await p.waitForTimeout(500);
  const af=await p.evaluate(()=>{const d=document.querySelector('[role="dialog"]');const btn=d.querySelector('button[type="submit"]');const r=btn.getBoundingClientRect();
    const ps=[...d.querySelectorAll("p")];const mi=ps[ps.length-1].getBoundingClientRect();
    const el=document.elementFromPoint(r.left+r.width/2,Math.min(r.top+r.height/2,innerHeight-1));
    const cl=d.querySelector('button[aria-label="Close"]').getBoundingClientRect();
    return{submitReachable:r.top>=0&&r.bottom<=innerHeight,hitIsSubmit:!!(el&&(el===btn||btn.contains(el))),microVisible:mi.top>=0&&mi.bottom<=innerHeight,closeStillAt:Math.round(cl.top),pageScrollY:scrollY};});
  console.log(` AFTER-WHEEL ${JSON.stringify(af)}`);
  await c.close();
}
await b.close();
