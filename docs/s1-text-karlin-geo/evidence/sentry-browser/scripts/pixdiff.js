const {PNG}=require('pngjs');const pm=require('pixelmatch');const fs=require('fs');
const EV='/home/claude/sentry-browser/evidence';
const dir=process.argv[2]||'screens';const outdir=EV+'/'+dir+'-diff';fs.mkdirSync(outdir,{recursive:true});
const rows=[];
for(const vp of ['1440','375'])for(const st of ['hero','signup','text']){
  const a=PNG.sync.read(fs.readFileSync(`${EV}/${dir}/main-${st}-${vp}.png`)),b=PNG.sync.read(fs.readFileSync(`${EV}/${dir}/branch-${st}-${vp}.png`));
  if(a.width!==b.width||a.height!==b.height){rows.push({vp,st,diff:'SIZE MISMATCH',w:[a.width,a.height],w2:[b.width,b.height]});continue;}
  const d=new PNG({width:a.width,height:a.height});
  const n=pm(a.data,b.data,d.data,a.width,a.height,{threshold:0});
  // also raw exact compare
  let raw=0;for(let i=0;i<a.data.length;i+=4){if(a.data[i]!==b.data[i]||a.data[i+1]!==b.data[i+1]||a.data[i+2]!==b.data[i+2]||a.data[i+3]!==b.data[i+3])raw++;}
  if(raw>0)fs.writeFileSync(`${outdir}/diff-${st}-${vp}.png`,PNG.sync.write(d));
  rows.push({vp,st,size:`${a.width}x${a.height}`,pixelmatch_t0:n,raw});
}
console.log(JSON.stringify(rows));fs.writeFileSync(`${EV}/pixdiff-${dir}.json`,JSON.stringify(rows,null,1));
