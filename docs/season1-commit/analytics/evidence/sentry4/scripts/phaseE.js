const L=require('./lib');const {autoAttach,fillSignup,parseHits}=require('./lib2');const crypto=require('crypto');
(async()=>{
 const email=`team+s1test-sentry4-f15-${crypto.randomBytes(3).toString('hex')}@ekuzo.gg`;
 const b=await L.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});const page=await ctx.newPage();
 const log={phase:'E F15 pay, reload while paying, retap',email,kid:'Thessaly'};const rec=autoAttach(page,log);globalThis.__log=log;const res={email};
 await page.goto(L.BASE+'/season1/join?s1qa=1',{waitUntil:'domcontentloaded'});await L.sleep(3000);
 await page.goto(L.BASE+'/season1/join/signup',{waitUntil:'domcontentloaded'});await L.sleep(3000);
 await fillSignup(page,{kid:'Thessaly',age:10,parent:'Quillon',email,card:'4242424242424242'});
 res.attempt1=await page.evaluate(()=>sessionStorage.getItem('s1_attempt'));
 let aborted=0;await page.route(/\/season1\/join\/welcome/,async r=>{if(r.request().isNavigationRequest()&&aborted===0){aborted++;res.abortedAt=Date.now();await r.abort()}else await r.continue()});
 const t0=Date.now();await page.click('#go');
 for(let i=0;i<60&&!aborted;i++)await L.sleep(500);
 res.abortAfterMs=res.abortedAt-t0;await L.sleep(1000);res.urlAfterAbort=page.url();
 // the parent goes back to the sign-up while the payment is going through
 rec.mark('back');await page.goBack({waitUntil:'domcontentloaded'}).catch(e=>res.backErr=String(e).slice(0,200));await L.sleep(3000);res.urlAfterBack=page.url();
 if(!/\/signup/.test(page.url())){await page.goto(L.BASE+'/season1/join/signup',{waitUntil:'domcontentloaded'});await L.sleep(3000)}
 res.ssAfterBack=await page.evaluate(()=>Object.keys(sessionStorage));
 res.attempt2=await page.evaluate(()=>sessionStorage.getItem('s1_attempt'));
 res.formRestored=await page.evaluate(()=>({kid:(document.querySelector('.nm')||{}).value,email:document.getElementById('email').value}));
 await fillSignup(page,{kid:'Thessaly',age:10,parent:'Quillon',email,card:'4242424242424242'});
 const t1=Date.now();await page.click('#go');
 let note=null;for(let i=0;i<20;i++){await L.sleep(250);note=await page.evaluate(()=>({formErr:document.getElementById('formErr').textContent,live:document.getElementById('liveErr').textContent,alert:(document.querySelector('[role=alert]')||{}).textContent||'',go:document.getElementById('go').innerText,url:location.pathname}));if(/going through|Checking|on its way/i.test(note.formErr+note.live+note.alert))break}
 res.note=note;res.noteAtMs=Date.now()-t1;await page.screenshot({path:'shots/signup-f15-inprogress-1440.png'});
 await page.waitForURL(/\/season1\/join\/welcome$/,{timeout:30000});res.welcomeAfterMs=Date.now()-t1;await L.sleep(6000);
 res.welcome=await page.evaluate(()=>({text:document.body.innerText.slice(0,300),order:(document.body.innerText.match(/Order (\w+)/)||[])[1]}));
 await page.screenshot({path:'shots/welcome-f15-1440.png'});
 await b.close();for(const p of log.pages)p.hits=parseHits(p.reqs);log.res=res;L.save('phaseE.json',log);
 console.log(JSON.stringify(res,null,1));for(const p of log.pages)console.log('==',p.label.slice(0,90),JSON.stringify(p.commits),'errs',p.errors.length,'cerr',p.console.filter(c=>c.type==='error').map(c=>c.text.slice(0,100)));
})().catch(e=>{console.error('FAIL',e);try{for(const p of globalThis.__log.pages)p.hits=parseHits(p.reqs);L.save('phaseE-fail.json',globalThis.__log)}catch(_){};process.exit(1)});
