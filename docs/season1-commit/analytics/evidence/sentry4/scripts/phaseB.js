const L=require('./lib');const {autoAttach,fillSignup,parseHits}=require('./lib2');const fs=require('fs');
const crypto=require('crypto');
(async()=>{
 const id=crypto.randomBytes(3).toString('hex');
 const email=`team+s1test-sentry4-b-${id}@ekuzo.gg`;
 const b=await L.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});const page=await ctx.newPage();
 const log={phase:'B QA main paid run',email,kid:'Zorbixa',parent:'Quillon'};const rec=autoAttach(page,log);globalThis.__log=log;
 const res={};
 // 1 join
 await page.goto(L.BASE+'/season1/join?s1qa=1&utm_source=meta&utm_campaign=t&fbclid=abc&kid=Sam&email=a@b.c',{waitUntil:'domcontentloaded'});
 await L.sleep(8000);
 res.joinAddressBar=page.url();
 res.joinMasks=await page.$$eval('[data-clarity-mask]',es=>es.map(e=>e.tagName+'#'+e.id));
 await page.screenshot({path:'shots/join-qa-1440.png'});
 // 2 to signup via the CTA
 const link=page.locator('a[href="/season1/join/signup"]:visible').first();
 if(await link.count()){await link.click()}else{await page.goto(L.BASE+'/season1/join/signup')}
 await page.waitForURL(/\/season1\/join\/signup/,{timeout:20000});
 await L.sleep(4000);
 res.signupAddressBar=page.url();
 await fillSignup(page,{kid:'Zorbixa',age:11,parent:'Quillon',email,card:'4242424242424242'});
 res.signupMasks=await page.$$eval('[data-clarity-mask]',es=>es.map(e=>e.tagName+'#'+(e.id||e.className)));
 await page.screenshot({path:'shots/signup-filled-1440.png',fullPage:true});
 res.cookiesBeforePay=(await ctx.cookies()).filter(c=>/ekuzo_|_fb|s1_/.test(c.name)).map(c=>({name:c.name,httpOnly:c.httpOnly,secure:c.secure,sameSite:c.sameSite,path:c.path,domain:c.domain,value:c.name==='ekuzo_lc'?decodeURIComponent(c.value):c.value}));
 const tTap=Date.now();res.tTap=tTap;
 await page.click('#go');
 await page.waitForURL(/\/season1\/join\/welcome/,{timeout:90000});
 res.tWelcomeNav=Date.now();
 await page.waitForLoadState('domcontentloaded');await L.sleep(10000);
 res.welcomeAddressBar=page.url();
 res.welcome=await page.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return {title:document.title,referrer:document.referrer,text:document.body.innerText.slice(0,1500),nav:n?{startTime:n.startTime,responseStart:n.responseStart,responseEnd:n.responseEnd,domContentLoaded:n.domContentLoadedEventEnd,load:n.loadEventEnd,serverTiming:n.serverTiming.map(s=>({name:s.name,dur:s.duration,desc:s.description}))}:null,
   masks:[...document.querySelectorAll('[data-clarity-mask]')].map(e=>e.tagName+(e.id?'#'+e.id:'')+'.'+e.className+' :: '+(e.textContent||'').trim().slice(0,40)),
   links:[...document.querySelectorAll('[data-link],a')].map(a=>a.getAttribute('data-link')||a.getAttribute('href')).filter(h=>h&&h.includes('/crew/')),
   ss:Object.keys(sessionStorage),ls:Object.keys(localStorage)}});
 await page.screenshot({path:'shots/welcome-paid-1440.png',fullPage:true});
 // reload
 rec.mark('welcome-reload');await page.reload({waitUntil:'domcontentloaded'});await L.sleep(8000);
 res.welcomeReloadNav=await page.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return {responseEnd:n.responseEnd,serverTiming:n.serverTiming.map(s=>({name:s.name,dur:s.duration,desc:s.description}))}});
 res.cookiesAfter=(await ctx.cookies()).map(c=>({name:c.name,httpOnly:c.httpOnly,secure:c.secure,sameSite:c.sameSite,path:c.path,domain:c.domain,expires:c.expires,value:c.name==='ekuzo_lc'?decodeURIComponent(c.value):(/s1_order/.test(c.name)?'<redacted>':c.value.slice(0,80))}));
 fs.writeFileSync('orderCookie.json',JSON.stringify((await ctx.cookies()).filter(c=>/^s1_order/.test(c.name))));
 // crew, thanks, landing, home in QA session
 const crew=(res.welcome.links[0]||'').match(/\/crew\/([A-Za-z0-9]+)/);res.crewCode=crew&&crew[1];
 if(res.crewCode){await page.goto(L.BASE+'/crew/'+res.crewCode+'?utm_source=sms',{waitUntil:'domcontentloaded'});await L.sleep(8000);res.crewAddressBar=page.url();
   res.crewMasks=await page.$$eval('[data-clarity-mask]',es=>es.length);await page.screenshot({path:'shots/crew-qa-1440.png',fullPage:true});}
 for(const p of ['/season1/thanks?play=yes','/season1','/']){await page.goto(L.BASE+p,{waitUntil:'domcontentloaded'});await L.sleep(7000)}
 res.qaCookie=(await ctx.cookies()).filter(c=>c.name==='s1_qa').map(c=>({name:c.name,expires:c.expires,secure:c.secure}));
 await b.close();
 for(const p of log.pages){p.hits=parseHits(p.reqs)}
 log.res=res;L.save('phaseB.json',log);
 console.log(JSON.stringify(res,null,1).slice(0,6000));
 for(const p of log.pages){console.log('\n==',p.label.slice(0,110),'commits:',JSON.stringify(p.commits),'errors:',p.errors.length,'consoleErr:',p.console.filter(c=>c.type==='error').length);
   for(const h of p.hits)console.log('  ',h.k,h.en,h.k==='fb'?('eid='+(h.p.eid||'')+' cd='+Object.keys(h.p).filter(k=>/^cd\[/.test(k)).join(',')):h.k==='ga4'?('dbg='+(h.p._dbg||'')+' ep.debug_mode='+(h.p['ep.debug_mode']||'')+' dl='+(h.p.dl||'').slice(0,200)):'')}
})().catch(e=>{console.error('FAIL',e);try{for(const p of globalThis.__log.pages){p.hits=parseHits(p.reqs)};L.save('phaseB-fail.json',globalThis.__log)}catch(_){};process.exit(1)});
