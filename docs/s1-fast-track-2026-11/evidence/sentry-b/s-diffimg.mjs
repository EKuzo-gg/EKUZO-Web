import { createRequire } from "module"; const sharp=createRequire("/home/claude/wt-sentry/")("sharp");
const [dir,name,out]=process.argv.slice(2);
const A=await sharp(`${dir}/${name}-main.png`).raw().ensureAlpha().toBuffer({resolveWithObject:true}), B=await sharp(`${dir}/${name}-branch.png`).raw().ensureAlpha().toBuffer({resolveWithObject:true});
const w=Math.min(A.info.width,B.info.width), h=Math.min(A.info.height,B.info.height); const o=Buffer.alloc(w*h*4);
for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*A.info.width+x)*4,j=(y*B.info.width+x)*4,k=(y*w+x)*4; const d=Math.max(Math.abs(A.data[i]-B.data[j]),Math.abs(A.data[i+1]-B.data[j+1]),Math.abs(A.data[i+2]-B.data[j+2])); if(d>16){o[k]=255;o[k+1]=0;o[k+2]=60;o[k+3]=255;}else{o[k]=A.data[i]>>2;o[k+1]=A.data[i+1]>>2;o[k+2]=A.data[i+2]>>2;o[k+3]=255;}}
await sharp(o,{raw:{width:w,height:h,channels:4}}).resize({width:Math.min(w,700)}).png().toFile(out); console.log(out);
