import fs from "fs";
const dir = process.argv[2];
const A = JSON.parse(fs.readFileSync(`${dir}/beacon-3101.raw.json`)), B = JSON.parse(fs.readFileSync(`${dir}/beacon-3100.raw.json`));
const SKIPKEY = /^(gtm\.start|gtm\.uniqueEventId|eventID|event_id|eventId|timestamp|ts|_ts|time|event_time|sent_at)$/i;
const norm = v => { if (Array.isArray(v)) return v.map(norm); if (v && typeof v==="object") { const o={}; for (const k of Object.keys(v).sort()) { if (SKIPKEY.test(k)) { o[k]="<scrubbed>"; continue; } o[k]=norm(v[k]); } return o; }
  if (typeof v==="string") return v.replace(/localhost:310[01]/g,"localhost:PORT").replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f-]{27}\b/g,"<uuid>").replace(/\b1\d{12}\b/g,"<ms>").replace(/\b1\d{9}\b/g,"<s>"); return v; };
const iso=s=>s.replace(/\d{4}-\d\d-\d\dT[\d:.]+Z/g,"<iso>");
const lines = []; let nd = 0;
for (const id of Object.keys(A).filter(k=>!k.startsWith("_"))) for (const f of ["dataLayer","fbq","clarity","posts"]) {
  const a = JSON.stringify(f==="posts"?A[id][f].map(p=>norm(JSON.parse(p))):norm(A[id][f]),null,1), b = JSON.stringify(f==="posts"?B[id][f].map(p=>norm(JSON.parse(p))):norm(B[id][f]),null,1);
  if (iso(a)===iso(b)) { lines.push(`${id} ${f}: equal (${(f==="posts"?A[id][f]:A[id][f]).length} entries)`); continue; }
  nd++; lines.push(`${id} ${f}: DIFFERENT`);
  const al=iso(a).split("\n"), bl=iso(b).split("\n"); const sa=new Set(al), sb=new Set(bl);
  al.filter(l=>!sb.has(l)).forEach(l=>lines.push("   main only:   "+l.trim())); bl.filter(l=>!sa.has(l)).forEach(l=>lines.push("   branch only: "+l.trim()));
}
console.log(lines.join("\n")); console.log("differing lists:",nd);
