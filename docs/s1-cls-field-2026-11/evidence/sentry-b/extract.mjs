// Per-run extract from dev-tier1 JSON: doc responseEnd/encodedBodySize, hero img start/end, fonts CSS end, s1Ready time, gstatic list, L2.
import fs from "fs";
const dir = "docs/s1-cls-field-2026-11/evidence/vitals/dev-tier1/fb-android-412";
const out = [];
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
  const j = JSON.parse(fs.readFileSync(`${dir}/${f}`, "utf8"));
  const s = j.summary;
  const gs = j.network.filter((n) => /fonts\.gstatic\.com/.test(n.url));
  const readyEv = (j.events || []).find((e) => /ready/i.test(e.name || ""));
  const tl = (j.timeline || []).find((t) => t.ready === "1")?.t ?? null;
  out.push({ f, ad: s.ad, run: s.run, clsWin: s.clsWin, clsWinIn: s.clsWinIn, fp: s.firstPaint, fcp: s.fcp, lcp: s.lcp, lcpEl: s.lcpEl,
    respEnd: Math.round(j.nav.responseEnd), body: j.nav.encodedBodySize, heroStart: Math.round(s.heroImgStart), heroEnd: Math.round(s.heroImgEnd),
    fontsCssEnd: Math.round(s.fontsCssEnd), lt1: s.lt1Start, l2: s.heroImgStart < s.fontsCssEnd, ready: s.s1Ready, pre: s.s1Pre, marker: s.marker, tl,
    gstatic: gs.map((n) => ({ file: n.url.split("/").pop(), start: n.start, early: n.start < 3000 })) });
}
fs.writeFileSync(new URL("run-extract.json", import.meta.url), JSON.stringify(out, null, 1));
const med = (a) => { const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
for (const ad of ["d18", "d19", "d2", "noad"]) { const r = out.filter((o) => o.ad === ad); if (!r.length) continue;
  console.log(ad, "n", r.length, "LCP", r.map((x) => x.lcp).join(","), "med", med(r.map((x) => x.lcp)), "FP med", med(r.map((x) => x.fp)), "FCP med", med(r.map((x) => x.fcp)), "respEnd med", med(r.map((x) => x.respEnd)), "body", r[0].body, "heroS", med(r.map((x) => x.heroStart)), "heroE", med(r.map((x) => x.heroEnd)), "readyT", med(r.map((x)=>x.tl)), "fontsCSS", med(r.map((x) => x.fontsCssEnd)), "L2 all", r.every((x) => x.l2), "CLS max", Math.max(...r.map((x) => x.clsWin))); }
