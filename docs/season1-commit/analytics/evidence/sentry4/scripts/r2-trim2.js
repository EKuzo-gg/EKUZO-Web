const fs=require('fs');const tok=require('../orderCookie.json').map(c=>c.value);
const red=s=>{s=String(s).replace(/_secret_[A-Za-z0-9]+/g,'_secret_<redacted>').replace(/s1_order=[^;"\s]+/g,'s1_order=<redacted>');for(const t of tok)s=s.split(t).join('<token>');return s};
const tp=pages=>pages.filter(p=>p.reqs.length||p.commits&&p.commits.length).map(p=>({page:red(p.label),vendorRequests:p.reqs.filter(r=>r.vendor).map(r=>red(r.method+' '+r.url.slice(0,500))),commits:p.commits,consoleErrors:p.console.filter(c=>c.type==='error').map(c=>red((c.loc||'').slice(0,90)+' | '+c.text.slice(0,140))),pageErrors:p.errors}));
const out={crewAndNoFlag:require('./rerun1.json'),grep:(({scanned,hits,ads})=>({scanned,hits,ads}))(require('./grep-out.json'))};
for(const f of ['rerun2-XY','rerun2-X','rerun2-Z','rerun3']){const j=require('./'+f+'.json');for(const k in j)out[f+':'+k]={email:j[k].email,res:JSON.parse(red(JSON.stringify(j[k].res))),pages:tp(j[k].pages)}}
const s=JSON.stringify(out,null,1);if(/_secret_[A-Za-z0-9]{6}/.test(s))throw new Error('secret');fs.writeFileSync('r2/rerun-76bf25e.json',s);console.log(s.length);
