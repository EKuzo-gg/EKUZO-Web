import { chromium } from "playwright";
const CP="/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const POST="/blog/gaming-study-13-7-years-younger-what-it-means-for-kids";
const A="http://localhost:3001", B="http://localhost:3002";
const b=await chromium.launch({executablePath:CP,args:["--no-sandbox","--disable-dev-shm-usage"]});
async function mk(vp,variant){const c=await b.newContext({viewport:vp});
 if(variant) await c.addInitScript((v)=>{try{localStorage.setItem("ekuzo_nl_variant",v)}catch{}},variant);
 await c.route("**/*",(r)=>{const u=r.request().url();return u.startsWith("http://localhost")||u.startsWith("data:")?r.continue():r.abort();});
 const p=await c.newPage(); p.setDefaultNavigationTimeout(60000); return {c,p};}
const FIT=`(()=>{const d=document.querySelector('[role="dialog"]');if(!d)return{found:false};
 const vh=innerHeight;const items=[...d.querySelectorAll("*")].filter(e=>(e.children.length===0&&e.textContent.trim())||/^(INPUT|BUTTON|IMG)$/.test(e.tagName));
 const rows=items.map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);
  return{tag:e.tagName,text:(e.textContent||e.placeholder||e.getAttribute("aria-label")||"").trim().slice(0,44),top:Math.round(r.top),bottom:Math.round(r.bottom),h:Math.round(r.height),
   vis:r.top>=0&&r.bottom<=vh?"OK":(r.top<vh&&r.bottom>vh?"CLIPPED":"OFFSCREEN"),display:s.display};}).filter(r=>r.display!=="none"&&r.h>0);
 const sc=[...d.querySelectorAll("*"),d].map(e=>{const s=getComputedStyle(e);
  return{cls:String(e.className).slice(0,60),oy:s.overflowY,sh:e.scrollHeight,ch:e.clientHeight,can:e.scrollHeight>e.clientHeight+2&&/auto|scroll/.test(s.overflowY)};}).filter(x=>x.sh>x.ch+2||x.can);
 const kids=[...d.querySelectorAll(":scope > *")].map(e=>{const s=getComputedStyle(e);const r=e.getBoundingClientRect();
  return{cls:String(e.className).slice(0,70),bg:s.backgroundColor,w:Math.round(r.width),h:Math.round(r.height),display:s.display};});
 const imgs=[...d.querySelectorAll("img")].map(e=>{const s=getComputedStyle(e);const r=e.getBoundingClientRect();return{src:e.getAttribute("src").slice(0,40),display:s.display,w:Math.round(r.width),h:Math.round(r.height)};});
 const brand=[...d.querySelectorAll("*")].filter(e=>/MATTERS\.$/.test(e.textContent.trim())).map(e=>{const s=getComputedStyle(e);const r=e.getBoundingClientRect();return{size:s.fontSize,display:s.display,visible:!!(e.offsetWidth||e.offsetHeight),top:Math.round(r.top)};});
 return{found:true,vh,bodyOverflow:getComputedStyle(document.body).overflow,htmlOverflow:getComputedStyle(document.documentElement).overflow,dialogCls:String(d.className),kids,imgs,brand,scroll:sc,rows,innerText:d.innerText};})()`;
