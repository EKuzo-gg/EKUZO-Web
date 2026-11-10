// Sentry check 4 (Class Q). usage: node s-beacon.mjs <port> <out.json>
import { createRequire } from "module"; import fs from "fs";
const { chromium } = createRequire("/home/claude/")("playwright");
const [port, out] = process.argv.slice(2); const base = `http://localhost:${port}`;
const UA = "Mozilla/5.0 (Linux; Android 14; SM-S921U Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.6778.135 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/490.0.0.50.109;]";
const STUB = /(^|\.)googletagmanager\.com$|(^|\.)google-analytics\.com$|(^|\.)clarity\.ms$|(^|\.)facebook\.(net|com)$|(^|\.)doubleclick\.net$|(^|\.)bing\.com$/i;
const ALLOWED = new Set(["localhost","fonts.googleapis.com","fonts.gstatic.com"]);
const offenders = new Set(); const stubbedHosts = new Set();
const browser = await chromium.launch({ proxy:{server:process.env.HTTPS_PROXY,bypass:"localhost,127.0.0.1"} });
const journeys = [
 {id:"d18-utm", path:"/season1?ad=d18&utm_source=meta&utm_medium=paid_social&utm_campaign=s1&utm_content=d18-a&s1qa=1", form:true},
 {id:"d19-utm", path:"/season1?ad=d19&utm_source=meta&utm_medium=paid_social&utm_campaign=s1&utm_content=d19-a&s1qa=1", form:true},
 {id:"bare", path:"/season1?s1qa=1", form:false},
 {id:"zz", path:"/season1?ad=zz&s1qa=1", form:false},
 {id:"join-ad", path:"/season1/join?src=ad&ad=d18&s1qa=1", form:false},
 {id:"join-b-email", path:"/season1/join/b?src=email&s1qa=1", form:false},
 {id:"jersey", path:"/season1/join/jersey?ad=d21&utm_source=x&s1qa=1", form:false},
];
const res = {};
for (const j of journeys) {
  const ctx = await browser.newContext({ viewport:{width:412,height:915}, deviceScaleFactor:2.625, isMobile:true, hasTouch:true, userAgent:UA });
  const posts = [];
  await ctx.route("**/*", r => { const q=r.request(); const u=new URL(q.url());
    if (STUB.test(u.hostname)) { stubbedHosts.add(u.hostname); return r.fulfill({status:204,body:""}); }
    if (q.method()==="POST" && u.pathname==="/api/season-one") { posts.push(q.postData()); return r.fulfill({status:200,contentType:"application/json",body:'{"ok":true}'}); }
    return r.continue(); });
  ctx.on("response", rs => { const u=new URL(rs.url()); if(u.protocol.startsWith("http") && !ALLOWED.has(u.hostname) && !STUB.test(u.hostname)) offenders.add(u.hostname); });
  const page = await ctx.newPage();
  await page.goto(base+j.path,{waitUntil:"load"}); await page.waitForTimeout(2000);
  if (j.form) {
    await page.evaluate(()=>document.getElementById("join-top").scrollIntoView({block:"start"})); await page.waitForTimeout(800);
    await page.tap("#em-top"); await page.keyboard.type("qa+sentry@example.com",{delay:20});
    await page.tap('form[data-where="top"] button'); await page.waitForTimeout(2500);
  }
  const snap = await page.evaluate(()=>{ const c=o=>JSON.parse(JSON.stringify(o)); return {
    dataLayer:(window.dataLayer||[]).map(a=>c(Array.from(a))),
    fbq:(window.fbq&&window.fbq.queue||[]).map(a=>c(Array.from(a))),
    clarity:(window.clarity&&window.clarity.q||[]).map(a=>c(Array.from(a))),
    search:location.search }; });
  res[j.id] = {...snap, posts};
  await ctx.close();
}
res._offenders=[...offenders]; res._stubbed=[...stubbedHosts];
fs.writeFileSync(out, JSON.stringify(res,null,1));
console.log(port,"offenders",JSON.stringify([...offenders]),"stubbed",JSON.stringify([...stubbedHosts]));
await browser.close();
