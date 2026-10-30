const L=require('./lib');const {autoAttach,parseHits}=require('./lib2');const zlib=require('zlib');
(async()=>{
 const b=await L.launch();const cookie=require('./orderCookie.json');const out={runs:[]};
 const pages=['/season1/join','/season1/join/signup','/crew/44245013','/season1/join/welcome','/season1/thanks?play=yes','/season1','/'];
 for(const qa of [false,true])for(const vp of [{width:390,height:844},{width:1440,height:900}]){
  const ctx=await b.newContext({viewport:vp});await ctx.addCookies(cookie);const page=await ctx.newPage();
  const log={qa,viewport:vp.width,clarity:[]};const rec=autoAttach(page,log);
  page.on('request',r=>{if(/clarity\.ms\/collect/.test(r.url())){const buf=r.postDataBuffer();if(buf){let txt='';try{txt=zlib.gunzipSync(buf).toString('utf8')}catch(e){txt='(not gzip) '+buf.toString('utf8')}log.clarity.push({page:page.url().replace(L.BASE,''),len:txt.length,zorbixa:/zorbixa/i.test(txt),code:txt.includes('44245013'),quillon:/quillon/i.test(txt),sample:txt.slice(0,0)})}}});
  if(qa){await page.goto(L.BASE+'/season1/join?s1qa=1',{waitUntil:'domcontentloaded'});await L.sleep(3000)}
  for(const p of pages){await page.goto(L.BASE+p,{waitUntil:'domcontentloaded'});await L.sleep(7000);
    if(p.includes('crew')||p.includes('welcome')||p.includes('signup'))await page.screenshot({path:`shots/${qa?'qa':'noflag'}-${p.split('/').filter(Boolean).pop()}-${vp.width}.png`,fullPage:true});
    if(p.includes('welcome'))log.welcomeHero=await page.evaluate(()=>document.querySelector('h1')&&document.querySelector('h1').innerText);}
  await ctx.close();for(const p of log.pages)p.hits=parseHits(p.reqs);out.runs.push(log);
 }
 await b.close();L.save('phaseC.json',out);
 for(const r of out.runs){console.log('\n### qa',r.qa,'vp',r.viewport,'hero',r.welcomeHero);
  for(const p of r.pages){if(p.label==='(pre)')continue;const v=L.vendorSummary(p);const ours=p.console.filter(c=>(c.type==='error'||c.type==='warning')&&(!c.loc||c.loc.includes('season1-commit--ekuzo')));
   console.log(' ',p.label.replace(L.BASE,'').slice(0,40).padEnd(40),'vendor',String(v.count).padStart(3),Object.keys(v.hosts).map(h=>h.split('/')[0]).filter((x,i,a)=>a.indexOf(x)===i).join(','),'| pageErr',p.errors.length,'| console err/warn (our origin):',ours.map(c=>c.type+':'+c.text.slice(0,90)).join(' || '))}
  console.log('  clarity payloads:',JSON.stringify(r.clarity.map(c=>[c.page.slice(0,25),c.len,c.zorbixa,c.code,c.quillon])))}
})().catch(e=>{console.error('FAIL',e);process.exit(1)});
