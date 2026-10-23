// usage: node analyze.mjs <tag>   (reads runs/res-baseline-<tag>.json and runs/res-branch-<tag>.json)
import { readFileSync } from "node:fs";
const tag = process.argv[2];
const dir = new URL("../runs/", import.meta.url).pathname;
const B = JSON.parse(readFileSync(dir + `res-baseline-${tag}.json`, "utf8")).results;
const R = JSON.parse(readFileSync(dir + `res-branch-${tag}.json`, "utf8")).results;
const EV_ADD_WAIT = new Set(["geo_tz", "tz", "tz_source"]);
const EV_ADD_TEXT = new Set(["geo_country", "geo_region", "geo_city", "geo_postal", "geo_tz", "tz", "tz_source"]);
const PROF_ADD = new Set(["season1_city", "season1_region", "season1_tz"]);
const VOLATILE = ["time", "unique_id", "season1_joined_at", "season1_text_requested_at", "event_time"];
const norm = (o) => JSON.parse(JSON.stringify(o ?? null, (k, v) => (VOLATILE.includes(k) ? "<norm>" : typeof v === "string" ? v.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, "<uuid>").replace(/fb\.1\.\d{13}\./, "fb.1.<ms>.").replace(/-\d{13}$/, "-<ms>") : v)));
const out = []; const bad = []; const notes = [];
const p = (s) => out.push(s);
let nStatusDiff = 0, n5xx = 0;
for (let i = 0; i < B.length; i++) {
  const b = B[i], r = R[i];
  if (b.label !== r.label) { bad.push(`LABEL MISMATCH ${b.label} vs ${r.label}`); continue; }
  if (r.status >= 500 || r.status < 0) { n5xx++; bad.push(`5xx/err branch ${r.label} ${r.status}`); }
  if (b.status >= 500 || b.status < 0) notes.push(`5xx/err baseline ${b.label} ${b.status}`);
  if (b.status !== r.status || b.resp !== r.resp) { nStatusDiff++; bad.push(`STATUS/RESP DIFF ${r.label}: base ${b.status} ${b.resp} | branch ${r.status} ${r.resp}`); }
  if (b.calls.length !== r.calls.length) { bad.push(`CALL COUNT DIFF ${r.label}: base ${b.calls.length} branch ${r.calls.length}`); continue; }
  b.calls.forEach((bc, j) => {
    const rc = r.calls[j];
    if (bc.host !== rc.host || bc.path !== rc.path) { bad.push(`CALL TARGET DIFF ${r.label}#${j}`); return; }
    const nb = norm(bc.body), nr = norm(rc.body);
    if (bc.host === "a.klaviyo.com" && bc.path.endsWith("/events")) {
      const ba = nb.data.attributes, ra = nr.data.attributes;
      const metric = ra.metric.data.attributes.name;
      const evAdd = metric === "Season 01 Text Karlin" ? EV_ADD_TEXT : EV_ADD_WAIT;
      // event props
      const keys = new Set([...Object.keys(ba.properties), ...Object.keys(ra.properties)]);
      for (const k of keys) {
        const inB = k in ba.properties, inR = k in ra.properties;
        if (inB && !inR) bad.push(`${r.label} [${metric}] event key REMOVED ${k}`);
        else if (!inB && inR) { if (!evAdd.has(k)) bad.push(`${r.label} [${metric}] event key ADDED (not allowed) ${k}`); }
        else if (ba.properties[k] !== ra.properties[k]) {
          if (k === "geo_city" || k === "geo_region") notes.push(`${r.label} ${k}: base ${JSON.stringify(ba.properties[k])} -> branch ${JSON.stringify(ra.properties[k])} (strip)`);
          else bad.push(`${r.label} [${metric}] event value CHANGED ${k}: ${JSON.stringify(ba.properties[k])} -> ${JSON.stringify(ra.properties[k])}`);
        }
      }
      const bp = ba.profile.data.attributes.properties, rp = ra.profile.data.attributes.properties;
      for (const k of new Set([...Object.keys(bp), ...Object.keys(rp)])) {
        const inB = k in bp, inR = k in rp;
        if (inB && !inR) bad.push(`${r.label} profile key REMOVED ${k}`);
        else if (!inB && inR) { if (!PROF_ADD.has(k)) bad.push(`${r.label} profile key ADDED (not allowed) ${k}`); }
        else if (bp[k] !== rp[k]) bad.push(`${r.label} profile value CHANGED ${k}`);
      }
      // everything else in the body identical
      const strip = (x) => { const c = JSON.parse(JSON.stringify(x)); delete c.data.attributes.properties; delete c.data.attributes.profile.data.attributes.properties; return c; };
      if (JSON.stringify(strip(nb)) !== JSON.stringify(strip(nr))) bad.push(`${r.label} event envelope differs`);
    } else if (JSON.stringify(nb) !== JSON.stringify(nr)) {
      bad.push(`${r.label} ${bc.host}${bc.path} BODY DIFFERS (subscribe/meta must be identical)`);
    }
  });
}
p(`tag=${tag} requests=${R.length} status/response diffs=${nStatusDiff} branch 5xx/err=${n5xx}`);
p(`DISALLOWED DIFFS: ${bad.length}`); bad.forEach((x) => p("  " + x));
p(`NOTES: ${notes.length}`); notes.forEach((x) => p("  " + x));
import { writeFileSync } from "node:fs";
writeFileSync(dir + `../diff-${tag}.txt`, out.join("\n") + "\n");
console.log(out.join("\n").slice(0, 6000));
