import { chromium } from "playwright";
import path from "node:path";
const CP="/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const POST="/blog/gaming-study-13-7-years-younger-what-it-means-for-kids";
const OUT=path.resolve("docs/blog-newsletter/screenshots");
const b=await chromium.launch({executablePath:CP,args:["--no-sandbox","--disable-dev-shm-usage"]});
async function ctx(vp,variant,mock){
  const c=await b.newContext({viewport:vp});
  if(variant) await c.addInitScript((v)=>{try{localStorage.setItem("ekuzo_nl_variant",v)}catch{}},variant);
  await c.route("**/*",(r)=>{const u=r.request().url();
    if(mock&&u.includes("/api/newsletter")) return r.fulfill({status:200,contentType:"application/json",body:'{"success":true}'});
    return u.startsWith("http://localhost")||u.startsWith("data:")?r.continue():r.abort();});
  return c;
}
// A. bar overflow at 768
{
  const c=await ctx({width:768,height:900},"thumbs",false); const p=await c.newPage(); p.setDefaultNavigationTimeout(60000);
  await p.goto("http://localhost:3001"+POST,{waitUntil:"domcontentloaded"}); await p.waitForTimeout(1200);
  await p.evaluate(()=>window.scrollTo(0,500)); await p.waitForTimeout(700);
  await p.screenshot({path:path.join(OUT,"steward-sticky-blog-thumbs-768-clipped.png")}); console.log("shot 768"); await c.close();
}
// B. double ask: subscribe on the bar, then the popup fires anyway
{
  const c=await ctx({width:1440,height:900},"thumbs",true); const p=await c.newPage(); p.setDefaultNavigationTimeout(60000);
  await p.goto("http://localhost:3001"+POST,{waitUntil:"domcontentloaded"}); await p.waitForTimeout(1200);
  await p.evaluate(()=>window.scrollTo(0,500)); await p.waitForTimeout(700);
  await p.evaluate(()=>{const bar=[...document.querySelectorAll("div")].find(e=>{const cs=getComputedStyle(e);return cs.position==="fixed"&&cs.bottom==="0px"&&e.offsetHeight>30&&e.querySelector('input[type=email]')}); bar.querySelector('input[type=email]').focus();});
  await p.keyboard.type("reader@example.com"); await p.keyboard.press("Enter"); await p.waitForTimeout(1500);
  await p.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight*0.65)); await p.waitForTimeout(2500);
  await p.screenshot({path:path.join(OUT,"steward-double-ask-after-sticky-success-1440.png")}); console.log("shot double-ask"); await c.close();
}
// C. thumbs popup at 375x667
{
  const c=await ctx({width:375,height:667},"thumbs",false); const p=await c.newPage(); p.setDefaultNavigationTimeout(60000);
  await p.goto("http://localhost:3001"+POST,{waitUntil:"domcontentloaded"}); await p.waitForTimeout(1200);
  await p.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight*0.6));
  await p.waitForSelector('[role="dialog"]'); await p.waitForTimeout(1500);
  await p.screenshot({path:path.join(OUT,"steward-popup-blog-thumbs-375x667-cut.png")}); console.log("shot 667"); await c.close();
}
await b.close();
