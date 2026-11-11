// Sentry B check 4 (Class Q, localhost only, ?s1qa=1). usage: node s-journey.mjs <out.json>
// Per document snapshots of dataLayer, fbq.queue, clarity.q are written to sessionStorage on pagehide, so journeys that navigate keep their beacons.
import { createRequire } from "module"; import fs from "fs";
const { chromium } = createRequire("/home/claude/")("playwright");
const out = process.argv[2];
const UA = "Mozilla/5.0 (Linux; Android 14; SM-S921U Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.6778.135 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/490.0.0.50.109;]";
const STUB = /(^|\.)googletagmanager\.com$|(^|\.)google-analytics\.com$|(^|\.)clarity\.ms$|(^|\.)facebook\.(net|com)$|(^|\.)doubleclick\.net$|(^|\.)bing\.com$/i;
const ALLOWED = new Set(["localhost","127.0.0.1","fonts.googleapis.com","fonts.gstatic.com"]);
const offenders = new Set(), stubbed = new Set();
const browser = await chromium.launch({ proxy:{server:process.env.HTTPS_PROXY,bypass:"localhost,127.0.0.1"} });
const snapJs = () => { const c=o=>JSON.parse(JSON.stringify(o)); return { url:location.pathname+location.search,
  dataLayer:(window.dataLayer||[]).map(a=>c(Array.from(a))), fbq:(window.fbq&&window.fbq.queue||[]).map(a=>c(Array.from(a))), clarity:(window.clarity&&window.clarity.q||[]).map(a=>c(Array.from(a))) }; };
