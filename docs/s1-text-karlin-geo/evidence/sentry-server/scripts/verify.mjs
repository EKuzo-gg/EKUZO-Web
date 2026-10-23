import { readFileSync, writeFileSync } from "node:fs";
const dir = new URL("../runs/", import.meta.url).pathname;
const out = []; const p = (s) => out.push(s); let fails = 0;
const chk = (name, cond, extra = "") => { p(`${cond ? "PASS" : "FAIL"} ${name} ${extra}`); if (!cond) fails++; };
const load = (n, tag) => JSON.parse(readFileSync(dir + `res-${n}-${tag}.json`, "utf8")).results;
const evOf = (r) => r.calls.find((c) => c.host === "a.klaviyo.com" && c.path.endsWith("/events"))?.body?.data?.attributes;
const props = (r) => evOf(r)?.properties; const prof = (r) => evOf(r)?.profile.data.attributes.properties;
const metric = (r) => evOf(r)?.metric.data.attributes.name;
const all = { n4: load("branch", "n4"), rest: load("branch", "rest") };
const R = [...all.n4, ...all.rest];
const by = (l) => R.find((r) => r.label === l);

// ---- N1 / M3
p("## N1/M3 Meta checks (branch, all requests incl. control)");
const metaCalls = R.flatMap((r) => r.calls.filter((c) => c.host === "graph.facebook.com").map((c) => ({ label: r.label, body: c.body })));
const BAD = /tz|geo_|season1_|timezone|Austin|Honolulu|Chicago|America\/|Reykjavik|TX\b/i;
// event_id is a request-supplied token that echoes the test label (e.g. "ev-m1m-object-tz"), so it is excluded from the content scan.
const scrub = (b) => JSON.stringify(b, (k, v) => (k === "event_id" ? "<id>" : v));
const badMeta = metaCalls.filter((m) => BAD.test(scrub(m.body)));
chk("N1 Lead positive control present with em", !!by("control").calls.find((c) => c.host === "graph.facebook.com" && c.body.data[0].event_name === "Lead" && c.body.data[0].user_data.em?.length === 1));
chk("N1/M3 no tz/geo/season1/city key or value in any CAPI body", badMeta.length === 0, `(${metaCalls.length} CAPI bodies scanned; offenders ${badMeta.map((m) => m.label)})`);
chk("N1 CAPI event_name always Lead", metaCalls.every((m) => m.body.data[0].event_name === "Lead"));
const keysSeen = new Set(); metaCalls.forEach((m) => { Object.keys(m.body.data[0]).forEach((k) => keysSeen.add("top:" + k)); Object.keys(m.body.data[0].user_data).forEach((k) => keysSeen.add("user_data:" + k)); Object.keys(m.body.data[0].custom_data || {}).forEach((k) => keysSeen.add("custom_data:" + k)); });
p("CAPI key set: " + [...keysSeen].sort().join(", "));
const textReqs = R.filter((r) => metric(r) === "Season 01 Text Karlin");
chk("N1 text-karlin produced no graph.facebook.com call", textReqs.every((r) => !r.calls.some((c) => c.host === "graph.facebook.com")), `(${textReqs.length} text events)`);
const waitReqs = R.filter((r) => metric(r) === "Season 01 Waitlist" && r.status === 200);
chk("N1 Lead count equals non-honeypot main sign-ups", metaCalls.length === waitReqs.length, `(Lead ${metaCalls.length}, Waitlist events ${waitReqs.length})`);
for (const tag of ["n4", "rest"]) { const rs = all[tag]; const m = rs.flatMap((r) => r.calls).filter((c) => c.host === "graph.facebook.com").length; const w = rs.filter((r) => metric(r) === "Season 01 Waitlist" && r.status === 200).length; p(`  ${tag}: Lead ${m}, Waitlist ${w}`); }
const hp = R.filter((r) => /honeypot/.test(r.label));
chk("N3 honeypot: 200, zero calls", hp.length > 0 && hp.every((r) => r.status === 200 && r.calls.length === 0), `(${hp.length})`);
const subs = R.filter((r) => metric(r) === "Season 01 Waitlist");
chk("N4 every Waitlist sign-up made exactly event, subscribe, Lead in order", subs.every((r) => r.calls.map((c) => c.path.split("/").pop()).join() === "events,profile-subscription-bulk-create-jobs,events"), `(${subs.length})`);

