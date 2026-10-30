const L=require('./lib');const {autoAttach,fillSignup,parseHits}=require('./lib2');const fs=require('fs');
(async()=>{
 const email=require('./phaseB.json').email;
 const b=await L.launch();const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(require('./fbinstr.js'));
 const page=await ctx.newPage();const log={phase:'D QA returning family + R15 throttle (390)',email,kid:'Velmora'};const rec=autoAttach(page,log);globalThis.__log=log;const res={};
 await page.goto(L.BASE+'/season1/join?s1qa=1&utm_source=klaviyo&utm_medium=email&utm_campaign=t2&utm_content=c2',{waitUntil:'domcontentloaded'});await L.sleep(6000);
 await page.screenshot({path:'shots/join-qa-390.png'});
 const link=page.locator('a[href="/season1/join/signup"]:visible').first();if(await link.count())await link.click();else await page.goto(L.BASE+'/season1/join/signup');
 await page.waitForURL(/\/signup/);await L.sleep(4000);
 await fillSignup(page,{kid:'Velmora',age:12,parent:'Quillon',email,card:'4242424242424242'});
 res.lcBefore=decodeURIComponent(((await ctx.cookies()).find(c=>c.name==='ekuzo_lc')||{}).value||'');
 res.attemptId=await page.evaluate(()=>sessionStorage.getItem('s1_attempt'));
 await page.screenshot({path:'shots/signup-filled-390.png',fullPage:true});
 await page.route('**/api/season1/commit',async r=>{await L.sleep(2600);await r.continue()});
 const t0=Date.now();await page.click('#go');
 await L.sleep(800);res.at800=await page.evaluate(()=>({go:document.getElementById('go').innerText,busy:document.getElementById('go').getAttribute('aria-busy'),live:document.getElementById('liveErr').textContent}));
 await L.sleep(1500);res.at2300=await page.evaluate(()=>({go:document.getElementById('go').innerText,busy:document.getElementById('go').getAttribute('aria-busy'),disabled:document.getElementById('go').disabled,live:document.getElementById('liveErr').textContent}));
 await page.screenshot({path:'shots/signup-busyline-390.png'});
 res.attemptIdAtTap=await page.evaluate(()=>sessionStorage.getItem('s1_attempt'));
 await L.sleep(1500);
 res.afterFirst=await page.evaluate(()=>({go:document.getElementById('go').innerText,busy:document.getElementById('go').getAttribute('aria-busy'),live:document.getElementById('liveErr').textContent,formErr:document.getElementById('formErr').textContent}));
 res.commit1=rec.cur.commits.slice();
 if(res.commit1.length&&res.commit1[0].body&&res.commit1[0].body.error==='price_changed'){await page.screenshot({path:'shots/signup-price-changed-390.png'});await page.click('#go');await L.sleep(2300);
   res.retap2300=await page.evaluate(()=>({go:document.getElementById('go').innerText,busy:document.getElementById('go').getAttribute('aria-busy'),live:document.getElementById('liveErr').textContent}));}
 res.attemptIdAtTap2=await page.evaluate(()=>sessionStorage.getItem('s1_attempt'));
 res.fbcallsSignup=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('__fbcalls')||'[]'));
 await page.waitForURL(/\/season1\/join\/welcome/,{timeout:90000});res.tNav=Date.now()-t0;
 await L.sleep(10000);
 res.welcome=await page.evaluate(()=>({text:document.body.innerText.slice(0,400),referrer:document.referrer,order:(document.body.innerText.match(/Order (\w+)/)||[])[1],fbcalls:JSON.parse(sessionStorage.getItem('__fbcalls')||'[]'),ss:Object.keys(sessionStorage)}));
 await page.screenshot({path:'shots/welcome-paid-390.png',fullPage:true});
 rec.mark('welcome-reload');await page.reload({waitUntil:'domcontentloaded'});await L.sleep(8000);
 res.fbcallsAfterReload=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('__fbcalls')||'[]'));
 await b.close();
 for(const p of log.pages)p.hits=parseHits(p.reqs);log.res=res;L.save('phaseD.json',log);
 const s=JSON.parse(JSON.stringify(res));s.welcome.fbcalls=s.welcome.fbcalls.map(c=>c.path+' '+JSON.stringify(c.args));s.fbcallsSignup=s.fbcallsSignup.map(c=>c.path+' '+JSON.stringify(c.args));s.fbcallsAfterReload=s.fbcallsAfterReload.map(c=>c.path+' '+JSON.stringify(c.args).slice(0,120));
 console.log(JSON.stringify(s,null,1));
 for(const p of log.pages){console.log('==',p.label.slice(0,90),'commits',JSON.stringify(p.commits),'errs',p.errors.length,'cerr',p.console.filter(c=>c.type==='error').map(c=>c.text.slice(0,100)));for(const h of p.hits)if(h.k!=='clarity'&&h.k!=='ads')console.log('  ',h.k,h.en,h.k==='ga4'?(h.p['epn.ms']||'')+' '+(h.p['ep.transaction_id']||''):'')}
})().catch(e=>{console.error('FAIL',e);try{for(const p of globalThis.__log.pages)p.hits=parseHits(p.reqs);L.save('phaseD-fail.json',globalThis.__log)}catch(_){};process.exit(1)});
