import { chromium } from "playwright";
const CHROMIUM_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const POST = "/blog/gaming-study-13-7-years-younger-what-it-means-for-kids";
const b = await chromium.launch({ executablePath: CHROMIUM_PATH, args: ["--no-sandbox","--disable-dev-shm-usage"] });
for (const variant of ["thumbs","classic"]) {
 for (const w of [1440,375]) {
  for (const state of ["idle",200,500]) {
   const c = await b.newContext({ viewport:{width:w,height:w===1440?900:800} });
   await c.addInitScript((v)=>{try{localStorage.setItem("ekuzo_nl_variant",v)}catch{}},variant);
   await c.route("**/*",(r)=>{const u=r.request().url();
     if(u.includes("/api/newsletter")&&state!=="idle") return r.fulfill({status:state,contentType:"application/json",body:"{}"});
     return u.startsWith("http://localhost")||u.startsWith("data:")?r.continue():r.abort();});
   const p=await c.newPage(); p.setDefaultNavigationTimeout(60000);
   await p.goto("http://localhost:3001"+POST,{waitUntil:"domcontentloaded"}); await p.waitForTimeout(1200);
   await p.evaluate(()=>window.scrollTo(0,500)); await p.waitForTimeout(700);
   if(state!=="idle"){ await p.evaluate(()=>{const bar=[...document.querySelectorAll("div")].find(e=>{const cs=getComputedStyle(e);return cs.position==="fixed"&&cs.bottom==="0px"&&e.offsetHeight>30&&e.querySelector('input[type=email]')}); bar.querySelector('input[type=email]').focus();});
     await p.keyboard.type("r@e.com"); await p.keyboard.press("Enter"); await p.waitForTimeout(1800); }
   const t=await p.evaluate(()=>{const bar=[...document.querySelectorAll("div")].find(e=>{const cs=getComputedStyle(e);return cs.position==="fixed"&&cs.bottom==="0px"&&e.offsetHeight>30});
     return {innerText:bar.innerText, h:Math.round(bar.getBoundingClientRect().height)};});
   console.log(`${variant} @${w} ${state}: h=${t.h} innerText=${JSON.stringify(t.innerText)}`);
   await c.close();
  }}}
await b.close();
