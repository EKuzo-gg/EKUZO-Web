const {chromium,devices}=require('playwright');
const fs=require('fs'),path=require('path');
const EV='/home/claude/sentry-browser/evidence';
fs.mkdirSync(EV+'/screens',{recursive:true});fs.mkdirSync(EV+'/runs',{recursive:true});
const VERS={main:{port:4101,log:EV+'/server-main.log'},branch:{port:4102,log:EV+'/server-branch.log'}};
const BLOCK_HOSTS=['google-analytics.com','www.google-analytics.com','www.googletagmanager.com','googletagmanager.com','www.clarity.ms','clarity.ms','c.clarity.ms','www.facebook.com','facebook.com','connect.facebook.net'];
const IG_UA='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21A329 Instagram 300.0.0.29.110 (iPhone14,5; iOS 17_0; en_US; en-US; scale=3.00; 1170x2532; 500000000)';
const iphone=devices['iPhone 12'];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const logLines=f=>fs.readFileSync(f,'utf8').split('\n').filter(Boolean).map(l=>JSON.parse(l));

// cfg: {id, vp:'desk'|'mob', ua:'default'|'iphone'|'ig', tz, intlThrow, hero:'amount'|'games', heroClick:bool, shots:bool, reduced:bool}
async function run(version,cfg){
  const V=VERS[version]; const before=logLines(V.log).length;
  const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:[
    '--host-resolver-rules='+BLOCK_HOSTS.map(h=>`MAP ${h} 0.0.0.0`).join(', ')+', MAP *.facebook.com 0.0.0.0, MAP *.google-analytics.com 0.0.0.0, MAP *.googletagmanager.com 0.0.0.0, MAP *.clarity.ms 0.0.0.0, MAP *.doubleclick.net 0.0.0.0, MAP *.google.com 0.0.0.0'
  ]});
  const mob=cfg.vp==='mob';
  const opts={timezoneId:cfg.tz,locale:'en-US',viewport:mob?{width:375,height:812}:{width:1440,height:900},reducedMotion:cfg.reduced?'reduce':'no-preference',deviceScaleFactor:mob?2:1};
  if(mob){opts.isMobile=true;opts.hasTouch=true;opts.userAgent=cfg.ua==='ig'?IG_UA:iphone.userAgent;}
  const ctx=await browser.newContext(opts);
  const blocked=[],allowed=[];
  await ctx.route('**/*',route=>{
    const u=new URL(route.request().url());
    if(u.hostname==='localhost'||u.hostname==='127.0.0.1'||u.protocol==='data:'||u.protocol==='blob:'){allowed.push(route.request().method()+' '+u.href.slice(0,120));return route.continue();}
    blocked.push(route.request().method()+' '+u.href.slice(0,160));return route.abort('blockedbyclient');
  });
  await ctx.addInitScript(({hero,intlThrow})=>{
    try{localStorage.setItem('ekuzo_s1_hero_d10',hero);}catch(e){}
    if(intlThrow){const D=function(){throw new Error('sentry: Intl.DateTimeFormat disabled');};Intl.DateTimeFormat=D;}
  },{hero:cfg.hero||'amount',intlThrow:!!cfg.intlThrow});
  const page=await ctx.newPage();
  const consoleErr=[],pageErr=[],reqFail=[],reqBodies=[];
  page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')consoleErr.push({type:m.type(),text:m.text().slice(0,300),loc:(m.location()||{}).url});});
  page.on('pageerror',e=>pageErr.push(String(e&&e.stack||e).slice(0,400)));
  page.on('requestfailed',r=>reqFail.push(r.url().slice(0,140)+' :: '+(r.failure()||{}).errorText));
  page.on('request',r=>{if(r.method()==='POST')reqBodies.push({url:r.url(),body:r.postData()});});
  const R={version,cfg,steps:[]};
  const snap=()=>page.evaluate(()=>{
    const ser=a=>Array.from(a||[]).map(x=>Array.from(x).map(y=>y instanceof Date?'<date>':y));
    return {fbq:ser(window.fbq&&window.fbq.queue),dataLayer:ser(window.dataLayer),clarity:ser(window.clarity&&window.clarity.q),tzNow:Intl.DateTimeFormat===undefined?null:null};
  });
  const shot=async(state)=>{ if(!cfg.shots)return; const n=`${version}-${state}-${mob?'375':'1440'}.png`; await page.screenshot({path:`${EV}/screens/${n}`}); R.steps.push('shot '+n); };
  await page.goto(`http://localhost:${V.port}/season1?ad=d10`,{waitUntil:'load'});
  await sleep(1500);
  await shot('hero');
  R.heroLive=await page.evaluate(()=>({ihero:!document.getElementById('ihero').hidden,fbqType:typeof window.fbq,clarityType:typeof window.clarity,tzResolved:(()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone}catch(e){return 'THROWS'}})()}));
  // hero step
  if(cfg.heroClick){ await page.locator('.ih-opt').first().click(); await sleep(500); R.steps.push('hero option clicked'); }
  else { await page.locator('.ih-skip').click(); await sleep(700); R.steps.push('hero skipped'); }
  const em=page.locator('#em-top');
  await em.fill('sentry-test@example.com');
  await page.locator('form[data-where=top] button[type=submit]').click();
  await page.waitForSelector('#conf.on',{timeout:8000});
  await sleep(1500);
  R.steps.push('signup done, #conf.on');
  R.afterSignup=await snap();
  await shot('signup');
  await page.locator('#tk-ph').fill('5125550100');
  await page.locator('#tk-form button[type=submit]').click();
  await page.waitForSelector('#tk .tk-done:not([hidden])',{timeout:8000});
  await sleep(1000);
  R.steps.push('text done');
  R.afterText=await snap();
  await shot('text');
  R.confVisible=await page.evaluate(()=>({conf:!document.getElementById('conf').hidden,tkDone:!document.querySelector('#tk .tk-done').hidden}));
  await sleep(500);
  R.consoleErr=consoleErr;R.pageErr=pageErr;R.reqFail=reqFail;R.reqBodies=reqBodies;R.blocked=blocked;R.allowed=allowed;
  await ctx.close();await browser.close();
  const srv=logLines(V.log).slice(before);
  R.serverPosts=srv.map(s=>s.body); R.serverUA=srv.map(s=>s.ua);
  fs.writeFileSync(`${EV}/runs/${version}__${cfg.id}.json`,JSON.stringify(R,null,1));
  return R;
}
module.exports={run};
if(require.main===module){
  (async()=>{
    const cfgs=JSON.parse(process.argv[2]);
    for(const c of cfgs) for(const v of ['main','branch']){
      try{const r=await run(v,c);console.log(v,c.id,'posts',r.serverPosts.length,'ok',JSON.stringify(r.confVisible));}
      catch(e){console.log(v,c.id,'ERROR',e.message.slice(0,300));}
    }
  })();
}
