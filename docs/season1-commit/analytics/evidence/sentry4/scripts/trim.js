const fs=require('fs');const tok=require('./orderCookie.json').map(c=>c.value);
const red=s=>{s=String(s).replace(/_secret_[A-Za-z0-9]+/g,'_secret_<redacted>');for(const t of tok)s=s.split(t).join('<s1_order token>');return s};
function trimPages(pages){return pages.filter(p=>p.reqs.length||p.commits&&p.commits.length).map(p=>({page:red(p.label),
 vendorRequests:p.reqs.filter(r=>r.vendor).map(r=>red(r.method+' '+r.url.slice(0,600))),
 parsed:(p.hits||[]).map(h=>h.k==='ga4'?{k:'ga4',en:h.en,dl:h.p.dl,dr:h.p.dr,debug_mode:h.p['ep.debug_mode'],_dbg:h.p._dbg,gcs:h.p.gcs,ms:h.p['epn.ms'],transaction_id:h.p['ep.transaction_id']}:{k:h.k,en:h.en}),
 commits:p.commits||[],consoleErrors:p.console.filter(c=>c.type==='error').map(c=>red((c.loc||'').slice(0,90)+' | '+c.text.slice(0,160))),pageErrors:p.errors}))}
const out={};
out.A_noflag=require('./phaseA.json').runs.map(r=>({viewport:r.viewport,pages:trimPages(r.pages)}));
for(const [k,f] of [['B_qa_paid_1440','phaseB.json'],['D_qa_returning_throttle_390','phaseD.json'],['E_f15_back_retap_1440','phaseE.json'],['E0_aborted_first_try','phaseE-fail.json']]){const l=require('./'+f);out[k]={email:l.email,kid:l.kid,res:JSON.parse(red(JSON.stringify(l.res||{}))),pages:trimPages(l.pages)};
 if(out[k].res.cookiesAfter)out[k].res.cookiesAfter=out[k].res.cookiesAfter.filter(c=>/ekuzo|s1_|_fb/.test(c.name))}
const F=require('./phaseF.json');for(const k of ['decline','threeds'])out['F_'+k]={email:F[k].email,res:JSON.parse(red(JSON.stringify(F[k].res))),pages:trimPages(F[k].pages)};
const C=require('./phaseC.json');out.C_sweep=C.runs.map(r=>({qa:r.qa,viewport:r.viewport,welcomeHero:r.welcomeHero,clarityPayloads:r.clarity.map(c=>({page:c.page,len:c.len,hasKidName:c.zorbixa,hasFamilyCode:c.code,hasParentName:c.quillon})),pages:trimPages(r.pages).map(p=>({page:p.page,vendorCount:p.vendorRequests.length,vendorHosts:[...new Set(p.vendorRequests.map(u=>new URL(u.split(' ')[1]).host))],consoleErrors:p.consoleErrors,pageErrors:p.pageErrors}))}));
const s=JSON.stringify(out,null,1);if(/_secret_[A-Za-z0-9]{6}/.test(s)||tok.some(t=>s.includes(t)))throw new Error('secret left');
fs.writeFileSync('browser-runs.json',s);console.log('bytes',s.length);
