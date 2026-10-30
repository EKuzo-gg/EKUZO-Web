const files=process.argv.slice(2);const out={scanned:0,ads:[],hits:{}};
const needles=["Calvorne","Dremmick","Osrielle","Pellanor","Zorbixa","Quillon","kid=","s1test","%40ekuzo","@ekuzo","a@b.c","a%40b.c","email=","payment_intent","_secret_","pi_3","/crew/4","/crew/5","44245013","52657982","s1_order","s1_ref"];
function walk(o,file){if(Array.isArray(o))o.forEach(x=>walk(x,file));else if(o&&typeof o==='object'){if(o.reqs)for(const r of o.reqs){if(!r.vendor)continue;out.scanned++;const s=decodeURIComponent(r.url.replace(/%(?![0-9A-F]{2})/gi,'%25'))+'\n'+(r.body&&!/^\u001f/.test(r.body)?r.body:'');const raw=r.url+'\n'+(r.body||'');const host=new URL(r.url).host;
   if(/ccm\/collect|measurement\/conversion/.test(r.url)){const u=new URL(r.url);out.ads.push({page:(o.label||'').replace(/https:\/\/[^/]+/,'').slice(0,40),en:u.searchParams.get('en'),dl:u.searchParams.get('dl'),url:u.searchParams.get('url'),dr:u.searchParams.get('dr')})}
   for(const n of needles)if(s.toLowerCase().includes(n.toLowerCase())||raw.toLowerCase().includes(n.toLowerCase())){const k=n+' @ '+host;out.hits[k]=(out.hits[k]||0)+1}}
  for(const v of Object.values(o))walk(v,file)}}
for(const f of files)walk(require(require('path').resolve(f)),f);
console.log('vendor requests scanned',out.scanned,'\nmust-not hits',JSON.stringify(out.hits));
const seen=new Set();for(const a of out.ads){const k=JSON.stringify([a.page,a.en,a.dl,a.url&&a.url.slice(0,90),a.dr]);if(!seen.has(k)){seen.add(k);console.log(k)}}
require('fs').writeFileSync('r2/grep-out.json',JSON.stringify(out,null,1));
