const fs=require('fs');const EV='/home/claude/sentry-browser/evidence';
const norm=o=>JSON.parse(JSON.stringify(o,(k,v)=>{
  if(k==='eventId'||k==='eventID')return '<eid>';
  if(typeof v==='string')return v.replace(/localhost:410\d/g,'localhost:PORT');
  return v;}));
const strip=o=>{const c=JSON.parse(JSON.stringify(o));delete c.tz;return c;};
const ids=fs.readdirSync(EV+'/runs').filter(f=>f.startsWith('main__')).map(f=>f.slice(6,-5));
const out=[];
const countLead=q=>q.filter(a=>a[0]==='track'&&a[1]==='Lead').length;
const noise=e=>/ERR_BLOCKED_BY_CLIENT|blockedbyclient/i.test(e.text||e)||/fonts\.googleapis|googletagmanager|facebook|clarity|google-analytics/.test(e.loc||'');
for(const id of ids){
  const M=JSON.parse(fs.readFileSync(`${EV}/runs/main__${id}.json`)),B=JSON.parse(fs.readFileSync(`${EV}/runs/branch__${id}.json`));
  const r={id,cfg:M.cfg};
  r.mainPosts=M.serverPosts.length;r.branchPosts=B.serverPosts.length;
  const mP=M.serverPosts.map(norm),bP=B.serverPosts.map(norm);
  r.mainHasTz=mP.map(p=>'tz' in p);r.branchTz=bP.map(p=>p.tz);
  r.restIdentical=JSON.stringify(mP.map(strip))===JSON.stringify(bP.map(strip));
  r.keysBranchMinusMain=bP.map((p,i)=>Object.keys(p).filter(k=>!(k in mP[i])));
  r.keysMainMinusBranch=mP.map((p,i)=>Object.keys(p).filter(k=>!(k in bP[i])));
  r.postOrderMain=M.serverPosts.map(p=>p.step||'signup');r.postOrderBranch=B.serverPosts.map(p=>p.step||'signup');
  r.leadMain=[countLead(M.afterSignup.fbq),countLead(M.afterText.fbq)];r.leadBranch=[countLead(B.afterSignup.fbq),countLead(B.afterText.fbq)];
  for(const k of ['fbq','dataLayer','clarity']){
    r[k+'Same']=JSON.stringify(norm(M.afterText[k]))===JSON.stringify(norm(B.afterText[k]))&&JSON.stringify(norm(M.afterSignup[k]))===JSON.stringify(norm(B.afterSignup[k]));
  }
  r.dlLen=B.afterText.dataLayer.length;r.clLen=B.afterText.clarity.length;
  r.confMain=M.confVisible;r.confBranch=B.confVisible;
  r.pageErrMain=M.pageErr;r.pageErrBranch=B.pageErr;
  const sig=e=>(e.type+'|'+e.text.replace(/localhost:410\d/g,'localhost:PORT')+'|'+(e.loc||'').replace(/localhost:410\d/g,'localhost:PORT'));
  const mS=M.consoleErr.map(sig),bS=B.consoleErr.map(sig);
  r.consoleNoiseMain=M.consoleErr.filter(noise).length;r.consoleNoiseBranch=B.consoleErr.filter(noise).length;
  r.consoleRealMain=M.consoleErr.filter(e=>!noise(e)).map(sig);r.consoleRealBranch=B.consoleErr.filter(e=>!noise(e)).map(sig);
  r.consoleSetEqual=JSON.stringify([...mS].sort())===JSON.stringify([...bS].sort());
  r.blockedMain=M.blocked;r.blockedBranch=B.blocked;
  r.nonLocalAllowed=[...M.allowed,...B.allowed].filter(u=>!/^(GET|POST) http:\/\/localhost:/.test(u));
  r.tzResolvedLive=B.heroLive.tzResolved;
  out.push(r);
}
fs.writeFileSync(EV+'/analysis.json',JSON.stringify(out,null,1));
for(const r of out)console.log(r.id,'| posts',r.mainPosts,r.branchPosts,'| mainHasTz',r.mainHasTz.join(),'| branchTz',r.branchTz.join(),'| restSame',r.restIdentical,'| extraKeysBranch',JSON.stringify(r.keysBranchMinusMain),'| lead M',r.leadMain,'B',r.leadBranch,'| fbq/dl/clar same',r.fbqSame,r.dataLayerSame,r.claritySame,'| conf',r.confBranch.conf,r.confBranch.tkDone,'| pageErr',r.pageErrMain.length,r.pageErrBranch.length,'| real console M',r.consoleRealMain.length,'B',r.consoleRealBranch.length,'setEq',r.consoleSetEqual,'| nonlocal allowed',r.nonLocalAllowed.length);
