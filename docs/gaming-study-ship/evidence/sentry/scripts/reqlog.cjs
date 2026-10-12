const http=require("http");const fs=require("fs");
const F=process.env.QA_REQLOG;
const orig=http.Server.prototype.emit;
http.Server.prototype.emit=function(ev,req){ if(ev==="request"&&req&&req.url&&F){ try{ if(req.method!=="GET"&&req.method!=="HEAD"||req.url.startsWith("/api/")) fs.appendFileSync(F,JSON.stringify({t:Date.now(),m:req.method,u:req.url})+"\n"); }catch{} } return orig.apply(this,arguments); };