// ---- profile/event consistency (R5/R6/R7)
p("\n## R5/R6/R7 consistency over every branch Klaviyo event");
let nEv = 0, inc = [], badChars = [], badTz = [];
for (const r of R) for (const c of r.calls) {
  if (c.host !== "a.klaviyo.com" || !c.path.endsWith("/events")) continue;
  const a = c.body.data.attributes, m = a.metric.data.attributes.name; if (!/Waitlist$|Text Karlin/.test(m)) continue; nEv++;
  const e = a.properties, pr = a.profile.data.attributes.properties;
  if (!!e.geo_city !== ("season1_city" in pr) || (e.geo_city && pr.season1_city !== e.geo_city)) inc.push(r.label + ":city");
  if (!!e.geo_region !== ("season1_region" in pr) || (e.geo_region && pr.season1_region !== e.geo_region)) inc.push(r.label + ":region");
  if (!!e.tz !== ("season1_tz" in pr) || (e.tz && pr.season1_tz !== e.tz)) inc.push(r.label + ":tz");
  if (["season1_city", "season1_region", "season1_tz"].some((k) => k in pr && pr[k] === "")) inc.push(r.label + ":empty-written");
  if (/["\\\u0000-\u001f\u007f-\u009f]/.test(e.geo_city + e.geo_region + e.tz + (pr.season1_city || "") + (pr.season1_region || ""))) badChars.push(r.label);
  if (e.tz && !/^[A-Za-z0-9_+\-/]{1,64}$/.test(e.tz)) badTz.push(r.label);
  if (!["browser", "geo", ""].includes(e.tz_source) || (e.tz === "") !== (e.tz_source === "")) inc.push(r.label + ":tz_source");
  if (e.geo_tz && !/^[A-Za-z0-9_+\-/]{1,64}$/.test(e.geo_tz)) badTz.push(r.label + ":geo_tz");
}
chk("R6 profile props written iff event value non-empty, never empty", inc.length === 0, `(${nEv} events; ${inc.slice(0, 10)})`);
chk("R7 no quote, backslash or control char in geo_city, geo_region, tz or profile city/region (any request)", badChars.length === 0, badChars.join());
chk("R4 every recorded tz/geo_tz matches the shape regex", badTz.length === 0, badTz.join());

// ---- journeys
p("\n## Journeys (branch event props / profile props)");
const show = (l) => { const r = by(l); if (!r) { p(`  ${l}: MISSING`); return null; } const e = props(r), pr = prof(r); const g = (k) => JSON.stringify(e[k]);
  p(`  ${l}: status ${r.status} | city ${g("geo_city")} region ${g("geo_region")} country ${g("geo_country")} postal ${g("geo_postal")} geo_tz ${g("geo_tz")} tz ${g("tz")} src ${g("tz_source")} | profile ${JSON.stringify(Object.fromEntries(Object.entries(pr).filter(([k]) => /city|region|tz|text_phone/.test(k))))}`); return { e, pr, r }; };
let x;
x = show("n4-popup"); chk("J3 popup (no tz in body) gets tz from geo, tz_source geo", x.e.tz === "America/Chicago" && x.e.tz_source === "geo" && x.pr.season1_tz === "America/Chicago");
x = show("n4-main-ad"); chk("R3/R5 main sign-up browser tz wins over geo", x.e.tz === "America/Denver" && x.e.tz_source === "browser" && x.e.geo_tz === "America/Chicago" && x.pr.season1_city === "Austin" && x.pr.season1_region === "TX");
x = show("n4-text"); chk("R1 text-karlin has geo_country/region/city/postal/geo_tz/tz/tz_source and old keys", x.e.geo_country === "US" && x.e.geo_region === "TX" && x.e.geo_city === "Austin" && x.e.geo_postal === "78757" && x.e.tz === "America/Denver" && x.e.phone === "+15125550123" && x.e.ad === "d10" && x.e.hero === "amount" && Object.keys(x.e).length === 10, `keys ${Object.keys(x.e)}`);
x = show("j4-main-nogeo-tz"); chk("J4 no header: geo_* empty; no season1_city/region; season1_tz from valid browser tz; 200", x.r.status === 200 && !x.e.geo_city && !x.e.geo_region && !x.e.geo_country && !x.e.geo_postal && !x.e.geo_tz && !("season1_city" in x.pr) && !("season1_region" in x.pr) && x.pr.season1_tz === "America/New_York" && x.e.tz_source === "browser");
x = show("j4-popup-nogeo-notz"); chk("J4 no header, no tz: tz empty, no geo profile props", x.r.status === 200 && x.e.tz === "" && x.e.tz_source === "" && !("season1_tz" in x.pr) && !("season1_city" in x.pr));
x = show("j4-text-nogeo-tz"); chk("J4 text, no header, valid browser tz: season1_tz only", x.r.status === 200 && x.pr.season1_tz === "America/New_York" && !("season1_city" in x.pr) && !("season1_region" in x.pr));
x = show("j4-text-nogeo-notz"); chk("J4 text, no header, no tz: profile props only the two pre-existing", x.r.status === 200 && Object.keys(x.pr).sort().join() === "season1_text_phone,season1_text_requested_at");
const a = show("j5-a-main-geo"); const b = show("j5-b-text-nogeo"); const c = show("j5-c-text-nogeo-notz");
chk("J5 text request without header after geo sign-up: profile omits season1_city/region (nothing blanks them)", !("season1_city" in b.pr) && !("season1_region" in b.pr) && !("season1_city" in c.pr) && !("season1_region" in c.pr) && !("season1_tz" in c.pr), `(j5-b keys ${Object.keys(b.pr)}; j5-c keys ${Object.keys(c.pr)})`);
x = show("j6-tzonly-main-browser"); chk("J6 tz-only header + browser tz: geo_tz set, other geo empty, browser wins", x.e.geo_tz === "Pacific/Honolulu" && !x.e.geo_city && !x.e.geo_region && x.e.tz === "America/Chicago" && x.e.tz_source === "browser");
x = show("j6-tzonly-popup"); chk("J6 tz-only header popup: tz from geo", x.e.tz === "Pacific/Honolulu" && x.e.tz_source === "geo" && x.pr.season1_tz === "Pacific/Honolulu" && !("season1_city" in x.pr));
x = show("j6-tzonly-text-notz"); chk("J6 tz-only header text: tz from geo", x.e.tz === "Pacific/Honolulu" && x.e.tz_source === "geo");
const NV = ["time", "unique_id", "season1_joined_at", "season1_text_requested_at"];
const nrm = (r) => JSON.stringify(r.calls.map((c) => c.body), (k, v) => (NV.includes(k) || k === "event_time" ? "<n>" : typeof v === "string" ? v.replace(/-\d{13}$/, "-<ms>").replace(/fb\.1\.\d{13}\./, "fb.1.<ms>.") : v));
chk("J7 text-karlin twice: identical events (normalized), both 200", by("j7-text-1").status === 200 && by("j7-text-2").status === 200 && nrm(by("j7-text-1")) === nrm(by("j7-text-2")));
chk("J8 main sign-up retried: identical props (normalized) incl. same Lead event_id", by("j8-main-1").status === 200 && nrm(by("j8-main-1")) === nrm(by("j8-main-2")));

p("\n## UTC alias behaviour");
for (const z of ["UTC", "Etc/UTC", "GMT", "Etc/GMT", "Zulu", "Etc/GMT+0", "Greenwich"]) {
  const k = z.replace(/\W/g, "_");
  const g1 = props(by("utc-geo-main-" + z)), g2 = props(by("utc-nogeozone-main-" + z));
  p(`  browser ${z}: with geo zone Chicago -> tz ${g1.tz} (${g1.tz_source}); without geo zone -> tz ${g2.tz} (${g2.tz_source})`);
  chk(`UTC alias ${z}: geo zone wins`, g1.tz === "America/Chicago" && g1.tz_source === "geo");
  chk(`UTC alias ${z}: no geo zone keeps browser UTC`, g2.tz === "UTC" && g2.tz_source === "browser" && prof(by("utc-nogeozone-main-" + z)).season1_tz === "UTC");
}
x = show("utc-geo-text"); chk("UTC text with geo zone: geo wins", x.e.tz === "America/Chicago" && x.e.tz_source === "geo");
x = show("utc-nogeo-text"); chk("UTC text no header: UTC kept, browser", x.e.tz === "UTC" && x.e.tz_source === "browser");
x = show("utc-geo-is-utc-main"); chk("UTC browser + UTC geo: UTC, browser", x.e.tz === "UTC" && x.e.tz_source === "browser" && x.e.geo_tz === "UTC");
x = show("browser-valid-vs-geo-diff"); chk("valid non-UTC browser beats geo", x.e.tz === "America/Los_Angeles" && x.e.tz_source === "browser");

p("\n## M1 tz values (rows: main no-geo-zone | text no-geo-zone | main with geo zone Chicago)");
const invalid = ["object", "object-tz", "array", "number", "null", "bool", "len65", "dotdot", "quote-brace", "notazone", "empty", "spaces", "backslash", "newline", "unicode", "mb1", "mb1-slash", "proto"];
const validMap = { lower: "America/Chicago", upper: "America/Chicago", plus: "Etc/GMT+5", est5edt: "America/New_York", len64ok: null, calcutta: null };
const m1names = [...invalid, "offset", ...Object.keys(validMap)];
for (const n of m1names) {
  const a1 = by("m1-main-" + n), a2 = by("m1-text-" + n), a3 = by("m1-main-geo-" + n);
  const t = (r) => `${JSON.stringify(props(r).tz)}/${JSON.stringify(props(r).tz_source)}`;
  p(`  ${n}: ${t(a1)} | ${t(a2)} | ${t(a3)} | status ${a1.status},${a2.status},${a3.status}`);
  if (invalid.includes(n) || n === "offset") {
    chk(`M1 ${n}: dropped to "" without geo zone (main and text)`, props(a1).tz === "" && props(a1).tz_source === "" && props(a2).tz === "" && props(a2).tz_source === "" && a1.status === 200 && a2.status === 200);
    chk(`M1 ${n}: falls back to geo zone`, props(a3).tz === "America/Chicago" && props(a3).tz_source === "geo" && a3.status === 200);
  } else {
    const ok = [a1, a2, a3].every((r) => r.status === 200 && props(r).tz_source === "browser" && (validMap[n] ? props(r).tz === validMap[n] : /^[A-Za-z0-9_+\-/]+$/.test(props(r).tz)));
    chk(`M1 valid ${n}: accepted and canonicalized`, ok);
  }
}
x = show("m1-main-tz-missing-key"); chk("M1 tz key absent: geo fallback", x.e.tz === "America/Chicago" && x.e.tz_source === "geo");

p("\n## M2 malformed x-nf-geo (branch: main | text | popup)");
const m2names = [...new Set(R.filter((r) => r.label.startsWith("m2-main-")).map((r) => r.label.slice(8)))];
for (const n of m2names) {
  const rs = ["main", "text", "popup"].map((k) => by(`m2-${k}-${n}`)); const e = props(rs[0]);
  p(`  ${n}: statuses ${rs.map((r) => r.status)} | main: city ${JSON.stringify(e.geo_city)} region ${JSON.stringify(e.geo_region)} country ${JSON.stringify(e.geo_country)} postal ${JSON.stringify(e.geo_postal)} geo_tz ${JSON.stringify(e.geo_tz)} tz ${JSON.stringify(e.tz)}/${e.tz_source}`);
  chk(`M2 ${n}: all 200`, rs.every((r) => r.status === 200));
}
const emp = ["not-base64", "json-array-b64", "json-array-raw", "json-null-b64", "json-string-b64", "json-number-b64", "json-true-raw", "empty", "only-spaces", "b64-garbage-json", "lat-long-only"];
for (const n of emp) { const e = props(by("m2-main-" + n)); chk(`M2 ${n}: empty geo fields, browser tz kept`, !e.geo_city && !e.geo_region && !e.geo_country && !e.geo_postal && !e.geo_tz && e.tz === "America/Denver" && e.tz_source === "browser"); }
let e = props(by("m2-main-tz-invalid")); chk("M2 tz-invalid: geo_tz empty, other geo kept", e.geo_tz === "" && e.geo_city === "Austin");
e = props(by("m2-popup-tz-invalid")); chk("M2 tz-invalid popup: tz empty", e.tz === "" && e.tz_source === "");
e = props(by("m2-popup-tz-object")); chk("M2 tz-object popup: tz empty", e.tz === "" && e.geo_tz === "");
e = props(by("m2-main-city-quotes")); chk("M2 city with quotes stripped", e.geo_city === "Austin");
e = props(by("m2-main-city-backslash")); chk("M2 city with backslash stripped", e.geo_city === "Austin");
e = props(by("m2-main-city-newline")); chk("M2 city with newline/tab/C0/DEL/C1 stripped", e.geo_city === "Austinxy", JSON.stringify(e.geo_city));
e = props(by("m2-main-region-brace")); chk('M2 region US"} stripped of the quote', e.geo_region === "US}", JSON.stringify(e.geo_region));
e = props(by("m2-main-region-backslash-str")); chk("M2 region with backslash stripped", e.geo_region === "TX");
e = props(by("m2-main-region-long")); chk("M2 region capped at 8", e.geo_region === "TEXASTEX");
e = props(by("m2-main-city-apostrophe")); chk("M2 apostrophe kept (pre-existing Klaviyo escape question)", e.geo_city === "Coeur d'Alene");
e = props(by("m2-main-raw-json")); chk("M2 raw JSON header parsed", e.geo_city === "Austin" && e.geo_tz === "America/Chicago");
e = props(by("m2-main-country-str")); chk("M2 bare-string country/subdivision and postal_code accepted", e.geo_country === "US" && e.geo_region === "TX" && e.geo_postal === "78757");
e = props(by("m2-main-city-nonstring")); chk("M2 non-string fields give empty", e.geo_city === "" && e.geo_country === "" && e.geo_postal === "" );
e = props(by("m2-main-huge-8k")); chk("M2 5000-char city capped at 80", e.geo_city.length === 80);
e = props(by("m2-main-emoji-city")); p("  emoji city value: " + JSON.stringify(e.geo_city));

p("\n## Status / no-5xx");
const all5 = R.filter((r) => r.status >= 500 || r.status < 0);
chk("no 5xx or client error anywhere on branch", all5.length === 0, `(${R.length} requests)`);
p(`\nTOTAL FAIL: ${fails}`);
writeFileSync(dir + "../verify.txt", out.join("\n") + "\n");
console.log(out.join("\n"));
