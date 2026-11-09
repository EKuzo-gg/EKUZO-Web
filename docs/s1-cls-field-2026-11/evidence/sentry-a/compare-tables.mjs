// node compare-tables.mjs <main table.md> <branch table.md>  -> markdown comparison per cell
import fs from "fs";
const parse = (f) => {
  const secs = {}; let cur = null;
  for (const line of fs.readFileSync(f, "utf8").split("\n")) {
    if (line.startsWith("## ")) { cur = line.slice(3).trim(); secs[cur] = []; continue; }
    if (cur && line.startsWith("|") && !/^\|[-| ]+\|$/.test(line)) { const c = line.split("|").slice(1, -1).map((s) => s.trim()); secs[cur].push(c); }
  }
  const out = {};
  for (const [k, rows] of Object.entries(secs)) { const h = rows[0]; out[k] = {}; for (const r of rows.slice(1)) out[k][r[0] + " " + r[1]] = Object.fromEntries(h.map((x, i) => [x, r[i]])); }
  return out;
};
const [mf, bf] = process.argv.slice(2);
const M = parse(mf), B = parse(bf);
const n = (s) => parseFloat(String(s));
console.log("| Cell | Ad | CLS med main / branch | CLS max main / branch | LCP med main / branch (delta, need) | LCP max main / branch | first paint med main / branch (delta) | FCP main / branch | hero img start main / branch | fonts CSS end main / branch | first long task main / branch |");
console.log("|---|---|---|---|---|---|---|---|---|---|---|");
for (const key of Object.keys(B.Stability || {})) {
  const bs = B.Stability[key], bl = B.Loading[key], ms = (M.Stability || {})[key], ml = (M.Loading || {})[key];
  if (!ms) { console.log(`| ${key} | (no main cell) |`); continue; }
  const dl = n(bl["LCP med"]) - n(ml["LCP med"]), need = Math.max(150, 0.1 * n(ml["LCP med"]));
  const dp = n(bl["first paint"]) - n(ml["first paint"]);
  const [c, a] = key.split(" ");
  console.log(`| ${c} | ${a} | ${ms["CLS win med"]} / ${bs["CLS win med"]} | ${ms["CLS win max"]} / ${bs["CLS win max"]} | ${ml["LCP med"]} / ${bl["LCP med"]} (${dl >= 0 ? "+" : ""}${dl}; need -${Math.round(need)}) | ${ml["LCP max"]} / ${bl["LCP max"]} | ${ml["first paint"]} / ${bl["first paint"]} (${dp >= 0 ? "+" : ""}${dp}) | ${ml.FCP} / ${bl.FCP} | ${ml["hero img start"]} / ${bl["hero img start"]} | ${ml["fonts CSS end"]} / ${bl["fonts CSS end"]} | ${ml["first long task start / dur"]} / ${bl["first long task start / dur"]} |`);
}
console.log("\n| Cell | Ad | marker | s1Ready | s1-pre | S2 | U-6 | form usable | page errors | POSTs | analytics / leaks | LCP element (branch) | top source (branch) |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|");
for (const key of Object.keys(B.Checks || {})) {
  const c = B.Checks[key]; const [cell, ad] = key.split(" ");
  console.log(`| ${cell} | ${ad} | ${c.marker} | ${c.s1Ready} | ${c["s1-pre"]} | ${c["S2 offenders"]} | ${c["U-6 offenders"]} | ${c["form usable"]} | ${c["page errors"]} | ${c.POSTs} | ${c["analytics attempts"]} / ${c.leaks} | ${B.Loading[key]["LCP element"]} | ${B.Stability[key]["top source"]} |`);
}