// 1. popup thumbs at 375x800 and 375x667 (after), plus site reference for comparison
for (const [label,url,variant,vp] of [
  ["blog-thumbs",A+POST,"thumbs",{width:375,height:800}],
  ["blog-thumbs",A+POST,"thumbs",{width:375,height:667}],
  ["blog-classic",A+POST,"classic",{width:375,height:800}],
  ["blog-classic",A+POST,"classic",{width:375,height:667}],
  ["site",B+"/",null,{width:375,height:800}],
]) {
  const {c,p}=await mk(vp,variant);
  await p.goto(url,{waitUntil:"domcontentloaded"}); await p.waitForTimeout(1300);
  if(variant){await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight*0.6));}
  await p.waitForSelector('[role="dialog"]',{timeout:20000}); await p.waitForTimeout(1200);
  const m=await p.evaluate(FIT);
  console.log(`\n#### POPUP ${label} ${vp.width}x${vp.height}`);
  console.log(" dialogCls:",m.dialogCls," bodyOverflow:",m.bodyOverflow," htmlOverflow:",m.htmlOverflow);
  console.log(" kids:",JSON.stringify(m.kids));
  console.log(" imgs:",JSON.stringify(m.imgs)," brandMATTERS:",JSON.stringify(m.brand));
  console.log(" scrollable:",JSON.stringify(m.scroll));
  for(const r of m.rows) console.log(`  ${r.vis.padEnd(9)} ${r.tag.padEnd(6)} top=${String(r.top).padStart(4)} bot=${String(r.bottom).padStart(4)} ${JSON.stringify(r.text)}`);
  // can the reader reach the submit by scrolling inside the dialog?
  await p.mouse.move(vp.width/2, vp.height/2); await p.mouse.wheel(0,600); await p.waitForTimeout(600);
  const after=await p.evaluate(()=>{const d=document.querySelector('[role="dialog"]');const btn=d.querySelector('button[type="submit"]');const r=btn.getBoundingClientRect();
    const ps=[...d.querySelectorAll("p")];const micro=ps[ps.length-1];const mr=micro.getBoundingClientRect();
    const cx=r.left+r.width/2, cy=Math.min(r.top+r.height/2, innerHeight-1);const el=document.elementFromPoint(cx,cy);
    return{submitTop:Math.round(r.top),submitBottom:Math.round(r.bottom),submitFullyVisible:r.top>=0&&r.bottom<=innerHeight,
      hitIsSubmit:!!(el&&(el===btn||btn.contains(el))),microText:micro.textContent.slice(0,30),microBottom:Math.round(mr.bottom),microVisible:mr.top>=0&&mr.bottom<=innerHeight,pageScrollY:scrollY};});
  console.log(" AFTER-WHEEL:",JSON.stringify(after));
  await c.close();
}
// 2. sticky bars at 768 and 820: camps reference vs blog both variants
for (const w of [768,820]) {
  for (const [label,url,variant] of [["camps",A+"/programs/ekuzo-camps",null],["blog-thumbs",A+POST,"thumbs"],["blog-classic",A+POST,"classic"]]) {
    const {c,p}=await mk({width:w,height:900},variant);
    await p.goto(url,{waitUntil:"domcontentloaded"}); await p.waitForTimeout(1200);
    await p.evaluate(()=>scrollTo(0,500)); await p.waitForTimeout(800);
    const m=await p.evaluate(()=>{
      const bar=[...document.querySelectorAll("div")].find(e=>{const cs=getComputedStyle(e);return cs.position==="fixed"&&cs.bottom==="0px"&&e.offsetHeight>30});
      if(!bar)return null;const R=(e)=>{const r=e.getBoundingClientRect();return{l:Math.round(r.left),r:Math.round(r.right),w:Math.round(r.width),h:Math.round(r.height)}};
      const white=[...bar.querySelectorAll("div")].find(e=>getComputedStyle(e).backgroundColor==="rgb(255, 255, 255)");
      const cta=[...bar.querySelectorAll("a,button")].pop();
      const inp=bar.querySelector('input[type=email]');
      const spans=[...bar.querySelectorAll("span")].filter(e=>getComputedStyle(e).display!=="none"&&e.textContent.trim().length>8)
        .map(e=>{const s=getComputedStyle(e);return{...R(e),size:s.fontSize,font:s.fontFamily.split(",")[0],tt:s.textTransform,text:e.textContent.trim().slice(0,28)}});
      return{vw:innerWidth,barH:Math.round(bar.getBoundingClientRect().height),whitePad:white?getComputedStyle(white).padding:null,
        cls:bar.className,spans,input:inp?R(inp):null,cta:{...R(cta),text:cta.textContent.trim().slice(0,20)},
        ctaOverflowPx:Math.max(0,R(cta).r-innerWidth),inputOverflowPx:inp?Math.max(0,R(inp).r-innerWidth):0,
        docOverflowX:document.documentElement.scrollWidth>innerWidth,
        ctaClickable:(()=>{const r=cta.getBoundingClientRect();const el=document.elementFromPoint(Math.min(r.left+r.width/2,innerWidth-1),r.top+r.height/2);return !!(el&&(el===cta||cta.contains(el)))})()};});
    console.log(`\n#### BAR ${label}@${w}: ${JSON.stringify(m)}`);
    await c.close();
  }
}
await b.close();
