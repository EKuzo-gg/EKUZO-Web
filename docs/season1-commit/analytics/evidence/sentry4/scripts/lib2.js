const L=require('./lib');
function autoAttach(page,log){
  log.pages=[];let cur={label:'(pre)',reqs:[],console:[],errors:[],failed:[],commits:[]};log.pages.push(cur);
  page.on('framenavigated',f=>{if(f===page.mainFrame()){cur={label:f.url(),at:new Date().toISOString(),reqs:[],console:[],errors:[],failed:[],commits:[]};log.pages.push(cur)}});
  page.on('request',r=>{const u=r.url();const e={t:Date.now(),method:r.method(),url:u,vendor:L.VENDOR.test(u)};if(e.vendor){try{const pd=r.postData();if(pd)e.body=pd.slice(0,20000)}catch(_){}}cur.reqs.push(e)});
  page.on('requestfailed',r=>cur.failed.push({url:r.url().slice(0,300),err:r.failure()&&r.failure().errorText}));
  page.on('console',m=>cur.console.push({type:m.type(),text:m.text().slice(0,400),loc:(m.location()||{}).url}));
  page.on('pageerror',e=>cur.errors.push(String(e).slice(0,400)));
  page.on('response',async res=>{if(res.url().includes('/api/season1/commit')){let j=null;try{j=await res.json()}catch(_){}
    const safe=j?Object.fromEntries(Object.entries(j).map(([k,v])=>[k,k==='clientSecret'?(v?'<present>':v):v])):null;
    cur.commits.push({t:Date.now(),status:res.status(),body:safe,setCookie:/s1_order=/.test((await res.allHeaders())['set-cookie']||'')})}});
  return {get cur(){return cur},mark(label){cur={label,at:new Date().toISOString(),reqs:[],console:[],errors:[],failed:[],commits:[]};log.pages.push(cur)}};
}
async function fillSignup(page,{kid,age,parent,email,card,exp='12 / 34',cvc='123',zip='78757'}){
  await page.waitForSelector('.nm',{timeout:20000});
  await page.fill('.nm',kid);await page.selectOption('.ag',String(age));
  await page.fill('#pname',parent);await page.fill('#email',email);
  await page.check('#terms');
  await page.waitForTimeout(1500);
  const shut=await page.$eval('#cardSec',e=>e.classList.contains('shut')).catch(()=>false);
  if(shut){await page.click('#cardTog');await page.waitForTimeout(800)}
  const fr=page.frameLocator('#pe iframe').first();
  await fr.locator('input[name="number"]').waitFor({timeout:30000});
  await fr.locator('input[name="number"]').fill(card);
  await fr.locator('input[name="expiry"]').fill(exp);
  await fr.locator('input[name="cvc"]').fill(cvc);
  const zipL=fr.locator('input[name="postalCode"]');if(await zipL.count())await zipL.fill(zip);
  await page.waitForTimeout(500);
}
function parseHits(reqs){
  const out=[];
  for(const r of reqs){if(!r.vendor)continue;const u=new URL(r.url);
    if(/\/g\/collect/.test(u.pathname)){const lines=(r.body||'').split('\n').filter(Boolean);const base=Object.fromEntries(u.searchParams);
      if(!lines.length)out.push({k:'ga4',en:base.en,p:base});else for(const ln of lines){const p={...base,...Object.fromEntries(new URLSearchParams(ln))};out.push({k:'ga4',en:p.en,p})}}
    else if(/facebook\.com$/.test(u.host)&&/^\/tr\/?$/.test(u.pathname)){const p=Object.fromEntries(u.searchParams);if(r.body&&!p.ev){Object.assign(p,Object.fromEntries(new URLSearchParams(r.body)))}out.push({k:'fb',en:p.ev,p})}
    else if(/clarity\.ms/.test(u.host))out.push({k:'clarity',en:u.pathname,p:{}});
    else if(/doubleclick|pagead|googleadservices|googlesyndication/.test(r.url))out.push({k:'ads',en:u.host+u.pathname,p:{}});
  }
  return out;
}
module.exports={autoAttach,fillSignup,parseHits};
