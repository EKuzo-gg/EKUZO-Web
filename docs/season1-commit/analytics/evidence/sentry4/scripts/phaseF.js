const L=require('./lib');const {autoAttach,fillSignup,parseHits}=require('./lib2');const crypto=require('crypto');
async function st(page){return page.evaluate(()=>({url:location.pathname,go:document.getElementById('go').innerText,busy:document.getElementById('go').getAttribute('aria-busy'),formErr:document.getElementById('formErr').textContent,ePay:(document.getElementById('e-pay')||{}).textContent,live:document.getElementById('liveErr').textContent}))}
(async()=>{
 const b=await L.launch();const out={};
 // F1 decline
 {const email=`team+s1test-sentry4-dec-${crypto.randomBytes(3).toString('hex')}@ekuzo.gg`;
  const ctx=await b.newContext({viewport:{width:390,height:844}});const page=await ctx.newPage();const log={phase:'F1 decline 4000000000000002',email,kid:'Orrinel'};const rec=autoAttach(page,log);const res={email};
  await page.goto(L.BASE+'/season1/join/signup?s1qa=1',{waitUntil:'domcontentloaded'});await L.sleep(3000);
  await fillSignup(page,{kid:'Orrinel',age:13,parent:'Quillon',email,card:'4000000000000002'});
  const samples=[];const t0=Date.now();await page.click('#go');
  for(let i=0;i<40;i++){await L.sleep(250);const s=await st(page);s.ms=Date.now()-t0;samples.push(s);if(s.busy==='false'&&i>2)break}
  res.tap1=samples;res.sawBusyLine1=samples.some(s=>/Still saving/.test(s.go+s.live));await page.screenshot({path:'shots/signup-decline-390.png',fullPage:false});
  await L.sleep(1500);const s2=[];const t1=Date.now();await page.click('#go');
  for(let i=0;i<40;i++){await L.sleep(250);const s=await st(page);s.ms=Date.now()-t1;s2.push(s);if(s.busy==='false'&&i>2)break}
  res.tap2=s2;res.sawBusyLine2=s2.some(s=>/Still saving/.test(s.go+s.live));res.finalUrl=page.url();
  res.ss=await page.evaluate(()=>Object.keys(sessionStorage));
  await ctx.close();for(const p of log.pages)p.hits=parseHits(p.reqs);log.res=res;out.decline=log;}
 // F2 3DS
 {const email=`team+s1test-sentry4-3ds-${crypto.randomBytes(3).toString('hex')}@ekuzo.gg`;
  const ctx=await b.newContext({viewport:{width:1440,height:900}});const page=await ctx.newPage();const log={phase:'F2 3DS 4000002500003155',email,kid:'Brivane'};const rec=autoAttach(page,log);const res={email};
  await page.goto(L.BASE+'/season1/join?s1qa=1&utm_source=meta&utm_campaign=3ds',{waitUntil:'domcontentloaded'});await L.sleep(3000);
  await page.goto(L.BASE+'/season1/join/signup',{waitUntil:'domcontentloaded'});await L.sleep(3000);
  await fillSignup(page,{kid:'Brivane',age:9,parent:'Quillon',email,card:'4000002500003155'});
  await page.click('#go');
  let clicked=false;for(let i=0;i<60&&!clicked;i++){await L.sleep(1000);
   for(const f of page.frames()){try{const btn=f.locator('#test-source-authorize-3ds, button:has-text("Complete")');if(await btn.count()&&await btn.first().isVisible()){await page.screenshot({path:'shots/signup-3ds-challenge-1440.png'});await btn.first().click();clicked=true;res.challengeFrame=f.url().slice(0,80);break}}catch(_){}}}
  res.clicked=clicked;
  await page.waitForURL(/\/season1\/join\/welcome/,{timeout:60000});await L.sleep(9000);
  res.welcome=await page.evaluate(()=>({addr:location.href,referrer:document.referrer,text:document.body.innerText.slice(0,120),order:(document.body.innerText.match(/Order (\w+)/)||[])[1]}));
  await page.screenshot({path:'shots/welcome-3ds-1440.png'});
  await ctx.close();for(const p of log.pages)p.hits=parseHits(p.reqs);log.res=res;out.threeds=log;}
 await b.close();L.save('phaseF.json',out);
 const d=out.decline.res;console.log('DECLINE',d.email,'busyLine1',d.sawBusyLine1,'busyLine2',d.sawBusyLine2,'final',d.finalUrl);
 console.log(' tap1 last',JSON.stringify(d.tap1.slice(-1)),'\n tap2 last',JSON.stringify(d.tap2.slice(-1)),'\n tap1 busy ms',d.tap1.filter(s=>s.busy==='true').map(s=>s.ms).join(','),'\n ss',d.ss);
 for(const p of out.decline.pages)console.log(' ==',p.label.slice(0,70),JSON.stringify(p.commits),'cerr',p.console.filter(c=>c.type==='error').map(c=>c.text.slice(0,120)));
 console.log('3DS',JSON.stringify(out.threeds.res,null,1));
 for(const p of out.threeds.pages){console.log(' ==',p.label.slice(0,70),JSON.stringify(p.commits),'cerr',p.console.filter(c=>c.type==='error').map(c=>c.text.slice(0,120)));for(const h of p.hits)if(h.k==='ga4')console.log('   ga4',h.en,'dl=',h.p.dl,'dr=',h.p.dr||'')}
})().catch(e=>{console.error('FAIL',e);process.exit(1)});
