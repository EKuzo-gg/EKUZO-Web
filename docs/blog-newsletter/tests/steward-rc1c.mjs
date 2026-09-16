import { chromium } from "playwright";
const CP="/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const POST="/blog/gaming-study-13-7-years-younger-what-it-means-for-kids";
const b=await chromium.launch({executablePath:CP,args:["--no-sandbox","--disable-dev-shm-usage"]});
for (const [variant,vp] of [["thumbs",{width:375,height:800}],["thumbs",{width:320,height:568}],["classic",{width:375,height:800}]]) {
  const c=await b.newContext({viewport:vp});
  await c.addInitScript((v)=>{try{localStorage.setItem("ekuzo_nl_variant",v)}catch{}},variant);
  await c.route("**/*",(r)=>{const u=r.request().url();return u.startsWith("http://localhost")||u.startsWith("data:")?r.continue():r.abort();});
  const p=await c.newPage(); p.setDefaultNavigationTimeout(60000);
  await p.goto("http://localhost:3001"+POST,{waitUntil:"domcontentloaded"}); await p.waitForTimeout(1300);
  await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight*0.6));
  await p.waitForSelector('[role="dialog"]'); await p.waitForTimeout(1000);
  const m=await p.evaluate(()=>{const d=document.querySelector('[role="dialog"]');
    const close=d.querySelector('button[aria-label="Close"]').getBoundingClientRect();
    const h3=d.querySelector("h3").getBoundingClientRect();
    const ps=[...d.querySelectorAll("p")];const micro=ps[ps.length-1].getBoundingClientRect();
    const pane=[...d.querySelectorAll(":scope > *")].find(e=>getComputedStyle(e).display!=="none").getBoundingClientRect();
    // word-level rects of the headline's first line
    const range=document.createRange();const tn=d.querySelector("h3").firstChild;range.selectNodeContents(tn);
    const lines=[...range.getClientRects()].map(r=>({top:Math.round(r.top),right:Math.round(r.right)}));
    const overlapY=Math.max(0,Math.min(close.bottom,h3.bottom)-Math.max(close.top,h3.top));
    const line1=lines[0]||{right:0};
    return{close:{t:Math.round(close.top),b:Math.round(close.bottom),l:Math.round(close.left),r:Math.round(close.right)},
      h3:{t:Math.round(h3.top),b:Math.round(h3.bottom),r:Math.round(h3.right)},overlapY,
      line1Right:line1.right,textUnderButton:line1.right>Math.round(close.left)&&Math.abs(line1.top-Math.round(close.top))<45,
      microBottom:Math.round(micro.bottom),paneBottom:Math.round(pane.bottom),deadSpaceBelow:Math.round(pane.bottom-micro.bottom),
      brandMarksVisible:[...d.querySelectorAll("img")].filter(e=>e.offsetWidth>0).map(e=>e.getAttribute("src").slice(0,34)),
      ekuzoTokens:(d.innerText.match(/EKUZO/g)||[]).length};});
  console.log(`${variant} ${vp.width}x${vp.height}: ${JSON.stringify(m)}`);
  await c.close();
}
await b.close();
