import { chromium } from "playwright";
const CP="/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const POST="/blog/gaming-study-13-7-years-younger-what-it-means-for-kids";
const b=await chromium.launch({executablePath:CP,args:["--no-sandbox","--disable-dev-shm-usage"]});
async function probe(url, variant, w) {
  const c=await b.newContext({viewport:{width:w,height:900}});
  if(variant) await c.addInitScript((v)=>{try{localStorage.setItem("ekuzo_nl_variant",v)}catch{}},variant);
  await c.route("**/*",(r)=>{const u=r.request().url();return u.startsWith("http://localhost")||u.startsWith("data:")?r.continue():r.abort();});
  const p=await c.newPage(); p.setDefaultNavigationTimeout(60000);
  await p.goto(url,{waitUntil:"domcontentloaded"}); await p.waitForTimeout(1100);
  await p.evaluate(()=>window.scrollTo(0,500)); await p.waitForTimeout(700);
  const m=await p.evaluate(()=>{
    const bar=[...document.querySelectorAll("div")].find(e=>{const cs=getComputedStyle(e);return cs.position==="fixed"&&cs.bottom==="0px"&&e.offsetHeight>30});
    if(!bar) return null;
    const R=(e)=>{const r=e.getBoundingClientRect();return {l:Math.round(r.left),r:Math.round(r.right),w:Math.round(r.width)}};
    const last=[...bar.querySelectorAll("a,button")].pop();
    const span=[...bar.querySelectorAll("span")].find(e=>getComputedStyle(e).display!=="none"&&e.textContent.trim().length>10);
    const inp=bar.querySelector('input[type=email]');
    const cta=R(last);
    return { vw:window.innerWidth, ctaText:last.textContent.trim().slice(0,24), cta, ctaOffscreenPx: Math.max(0, cta.r-window.innerWidth),
      span: span?{...R(span),size:getComputedStyle(span).fontSize,text:span.textContent.trim().slice(0,30)}:null,
      input: inp?R(inp):null, clickableCenter: (()=>{const cx=Math.min(cta.l+cta.w/2, window.innerWidth-1); const r=last.getBoundingClientRect(); const el=document.elementFromPoint(cx, r.top+r.height/2); return !!(el&&(el===last||last.contains(el)));})() };
  });
  console.log(`${url.includes("camps")?"CAMPS":"BLOG-"+variant}@${w}: ${JSON.stringify(m)}`);
  await c.close();
}
for (const w of [600,640,700,768,832,896,960]) await probe("http://localhost:3001"+POST,"thumbs",w);
for (const w of [640,768,896]) await probe("http://localhost:3001/programs/ekuzo-camps",null,w);
await b.close();
