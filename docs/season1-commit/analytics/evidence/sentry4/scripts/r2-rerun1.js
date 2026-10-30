// Re-run at 76bf25e part 1: crew sweep (flag and no flag, 390/1440, join tap) + R2 no-flag regression + age mask.
const L=require('../lib');const {autoAttach,parseHits}=require('../lib2');
(async()=>{const b=await L.launch();const out={crew:[],noflag:[]};const cookie=require('../orderCookie.json');
 for(const qa of [false,true])for(const vp of [{width:390,height:844},{width:1440,height:900}]){
  const ctx=await b.newContext({viewport:vp});const page=await ctx.newPage();const log={qa,viewport:vp.width};const rec=autoAttach(page,log);
  if(qa){await page.goto(L.BASE+'/season1/join?s1qa=1',{waitUntil:'domcontentloaded'});await L.sleep(4000)}
  rec.mark('crew');await page.goto(L.BASE+'/crew/44245013?utm_source=sms',{waitUntil:'domcontentloaded'});await L.sleep(7000);
  const crewState=await page.evaluate(()=>({addr:location.pathname+location.search,gtag:typeof window.gtag,fbq:typeof window.fbq,clarity:typeof window.clarity,qaCookie:/s1_qa=1/.test(document.cookie)}));
  if(vp.width===390)await page.screenshot({path:`r2/shots/crew-${qa?'qa':'noflag'}-390.png`});
  const crewPage=rec.cur;
  await page.locator('a.join:visible').first().click();await page.waitForURL(/\/season1\/join\/signup/,{timeout:20000});await L.sleep(4000);
  const ageMask=await page.$$eval('select.ag',es=>es.map(e=>e.getAttribute('data-clarity-mask')));
  out.crew.push({qa,viewport:vp.width,crewState,crewVendor:crewPage.reqs.filter(r=>r.vendor).map(r=>r.url.slice(0,200)),crewPageErrors:crewPage.errors,crewConsoleErrors:crewPage.console.filter(c=>c.type==='error').map(c=>c.text.slice(0,120)),joinTapLanded:page.url().replace(L.BASE,''),signupVendorCount:rec.cur.reqs.filter(r=>r.vendor).length,ageMask});
  await ctx.close();}
 // R2 regression, no flag
 for(const vp of [{width:390,height:844},{width:1440,height:900}]){const ctx=await b.newContext({viewport:vp});await ctx.addCookies(cookie);const page=await ctx.newPage();const log={};const rec=autoAttach(page,log);
  for(const p of ['/season1/join?utm_source=meta&utm_campaign=t','/season1/join/signup','/season1/join/welcome','/season1/thanks?play=yes','/season1']){rec.mark(p);await page.goto(L.BASE+p,{waitUntil:'domcontentloaded'});await L.sleep(6000);
   out.noflag.push({viewport:vp.width,page:p,vendor:rec.cur.reqs.filter(r=>r.vendor).length,pageErrors:rec.cur.errors.length,hero:p.includes('welcome')?await page.evaluate(()=>(document.querySelector('h1')||{}).innerText):undefined})}
  await ctx.close()}
 await b.close();L.save('r2/rerun1.json',out);console.log(JSON.stringify(out,null,1));
})().catch(e=>{console.error('FAIL',e);process.exit(1)});
