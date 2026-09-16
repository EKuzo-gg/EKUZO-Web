import { chromium } from "playwright";
const CP="/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const POST="/blog/gaming-study-13-7-years-younger-what-it-means-for-kids";
const b=await chromium.launch({executablePath:CP,args:["--no-sandbox","--disable-dev-shm-usage"]});
// 1. subscribe via sticky bar, then scroll to 60% and see whether the popup still fires
for (const variant of ["thumbs","classic"]) {
  const c=await b.newContext({viewport:{width:1440,height:900}});
  await c.addInitScript((v)=>{try{localStorage.setItem("ekuzo_nl_variant",v)}catch{}},variant);
  await c.route("**/*",(r)=>{const u=r.request().url();
    if(u.includes("/api/newsletter")) return r.fulfill({status:200,contentType:"application/json",body:'{"success":true}'});
    return u.startsWith("http://localhost")||u.startsWith("data:")?r.continue():r.abort();});
  const p=await c.newPage(); p.setDefaultNavigationTimeout(60000);
  await p.goto("http://localhost:3001"+POST,{waitUntil:"domcontentloaded"}); await p.waitForTimeout(1200);
  await p.evaluate(()=>window.scrollTo(0,500)); await p.waitForTimeout(700);
  await p.evaluate(()=>{const bar=[...document.querySelectorAll("div")].find(e=>{const cs=getComputedStyle(e);return cs.position==="fixed"&&cs.bottom==="0px"&&e.offsetHeight>30&&e.querySelector('input[type=email]')}); bar.querySelector('input[type=email]').focus();});
  await p.keyboard.type("r@e.com"); await p.keyboard.press("Enter"); await p.waitForTimeout(1500);
  const barAfter=await p.evaluate(()=>{const bar=[...document.querySelectorAll("div")].find(e=>{const cs=getComputedStyle(e);return cs.position==="fixed"&&cs.bottom==="0px"&&e.offsetHeight>20});return bar?bar.innerText:null;});
  const ls=await p.evaluate(()=>({sub:localStorage.getItem("ekuzo_nl_blog_subscribed_at"),dis:localStorage.getItem("ekuzo_nl_blog_dismissed_at")}));
  await p.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight*0.65));
  await p.waitForTimeout(2500);
  const dlg=await p.evaluate(()=>{const d=document.querySelector('[role="dialog"]');return d?d.innerText.slice(0,80):null;});
  console.log(`AFTER-STICKY-SUCCESS ${variant}: bar=${JSON.stringify(barAfter)} storage=${JSON.stringify(ls)} popupAppeared=${JSON.stringify(dlg)}`);
  await c.close();
}
// 2. bar layout at intermediate widths
for (const w of [640,768,1024,1280]) {
  const c=await b.newContext({viewport:{width:w,height:900}});
  await c.addInitScript(()=>{try{localStorage.setItem("ekuzo_nl_variant","classic")}catch{}});
  await c.route("**/*",(r)=>{const u=r.request().url();return u.startsWith("http://localhost")||u.startsWith("data:")?r.continue():r.abort();});
  const p=await c.newPage(); p.setDefaultNavigationTimeout(60000);
  await p.goto("http://localhost:3001"+POST,{waitUntil:"domcontentloaded"}); await p.waitForTimeout(1200);
  await p.evaluate(()=>window.scrollTo(0,500)); await p.waitForTimeout(700);
  const m=await p.evaluate(()=>{
    const bar=[...document.querySelectorAll("div")].find(e=>{const cs=getComputedStyle(e);return cs.position==="fixed"&&cs.bottom==="0px"&&e.offsetHeight>30});
    const span=[...bar.querySelectorAll("span")].find(e=>getComputedStyle(e).display!=="none"&&/one email/i.test(e.textContent));
    const inp=bar.querySelector('input[type=email]'); const btn=bar.querySelector('button[type=submit]');
    const R=(e)=>{const r=e.getBoundingClientRect();return {l:Math.round(r.left),r:Math.round(r.right),w:Math.round(r.width)}};
    return { vw: window.innerWidth, barH: Math.round(bar.getBoundingClientRect().height),
      span: span?{...R(span),size:getComputedStyle(span).fontSize}:null, input:R(inp), btn:R(btn),
      docScrollW: document.documentElement.scrollWidth, bodyOverflowX: document.documentElement.scrollWidth > window.innerWidth };
  });
  console.log(`BAR@${w}: ${JSON.stringify(m)}`);
  await c.close();
}
await b.close();
