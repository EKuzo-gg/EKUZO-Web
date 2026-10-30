// Real server 409 in_progress in the browser: tap 1 commits, Stripe.js confirm is blocked on the client, the page is
// reloaded (same tab attempt), then the PI is confirmed through the Stripe test API (as if from another tab) and the
// parent taps at once. Test mode only.
const L=require('../lib');const {autoAttach,fillSignup,parseHits}=require('../lib2');const crypto=require('crypto');
const key=process.env.STRIPE_SECRET_KEY;if(!key||!key.startsWith('sk_test_'))process.exit(2);
async function ui(page){return page.evaluate(()=>{const n=document.getElementById('payNote'),cs=getComputedStyle(n),g=document.getElementById('go');return {noteHidden:n.hidden,note:n.textContent,noteColor:cs.color,noteBg:cs.backgroundColor,formErr:document.getElementById('formErr').textContent,live:document.getElementById('liveErr').textContent,liveAria:document.getElementById('liveErr').getAttribute('aria-live'),goDisabled:g.disabled,goBusy:g.getAttribute('aria-busy'),goText:g.innerText}})}
(async()=>{const b=await L.launch();const email=`team+s1test-sentry4r2-inprog409-${crypto.randomBytes(3).toString('hex')}@ekuzo.gg`;
 const ctx=await b.newContext({viewport:{width:390,height:844}});const page=await ctx.newPage();const log={flow:'X2 real 409 in_progress',email,kid:'Fennimore'};const rec=autoAttach(page,log);const res={email};
 let secret=null;page.on('response',async r=>{if(r.url().includes('/api/season1/commit')&&r.status()===200){try{const j=await r.json();if(j.clientSecret)secret=j.clientSecret}catch(_){}}});
 await page.goto(L.BASE+'/season1/join/signup?s1qa=1',{waitUntil:'domcontentloaded'});await L.sleep(3000);
 await fillSignup(page,{kid:'Fennimore',age:12,parent:'Quillon',email,card:'4242424242424242'});
 res.attempt=await page.evaluate(()=>sessionStorage.getItem('s1_attempt'));
 await page.route(/api\.stripe\.com\/v1\/payment_intents\/[^/]+\/confirm/,r=>r.abort('failed'));
 await page.click('#go');for(let i=0;i<60&&!secret;i++)await L.sleep(200);await L.sleep(2500);
 res.afterBlockedConfirm=await ui(page);
 await page.unroute(/api\.stripe\.com\/v1\/payment_intents\/[^/]+\/confirm/);
 await page.reload({waitUntil:'domcontentloaded'});await L.sleep(2500);
 if(!(await page.isChecked('#terms')))await page.check('#terms');
 const fr=page.frameLocator('#pe iframe').first();await fr.locator('input[name="number"]').waitFor();await fr.locator('input[name="number"]').fill('4242424242424242');await fr.locator('input[name="expiry"]').fill('12 / 34');await fr.locator('input[name="cvc"]').fill('123');const z=fr.locator('input[name="postalCode"]');if(await z.count())await z.fill('78757');await L.sleep(500);
 res.attemptAfterReload=await page.evaluate(()=>sessionStorage.getItem('s1_attempt'));
 const pi=secret.split('_secret_')[0];
 const c=await fetch(`https://api.stripe.com/v1/payment_intents/${pi}/confirm`,{method:'POST',headers:{authorization:'Bearer '+key,'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({payment_method:'pm_card_visa',return_url:L.BASE+'/season1/join/welcome'})});
 res.apiConfirm=(await c.json()).status;const t1=Date.now();await page.click('#go');
 let s,noteAt=null;for(let i=0;i<60;i++){await L.sleep(100);s=await ui(page);if(!s.noteHidden&&s.note){noteAt=Date.now();break}}
 res.tapAfterConfirmMs=t1;res.noteUi=s;res.noteAtMs=noteAt&&noteAt-t1;await page.screenshot({path:'r2/shots/inprog409-note-390.png'});
 await L.sleep(1500);res.midHold=await ui(page);
 await page.waitForURL(/\/season1\/join\/welcome/,{timeout:20000});res.noteToNavMs=Date.now()-noteAt;await L.sleep(8000);
 res.welcome=await page.evaluate(()=>({h1:(document.querySelector('h1')||{}).innerText,order:(document.body.innerText.match(/Order (\w+)/)||[])[1],ss:Object.keys(sessionStorage)}));
 await page.screenshot({path:'r2/shots/inprog409-welcome-390.png'});
 await b.close();for(const p of log.pages)p.hits=parseHits(p.reqs);log.res=res;L.save('r2/rerun3.json',{X2:log});
 console.log(JSON.stringify(res,null,1));for(const p of log.pages)if(p.commits.length)console.log(p.label.replace(L.BASE,''),JSON.stringify(p.commits));
})().catch(e=>{console.error('FAIL',e);process.exit(1)});
