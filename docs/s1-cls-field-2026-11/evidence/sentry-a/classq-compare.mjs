import fs from "fs";
import { norm } from "./classq-lib.mjs";
const names = ["d18-utm", "d19-utm", "d2", "noad", "adzz", "hero-games-r0", "hero-games-r99", "d10-r0", "d10-r99"];
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const rows = [];
for (const n of names) {
  const m = JSON.parse(fs.readFileSync(`classq/main-${n}.json`)), b = JSON.parse(fs.readFileSync(`classq/branch-${n}.json`));
  const get = (o) => ({
    dataLayer: norm(o.after.dataLayer), fbq: norm(o.after.fbqQueue), clarity: norm(o.after.clarityQ),
    post: norm(o.posts.map((p) => ({ body: p.body, status: p.status }))),
    order: o.after.timeline.map((e) => e.k + ":" + (e.k === "dl" || e.k === "fbq" || e.k === "clarity" ? JSON.stringify(norm(e.d)).slice(0, 60) : e.d)),
    ls: norm(Object.fromEntries(Object.entries(o.after.localStorage).filter(([k]) => !/at$/.test(k)))), ss: norm(o.after.sessionStorage),
  });
  const A = get(m), B = get(b);
  const row = { n };
  for (const k of Object.keys(A)) row[k] = eq(A[k], B[k]) ? "equal" : "DIFF";
  if (m.j9) { const f = (o) => norm(o.j9.posts.map((p) => p.body)); row.j9 = eq(f(m), f(b)) ? "equal" : "DIFF"; row.j9ad = { main: m.j9.posts[0].body.ad, branch: b.j9.posts[0].body.ad, first: m.posts[0].body.ad }; }
  row.mainOffenders = m.hosts.offenders; row.branchOffenders = b.hosts.offenders;
  row.counts = { main: [m.after.dataLayer.length, m.after.fbqQueue?.length, m.after.clarityQ?.length], branch: [b.after.dataLayer.length, b.after.fbqQueue?.length, b.after.clarityQ?.length] };
  rows.push(row);
  if (Object.values(row).includes("DIFF")) fs.writeFileSync(`classq/DIFF-${n}.json`, JSON.stringify({ main: A, branch: B }, null, 1));
}
console.log(JSON.stringify(rows, null, 1));
fs.writeFileSync("classq/compare.json", JSON.stringify(rows, null, 1));
