// N4 (R-PROT hash rule, practical form): strip the spec-listed edits from the branch landing.html and compare with main's text outside the head bootstrap.
import fs from "fs";
const [mainF, brF] = process.argv.slice(2);
const m = fs.readFileSync(mainF, "utf8"), b = fs.readFileSync(brF, "utf8");
const ml = m.split("\n"), bl = b.split("\n");
// 1. IMG / AD_HERO / HERO_KEYS values: main literal vs branch window.S1 literal
const grab = (s, re) => { const x = re.exec(s); return x && x[1]; };
const mImg = grab(m, /const IMG = (\{[^\n]*\});/), bImg = grab(b, /IMG:(\{[\s\S]*?\}),\n HERO_IMG/);
const clean = (s) => s.replace(/\/\/[^\n]*\n/g, "").replace(/\s+/g, "");
const imgMain = clean(mImg + `"team-walk-hd":"/images/season1/jersey/team-walk-1600.webp","southie-back":"/images/season1/jersey/southie-back.webp","southie-front":"/images/season1/jersey/southie-front.webp"`).replace(/\}"team/, ',"team');
console.log("IMG paths equal (set compare):", (() => { const f = (s) => [...s.matchAll(/"([\w-]+)":\s*"([^"]+)"/g)].map((x) => x[1] + "=" + x[2]).sort().join("|"); return f(mImg + ',"team-walk-hd":"/images/season1/jersey/team-walk-1600.webp","southie-back":"/images/season1/jersey/southie-back.webp","southie-front":"/images/season1/jersey/southie-front.webp"') === f(bImg); })());
console.log("AD_HERO equal:", grab(m, /const AD_HERO=(\{[^;]*\});/) === grab(b, /AD_HERO:(\{[^\n]*\}),\n HERO_KEYS/));
// 2. everything else: delete head bootstrap region and listed attribute/edit lines, then compare line by line
const strip = (t) => t
  .replace(/ data-clarity-mask="true"/g, "").replace(/ loading="lazy"/g, "")
  .replace(/min-height:80vh;min-height:80svh/g, "min-height:80svh");
const bStripped = strip(b);
// remove head additions (from first <style>html{background through the bootstrap </script>) and the noscript swap
const hs = bStripped.indexOf("<style>html{background:#0B0A0D}</style>"), he = bStripped.indexOf("</script>", bStripped.indexOf("window.S1=")) + 9;
let bRest = bStripped.slice(0, hs) + bStripped.slice(he);
bRest = bRest.replace(/<meta name="s1-build"[^>]*>\n?/, "");
const mRest = strip(m);
const A = mRest.split("\n"), B = bRest.split("\n");
const setB = new Map(); B.forEach((l) => setB.set(l, (setB.get(l) || 0) + 1));
const onlyMain = A.filter((l) => { const c = setB.get(l); if (c) { setB.set(l, c - 1); return false; } return true; });
const setA = new Map(); A.forEach((l) => setA.set(l, (setA.get(l) || 0) + 1));
const onlyBranch = B.filter((l) => { const c = setA.get(l); if (c) { setA.set(l, c - 1); return false; } return true; });
console.log("lines only in main:", onlyMain.length, "only in branch:", onlyBranch.length);
onlyMain.forEach((l) => console.log("- " + l.slice(0, 200)));
onlyBranch.forEach((l) => console.log("+ " + l.slice(0, 200)));
