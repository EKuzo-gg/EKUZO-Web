import { createRequire } from "module";
const { chromium } = createRequire("/home/claude/")("playwright");
const b = await chromium.launch({ proxy:{server:process.env.HTTPS_PROXY,bypass:"localhost"} });
for (const port of [3101,3100]) { const c=await b.newContext({viewport:{width:412,height:915}}); await c.route("**/*",r=>{const u=new URL(r.request().url()); if(!/^(localhost|fonts\.)/.test(u.hostname)) return r.fulfill({status:204,body:""}); r.continue();});
 const p=await c.newPage(); await p.goto(`http://localhost:${port}/season1/join/jersey?ad=d21`,{waitUntil:"load"}); await p.waitForTimeout(500);
 console.log(port, await p.evaluate(()=>({search:location.search,dataAd:document.getElementById("jh").dataset.ad}))); await c.close(); }
await b.close();
