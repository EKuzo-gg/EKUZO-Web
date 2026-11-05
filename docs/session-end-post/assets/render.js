const fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const P=__dirname,F=(n,d)=>fs.readFileSync(path.join(P,'pk',d,'package/files',n)).toString('base64');
const bs=F('big-shoulders-display-latin-900-normal.woff2','x-fontsource-big-shoulders-display-5.3.0.tgz'.replace(/^.*$/,fs.readdirSync(path.join(P,'pk')).find(x=>x.startsWith('x-')&&x.includes('big'))));
const idir=fs.readdirSync(path.join(P,'pk')).find(x=>x.startsWith('x-')&&x.includes('inter'));
const i7=F('inter-latin-700-normal.woff2',idir),i8=F('inter-latin-800-normal.woff2',idir);
let logo=fs.readFileSync('/home/claude/ekuzo-web/public/images/ekuzo-logo.svg','utf8');
const rows=[['Fortnite','about 20 min','Stop when the match ends.'],['League of Legends','about 45 min','No new queue after the agreed number.'],['Marvel Rivals','about 30 min','Stop when the match ends.'],['Super Smash Bros.','about 5 min','Stop after any match.'],['Minecraft','no match end','Pick a save point.'],['Roblox','depends on the game','Ask “does this save?”']];
const css=`@font-face{font-family:BS;font-weight:900;src:url(data:font/woff2;base64,${bs})}
@font-face{font-family:Inter;font-weight:700;src:url(data:font/woff2;base64,${i7})}
@font-face{font-family:Inter;font-weight:800;src:url(data:font/woff2;base64,${i8})}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#2B2B2B;color:#fff;font-family:Inter;overflow:hidden}
.eb{display:inline-block;background:#034FFF;color:#fff;font-weight:700;letter-spacing:.15em;text-transform:uppercase;transform:skewX(-8deg)}
.eb span{display:inline-block;transform:skewX(8deg)}
h1{font-family:BS;font-weight:900;text-transform:uppercase;line-height:.9}
.len{background:#034FFF;color:#fff;padding:.12em .45em .16em;white-space:nowrap}.rule{color:#d9d9d9;font-weight:700}.g{font-weight:800}
.logo{position:absolute}.logo svg{display:block;width:100%;height:auto}
.foot{color:#bdbdbd;font-weight:700}
.row{border-top:2px solid #4a4a4a}.row:first-child{border-top:3px solid #034FFF}
`;
const rowHtml=(r)=>`<div class="row"><div class="top"><span class="g">${r[0]}</span><span class="len g">${r[1]}</span></div><div class="rule">${r[2]}</div></div>`;
const notch=(n)=>`polygon(${n}px 0,100% 0,100% calc(100% - ${n}px),calc(100% - ${n}px) 100%,0 100%,0 ${n}px)`;
const portrait=`<style>${css}
body{width:1080px;height:1350px;position:relative}
.eb{position:absolute;left:72px;top:72px;font-size:24px;padding:11px 20px}
h1{position:absolute;left:72px;top:140px;font-size:140px;width:960px;white-space:nowrap}
.panel{position:absolute;left:72px;top:480px;width:936px;height:720px;background:#363636;clip-path:${notch(40)};padding:12px 40px 0 44px;display:flex;flex-direction:column}
.row{flex:1;display:flex;flex-direction:column;justify-content:center;gap:6px}
.top{display:flex;justify-content:space-between;align-items:center;font-size:40px}.top .len{font-size:34px}
.rule{font-size:27px}
.foot{position:absolute;left:72px;bottom:70px;font-size:27px}
.logo{right:72px;bottom:70px;width:200px}
</style><div class="eb"><span>THE END-OF-GAME PLAN</span></div><h1>Count matches,<br>not minutes.</h1><div class="panel">${rows.map(rowHtml).join('')}</div><div class="foot">Set the number together, before they start.</div><div class="logo">${logo}</div>`;
const half=(a)=>a.map(rowHtml).join('');
const land=`<style>${css}
body{width:1200px;height:630px;position:relative}
.eb{position:absolute;left:48px;top:40px;font-size:15px;padding:7px 14px}
h1{position:absolute;left:48px;top:96px;font-size:92px;line-height:1;width:1100px;white-space:nowrap}
.panel{position:absolute;left:48px;top:262px;width:1104px;height:292px;background:#363636;clip-path:${notch(24)};padding:6px 32px 0 32px;display:grid;grid-template-columns:1fr 1fr;column-gap:40px}
.col{display:flex;flex-direction:column}
.row{flex:1;display:flex;flex-direction:column;justify-content:center;gap:1px}
.top{display:flex;justify-content:space-between;align-items:center;font-size:23px;gap:12px}.top .len{font-size:20px}
.rule{font-size:15px}
.foot{position:absolute;left:48px;bottom:24px;font-size:16px}
.logo{right:48px;bottom:22px;width:110px}
</style><div class="eb"><span>THE END-OF-GAME PLAN</span></div><h1>Count matches, not minutes.</h1><div class="panel"><div class="col">${half(rows.slice(0,3))}</div><div class="col">${half(rows.slice(3))}</div></div><div class="foot">Set the number together, before they start.</div><div class="logo">${logo}</div>`;
(async()=>{const b=await chromium.launch();
for(const [html,w,h,n,src] of [[portrait,1080,1350,'count-matches-not-minutes.png','count-matches-not-minutes.html'],[land,1200,630,'count-matches-not-minutes-1200x630.png','count-matches-not-minutes-1200x630.html']]){
const full=`<!doctype html><meta charset=utf-8><style></style>${html}`;fs.writeFileSync(path.join(P,src),full);
const pg=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:1});await pg.setContent(full);await pg.evaluate(()=>document.fonts.ready);await pg.screenshot({path:path.join(P,n)});}
await b.close()})();
