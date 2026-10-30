const L=require('./lib');
(async()=>{
 const b=await L.launch();const out={phase:'A no flag',runs:[]};
 for(const vp of [{width:1440,height:900},{width:390,height:844}]){
  const ctx=await b.newContext({viewport:vp});const page=await ctx.newPage();const log={viewport:vp.width};const rec=L.attach(page,log);
  for(const p of ['/season1/join?utm_source=meta&utm_campaign=t','/season1/join/signup','/season1/join/welcome','/season1/thanks?play=yes','/season1','/']){
   const c=rec.start(p);const r=await page.goto(L.BASE+p,{waitUntil:'load'});c.status=r&&r.status();await L.sleep(6000);c.url=page.url();
   c.cookies=(await ctx.cookies()).map(k=>k.name);
  }
  out.runs.push(log);await ctx.close();
 }
 await b.close();
 for(const l of out.runs)for(const p of l.pages)console.log(l.viewport,p.label,p.status,'vendor:',JSON.stringify(L.vendorSummary(p)),'errs:',p.errors.length,'consoleErr:',p.console.filter(c=>c.type==='error').map(c=>c.text.slice(0,120)).join(' | '),'cookies:',p.cookies.join(','));
 L.save('phaseA.json',out);
})();
