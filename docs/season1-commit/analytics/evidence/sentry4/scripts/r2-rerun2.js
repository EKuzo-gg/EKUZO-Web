// Re-run at 76bf25e part 2: R14 back-and-retap (fast), forced ambiguous case, decline; QA flag; Ads grep data.
const L=require('../lib');const {autoAttach,fillSignup,parseHits}=require('../lib2');const crypto=require('crypto');
async function ui(page){return page.evaluate(()=>{const n=document.getElementById('payNote'),cs=getComputedStyle(n),g=document.getElementById('go');return {noteHidden:n.hidden,note:n.textContent,noteColor:cs.color,noteBg:cs.backgroundColor,noteClass:n.className,formErr:document.getElementById('formErr').textContent,live:document.getElementById('liveErr').textContent,liveRole:document.getElementById('liveErr').getAttribute('role'),liveAria:document.getElementById('liveErr').getAttribute('aria-live'),goDisabled:g.disabled,goBusy:g.getAttribute('aria-busy'),goText:g.innerText,path:location.pathname}})}
async function refillCard(page,card){if(!(await page.isChecked('#terms')))await page.check('#terms');const fr=page.frameLocator('#pe iframe').first();const n=fr.locator('input[name="number"]');await n.waitFor({timeout:20000});if((await n.inputValue()).replace(/\s/g,'')!==card){await n.fill(card);await fr.locator('input[name="expiry"]').fill('12 / 34');await fr.locator('input[name="cvc"]').fill('123');const z=fr.locator('input[name="postalCode"]');if(await z.count())await z.fill('78757');return 'refilled'}return 'kept'}
async function flow(b,name,opts){let page,log,res;try{return await flow0(b,name,opts,(pg,l,r)=>{page=pg;log=l;res=r})}catch(e){res.error=String(e).slice(0,300);try{res.uiAtError=await ui(page);res.urlAtError=page.url();await page.screenshot({path:`r2/shots/${name}-error.png`})}catch(_){}for(const p of log.pages)p.hits=parseHits(p.reqs);log.res=res;return log}}
async function flow0(b,name,{kid,card,ambiguous,joinQs},hook){
 const email=`team+s1test-sentry4r2-${name}-${crypto.randomBytes(3).toString('hex')}@ekuzo.gg`;
 const ctx=await b.newContext({viewport:{width:1440,height:900}});const page=await ctx.newPage();const log={flow:name,email,kid};const rec=autoAttach(page,log);const res={email};hook(page,log,res);
 await page.goto(L.BASE+'/season1/join?s1qa=1'+(joinQs||''),{waitUntil:'domcontentloaded'});await L.sleep(4000);res.joinAddr=page.url().replace(L.BASE,'');
 await page.locator('a[href="/season1/join/signup"]:visible').first().click();await page.waitForURL(/signup/);await L.sleep(3000);
 await fillSignup(page,{kid,age:11,parent:'Quillon',email,card});
 res.attempt=await page.evaluate(()=>sessionStorage.getItem('s1_attempt'));
 if(card==='4000000000000002'){const samples=[];for(const tap of [1,2]){const t0=Date.now();await page.click('#go');let s;for(let i=0;i<30;i++){await L.sleep(200);s=await ui(page);if(s.goBusy==='false'&&i>2)break}s.ms=Date.now()-t0;samples.push(s);await L.sleep(1000)}
   res.decline=samples;res.finalPath=new URL(page.url()).pathname;await page.screenshot({path:`r2/shots/decline-1440.png`});
 } else {
  let aborted=0;const welcomeRoute=async r=>{if(r.request().isNavigationRequest()&&!aborted){aborted=Date.now();await r.abort()}else await r.continue()};
  await page.route(/\/season1\/join\/welcome/,welcomeRoute);
  const t0=Date.now();await page.click('#go');for(let i=0;i<120&&!aborted;i++)await L.sleep(100);res.confirmToAbortMs=aborted-t0;
  await page.unroute(/\/season1\/join\/welcome/,welcomeRoute);
  await page.goBack({waitUntil:'domcontentloaded'}).catch(e=>res.backErr=String(e).slice(0,120));res.backAtMs=Date.now()-aborted;res.afterBack=page.url().replace(L.BASE,'');
  res.bfcache=await page.evaluate(()=>performance.getEntriesByType('navigation')[0].type);
  res.card=await refillCard(page,card);
  if(ambiguous)await page.route('**/api/season1/commit',r=>r.abort('failed'));
  res.retapAtMsAfterAbort=Date.now()-aborted;const t1=Date.now();await page.click('#go');
  let s,noteAt=null;for(let i=0;i<60;i++){await L.sleep(100);s=await ui(page);if(!s.noteHidden&&s.note){noteAt=Date.now();break}}
  res.noteUi=s;res.noteAtMs=noteAt&&noteAt-t1;await page.screenshot({path:`r2/shots/${name}-note-1440.png`});
  await L.sleep(1500);res.midHold=await ui(page);
  await page.waitForURL(/\/season1\/join\/welcome/,{timeout:20000});res.noteToNavMs=Date.now()-noteAt;
  await L.sleep(8000);res.welcome=await page.evaluate(()=>({path:location.pathname,h1:(document.querySelector('h1')||{}).innerText,order:(document.body.innerText.match(/Order (\w+)/)||[])[1],ss:Object.keys(sessionStorage)}));
  await page.screenshot({path:`r2/shots/${name}-welcome-1440.png`});
 }
 await ctx.close();for(const p of log.pages)p.hits=parseHits(p.reqs);log.res=res;return log}
(async()=>{const b=await L.launch();const out={};
 const only=process.argv[2]||'XYZ';if(only.includes('X'))out.X=await flow(b,'inprog',{kid:'Calvorne',card:'4242424242424242',joinQs:'&utm_source=meta&utm_campaign=t&fbclid=abc&kid=Calvorne&email=a@b.c'});
 if(only.includes('Y'))out.Y=await flow(b,'ambig',{kid:'Dremmick',card:'4242424242424242',ambiguous:true});
 if(only.includes('Z'))out.Z=await flow(b,'decline',{kid:'Osrielle',card:'4000000000000002'});
 await b.close();L.save('r2/rerun2-'+only+'.json',out);
 for(const k of Object.keys(out)){console.log('\n#####',k,JSON.stringify(out[k].res,null,1));for(const p of out[k].pages)if(p.commits.length||p.errors.length)console.log(' ',p.label.replace(L.BASE,'').slice(0,60),JSON.stringify(p.commits),p.errors)}
})().catch(e=>{console.error('FAIL',e);process.exit(1)});
