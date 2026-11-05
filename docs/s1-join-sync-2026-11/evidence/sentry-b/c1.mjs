import { chromium, newCtx, stats } from "./common.mjs";
import fs from "fs";
const paths = ["/season1/join","/season1/join/b","/season1/join/jersey?ad=d19","/season1?ad=d18","/season1?ad=d19","/season1?ad=d21","/season1?ad=d2","/blog"];
const b = await chromium.launch();
const out = {};
for (const port of [3110, 3200]) for (const w of [375, 1440]) for (const p of paths) {
  const ctx = await newCtx(b, { viewport: { width: w, height: w === 375 ? 667 : 900 } });
  const pg = await ctx.newPage();
  const errs = [], bad = [];
  pg.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errs.push(m.type() + ": " + m.text().slice(0, 200)); });
  pg.on("pageerror", (e) => errs.push("pageerror: " + String(e).slice(0, 200)));
  pg.on("response", (r) => { if (r.status() >= 400 && r.url().startsWith("http://localhost")) bad.push(r.status() + " " + r.url().replace(/^http:\/\/localhost:\d+/, "")); });
  pg.on("requestfailed", (r) => { if (r.url().startsWith("http://localhost")) bad.push("FAILED " + r.url().replace(/^http:\/\/localhost:\d+/, "")); });
  await pg.goto(`http://localhost:${port}${p}`, { waitUntil: "load" });
  await pg.waitForTimeout(4000);
  out[`${port} ${w} ${p}`] = { errs, bad };
  await ctx.close();
}
await b.close();
fs.writeFileSync(process.argv[2], JSON.stringify({ blocked: stats.blocked, out }, null, 1));
let diff = [];
for (const k of Object.keys(out)) if (k.startsWith("3110")) {
  const k2 = k.replace("3110", "3200"); const a = JSON.stringify(out[k]).replace(/localhost:\d+/g,""), c = JSON.stringify(out[k2]).replace(/localhost:\d+/g,"");
  console.log(k.replace("3110 ",""), "after:", out[k].errs.length + "e/" + out[k].bad.length + "b", "before:", out[k2].errs.length + "e/" + out[k2].bad.length + "b", a === c ? "SAME" : "DIFF");
}
console.log("blocked", stats.blocked);
