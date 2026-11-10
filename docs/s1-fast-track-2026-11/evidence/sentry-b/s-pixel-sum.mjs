import fs from "fs"; const j=JSON.parse(fs.readFileSync(process.argv[2],"utf8"));
for(const r of j.rows){ console.log("==",r.ad,r.vp,"H",r.pageH.main,r.pageH.branch,"cta",r.ctaText.main.join("|"),"->",r.ctaText.branch.join("|"));
 if(r.above) console.log("  above eq",r.above.equal,"y",r.above.y,(r.above.boxes||[]).map((b,i)=>[b.x,b.y,b.w,b.h,r.above.boxesInside[i]?"in":"OUT"].join(",")).join(" | "));
 for(const s of r.sections){ if(s.md5Equal) continue; console.log("  sec",s.sec,"hD",s.heightDelta??"-","hIn",s.heightInside??"-","bad",s.badPx,"boxes",(s.boxes||[]).map(b=>[b.x,b.y,b.w,b.h,b.inside?"in":"OUT"].join(",")).join(" | ")); }
 console.log("  faq",r.faq.map(f=>f.md5Equal?"=":"d"+f.badPx).join(" "),"sticky",r.sticky.main.text??"-","->",r.sticky.branch.text??"-");
 if(r.conf) console.log("  conf bad",r.conf.badPx,"insideConf",r.conf.allInsideConf,"boxes",r.conf.boxes.length,"lock",!!r.conf.lockRect,"mainLock",r.conf.mainHasLock);
}
for(const r of j.rows){ if(r.faqProof) console.log("faqProof",r.ad,r.vp,JSON.stringify(r.faqProof)); }
