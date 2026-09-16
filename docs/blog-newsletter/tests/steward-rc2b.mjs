import { chromium } from "playwright";
const CP="/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const POST="/blog/gaming-study-13-7-years-younger-what-it-means-for-kids";
const b=await chromium.launch({executablePath:CP,args:["--no-sandbox","--disable-dev-shm-usage"]});
for (const vp of [{width:320,height:480},{width:320,height:568},{width:375,height:667}]) {
  const c=await b.newContext({viewport:vp});
  await c.addInitScript(()=>{try{localStorage.setItem("ekuzo_nl_variant","thumbs")}catch{}});
  await c.route("**/*",(r)=>{const u=r.request().url();return u.startsWith("http://localhost")||u.startsWith("data:")?r.continue():r.abort();});
  const p=await c.newPage(); p.setDefaultNavigationTimeout(60000);
  await p.goto("http://localhost:3001"+POST,{waitUntil:"domcontentloaded"}); await p.waitForTimeout(1300);
  await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight*0.6));
  await p.waitForSelector('[role="dialog"]'); await p.waitForTimeout(900);
  const m=await p.evaluate(()=>{
    const d=document.querySelector('[role="dialog"]');
    const sc=[...d.querySelectorAll("*")].find(e=>/auto|scroll/.test(getComputedStyle(e).overflowY)&&e.scrollHeight>e.clientHeight+2);
    const g=()=>{const lg=d.querySelector("img"),h3=d.querySelector("h3");
      return{scrollTop:sc?Math.round(sc.scrollTop):null,maxScroll:sc?Math.round(sc.scrollHeight-sc.clientHeight):null,
        logoTop:Math.round(lg.getBoundingClientRect().top),h3Top:Math.round(h3.getBoundingClientRect().top),
        logoVisible:lg.getBoundingClientRect().top>=0,h3Visible:h3.getBoundingClientRect().top>=0};};
    const initial=g();
    if(sc){sc.scrollTop=0;}
    const atTop=g();
    if(sc){sc.scrollTop=sc.scrollHeight;}
    const atBottom=g();
    return{initial,atTop,atBottom,hasScroller:!!sc};});
  console.log(`${vp.width}x${vp.height}: ${JSON.stringify(m)}`);
  await c.close();
}
await b.close();
