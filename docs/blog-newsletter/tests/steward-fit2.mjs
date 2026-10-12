import { chromium } from "playwright";
const CHROMIUM_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const BLOG_POST = "/blog/gaming-study-13-7-years-younger-what-it-means-for-kids";
const b = await chromium.launch({ executablePath: CHROMIUM_PATH, args: ["--no-sandbox","--disable-dev-shm-usage"] });
for (const vp of [{width:375,height:800},{width:375,height:667}]) {
  const ctx = await b.newContext({ viewport: vp });
  await ctx.addInitScript(() => { try { localStorage.setItem("ekuzo_nl_variant","thumbs"); } catch {} });
  await ctx.route("**/*", (r) => r.request().url().startsWith("http://localhost") ? r.continue() : r.abort());
  const p = await ctx.newPage();
  await p.goto("http://localhost:3001"+BLOG_POST, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1200);
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight*0.6));
  await p.waitForSelector('[role="dialog"]');
  await p.waitForTimeout(1000);
  // try to scroll inside the dialog
  const before = await p.evaluate(() => { const btn=[...document.querySelectorAll('[role="dialog"] button[type="submit"]')][0]; const r=btn.getBoundingClientRect(); return {top:Math.round(r.top),bottom:Math.round(r.bottom)}; });
  await p.mouse.move(vp.width/2, vp.height/2);
  await p.mouse.wheel(0, 400);
  await p.waitForTimeout(500);
  const after = await p.evaluate(() => {
    const btn=[...document.querySelectorAll('[role="dialog"] button[type="submit"]')][0]; const r=btn.getBoundingClientRect();
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    const hit = document.elementFromPoint(cx, Math.min(cy, window.innerHeight-1));
    return { top:Math.round(r.top), bottom:Math.round(r.bottom), scrollY: window.scrollY,
      hitIsSubmit: !!(hit && (hit===btn || btn.contains(hit))), hitTag: hit ? hit.tagName+"."+String(hit.className).slice(0,40) : null,
      micro: (() => { const ps=[...document.querySelectorAll('[role="dialog"] p')]; const m=ps[ps.length-1]; const rr=m.getBoundingClientRect(); return { text:m.textContent.slice(0,40), top:Math.round(rr.top), bottom:Math.round(rr.bottom) }; })() };
  });
  console.log(JSON.stringify({ vp, before, after }, null, 1));
  await ctx.close();
}
await b.close();