async function mk(base, ad, posts) {
  const ctx = await browser.newContext({ viewport:{width:412,height:915}, deviceScaleFactor:2.625, isMobile:true, hasTouch:true, userAgent:UA });
  await ctx.route("**/*", r => { const q=r.request(); const u=new URL(q.url());
    if (STUB.test(u.hostname)) { stubbed.add(u.hostname); return r.fulfill({status:204,body:""}); }
    if (q.method()==="POST" && u.pathname==="/api/season-one") { posts.push(q.postData()); return r.fulfill({status:200,contentType:"application/json",body:'{"ok":true}'}); }
    return r.continue(); });
  ctx.on("response", rs => { const u=new URL(rs.url()); if(u.protocol.startsWith("http")&&!ALLOWED.has(u.hostname)&&!STUB.test(u.hostname)) offenders.add(u.hostname); });
  await ctx.addInitScript(()=>{ window.addEventListener("pagehide",()=>{ try{ const c=o=>JSON.parse(JSON.stringify(o)); const a=JSON.parse(sessionStorage.getItem("__snaps")||"[]"); a.push({ url:location.pathname+location.search, dataLayer:(window.dataLayer||[]).map(x=>c(Array.from(x))), fbq:(window.fbq&&window.fbq.queue||[]).map(x=>c(Array.from(x))), clarity:(window.clarity&&window.clarity.q||[]).map(x=>c(Array.from(x))) }); sessionStorage.setItem("__snaps",JSON.stringify(a)); }catch(e){} }); });
  return ctx;
}
async function load(page, base, path) { await page.goto(base+path,{waitUntil:"load"}); await page.waitForTimeout(1500); }
async function typeSubmit(page) {
  await page.evaluate(()=>document.getElementById("join-top").scrollIntoView({block:"start"})); await page.waitForTimeout(500);
  await page.tap("#em-top"); await page.keyboard.type("qa+sentry@example.com",{delay:20});
  await page.tap('form[data-where="top"] button'); await page.waitForSelector("#conf:not([hidden])",{timeout:10000}); await page.waitForTimeout(800);
}
const res = {};
for (const ad of ["d18","d19"]) {
  const P = `/season1?ad=${ad}&utm_source=meta&utm_medium=paid_social&utm_campaign=s1&utm_content=${ad}-a&s1qa=1`;
  // J1: equality journey on main and branch. Branch also taps the lock button at the end (real navigation).
  for (const [lab,port] of [["main",3101],["branch",3100]]) {
    const base=`http://localhost:${port}`, posts=[]; const ctx=await mk(base,ad,posts); const page=await ctx.newPage();
    const errs=[]; page.on("pageerror",e=>errs.push(e.message)); page.on("console",m=>{ if(m.type()==="error") errs.push(m.text()); });
    await load(page,base,P);
    const hrefs = await page.evaluate(()=>[...document.querySelectorAll("[data-join]")].map(a=>({where:a.dataset.join,tag:a.tagName,href:a.getAttribute("href"),tabIndex:a.tabIndex,text:a.textContent.trim()})));
    await page.mouse.move(100,500); await page.evaluate(()=>window.scrollBy(0,300)); await page.waitForTimeout(500);
    const atScroll = await page.evaluate(snapJs);
    await typeSubmit(page);
    const afterSubmit = await page.evaluate(snapJs);
    const confHref = await page.evaluate(()=>({href:document.querySelector('#conf [data-join="confirm"]')?.getAttribute("href")??null, tag:document.querySelector('#conf [data-join="confirm"]')?.tagName??null, tabIndex:document.querySelector('#conf [data-join="confirm"]')?.tabIndex??null}));
    let tapDoc=null;
    if (lab==="branch") {
      await Promise.all([ page.waitForURL(/\/season1\/join/,{timeout:10000}), page.tap('#conf [data-join="confirm"]') ]);
      await page.waitForTimeout(1500);
      tapDoc = { snaps: await page.evaluate(()=>JSON.parse(sessionStorage.getItem("__snaps")||"[]")), joinUrl: page.url().replace(base,""), joinDoc: await page.evaluate(snapJs) };
    }
    res[`J1-${ad}-${lab}`]={hrefs,atScroll,afterSubmit,confHref,tapDoc,posts,errors:errs};
    await ctx.close();
  }
  // J2 (branch only): top link tap with real navigation, join page checks, back, then submit and lock tap. Snapshots per document.
  {
    const base="http://localhost:3100", posts=[]; const ctx=await mk(base,ad,posts); const page=await ctx.newPage();
    await load(page,base,P);
    await page.evaluate(()=>window.scrollBy(0,300)); await page.waitForTimeout(400);
    await page.locator('[data-join="top"]').scrollIntoViewIfNeeded();
    await Promise.all([ page.waitForURL(/\/season1\/join/,{timeout:10000}), page.tap('[data-join="top"]') ]);
    await page.waitForTimeout(1500);
    const joinUrl=page.url().replace(base,""); const joinDoc=await page.evaluate(snapJs);
    await page.goBack({waitUntil:"load"}); await page.waitForTimeout(1500);
    const backDoc=await page.evaluate(snapJs); const backUrl=page.url().replace(base,"");
    // second tap on the top link after back (one more click), then back again
    await page.locator('[data-join="top"]').scrollIntoViewIfNeeded();
    await Promise.all([ page.waitForURL(/\/season1\/join/,{timeout:10000}), page.tap('[data-join="top"]') ]); await page.waitForTimeout(1000);
    await page.goBack({waitUntil:"load"}); await page.waitForTimeout(1500);
    await typeSubmit(page);
    await Promise.all([ page.waitForURL(/\/season1\/join/,{timeout:10000}), page.tap('#conf [data-join="confirm"]') ]); await page.waitForTimeout(1500);
    res[`J2-${ad}`]={joinUrl,joinDocAtJoin:joinDoc,backUrl,backDoc,snaps:await page.evaluate(()=>JSON.parse(sessionStorage.getItem("__snaps")||"[]")),finalDoc:await page.evaluate(snapJs),posts};
    await ctx.close();
  }
  // J3 (branch only): keyboard focus and Enter, and a real second tab (ctrl-click) on the top and bottom links; join_view in the new tab.
  {
    const base="http://localhost:3100"; const posts=[]; const ctx=await mk(base,ad,posts); const page=await ctx.newPage();
    await load(page,base,P);
    const kb={};
    for (const w of ["top","bottom"]) {
      await page.locator(`[data-join="${w}"]`).scrollIntoViewIfNeeded();
      await page.focus(`[data-join="${w}"]`);
      kb[w]=await page.evaluate((w)=>{ const a=document.querySelector(`[data-join="${w}"]`); return {focused:document.activeElement===a, tag:a.tagName, hrefSet:!!a.getAttribute("href"), tabIndex:a.tabIndex, role:a.getAttribute("role")}; },w);
      const href=await page.locator(`[data-join="${w}"]`).getAttribute("href");
      const [np]=await Promise.all([ ctx.waitForEvent("page"), page.locator(`[data-join="${w}"]`).click({modifiers:["Control"]}) ]).catch(()=>[null]);
      if (np) { await np.waitForLoadState("domcontentloaded",{timeout:15000}).catch(()=>{}); await np.waitForTimeout(2500); kb[w].secondTab={url:np.url().replace(base,""),hrefAttr:href,joinView:await np.evaluate(()=>(window.dataLayer||[]).map(a=>Array.from(a)).filter(a=>a[1]==="season1_join_view")).catch(e=>String(e))}; await np.close(); }
      else kb[w].secondTab=null;
    }
    // Tab order reaches the link by keyboard: press Tab from the form input until the link is focused
    await page.locator("#em-top").scrollIntoViewIfNeeded(); await page.focus("#em-top");
    const order=[]; for(let i=0;i<4;i++){ await page.keyboard.press("Tab"); order.push(await page.evaluate(()=>{const a=document.activeElement;return a.tagName+(a.dataset&&a.dataset.join?"[data-join="+a.dataset.join+"]":"")+(a.id?"#"+a.id:"");})); }
    kb.tabOrderFromTopEmail=order;
    // Enter on focused top link navigates
    await page.focus('[data-join="top"]');
    await Promise.all([ page.waitForURL(/\/season1\/join/,{timeout:10000}), page.keyboard.press("Enter") ]).then(()=>kb.enterNavigated=true).catch(()=>kb.enterNavigated=false);
    res[`J3-${ad}`]=kb; await ctx.close();
  }
}
// J4: the join page followed from a tagged landing href in a second tab, with and without s1qa (does season1_join_view fire, and with which params)
{
  const base="http://localhost:3100"; const ctx=await mk(base,"d19",[]); 
  for (const suffix of ["&s1qa=1"]) {
    const p=await ctx.newPage(); await p.goto(base+`/season1/join?src=ad&ad=d19&utm_source=meta&utm_medium=paid_social&utm_campaign=s1&utm_content=d19-a${suffix}`,{waitUntil:"load"}); await p.waitForTimeout(1500);
    res["J4"+suffix]=await p.evaluate(snapJs); await p.close();
  }
  await ctx.close();
}
res._offenders=[...offenders]; res._stubbed=[...stubbed];
fs.writeFileSync(out,JSON.stringify(res,null,1)); console.log("offenders",JSON.stringify([...offenders]),"stubbed",JSON.stringify([...stubbed]));
await browser.close();
