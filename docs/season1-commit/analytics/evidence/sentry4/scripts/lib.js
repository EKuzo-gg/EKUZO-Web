const {chromium}=require('/opt/npm-tools/node_modules/playwright');
const fs=require('fs');
const BASE='https://season1-commit--ekuzo.netlify.app';
const VENDOR=/googletagmanager\.com|google-analytics\.com|analytics\.google\.com|doubleclick\.net|googleadservices\.com|google\.com\/(pagead|ads|ccm)|googlesyndication|connect\.facebook\.net|facebook\.com\/tr|facebook\.com|clarity\.ms|bing\.com/i;
async function launch(){return chromium.launch({proxy:{server:process.env.HTTPS_PROXY}})}
function attach(page,log){
  let cur={label:'(init)',reqs:[],console:[],errors:[],failed:[]};
  log.pages=log.pages||[];
  const api={
    start(label){cur={label,url:null,at:new Date().toISOString(),reqs:[],console:[],errors:[],failed:[]};log.pages.push(cur);return cur},
    get cur(){return cur}
  };
  page.on('request',r=>{const u=r.url();const e={t:Date.now(),method:r.method(),url:u,frame:(r.frame()&&r.frame().url()||'').slice(0,80),vendor:VENDOR.test(u)};
    if(e.vendor){try{const pd=r.postData();if(pd)e.body=pd.slice(0,20000)}catch(_){}}
    cur.reqs.push(e)});
  page.on('requestfailed',r=>cur.failed.push({url:r.url(),err:r.failure()&&r.failure().errorText}));
  page.on('console',m=>cur.console.push({type:m.type(),text:m.text().slice(0,500),loc:(m.location()||{}).url}));
  page.on('pageerror',e=>cur.errors.push(String(e).slice(0,500)));
  return api;
}
function vendorSummary(p){const v=p.reqs.filter(r=>r.vendor);const hosts={};for(const r of v){const h=new URL(r.url).host+new URL(r.url).pathname.replace(/\/[^/]*$/,'/');hosts[h]=(hosts[h]||0)+1}return {count:v.length,hosts}}
function save(name,obj){fs.writeFileSync(name,JSON.stringify(obj,null,1))}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
module.exports={launch,attach,vendorSummary,save,sleep,BASE,VENDOR};
