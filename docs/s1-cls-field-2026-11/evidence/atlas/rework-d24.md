# Rework D24: one preload per ad, LCP element first (Atlas, 2026-11-09)

Branch `lane/atlas-2` from `origin/build/s1-cls-field` (93d9cfd). Decision: `03-decision-log.md` D24;
numbers behind it: `evidence/fable/preload-competition.md`.

## What changed

- `app/season1/landing.html`, head bootstrap only: after the phone-only slice, `imgs = imgs.slice(0,1)`
  for every case, so each ad writes at most one `rel="preload"`, with `fetchpriority="high"`. The
  shortlist hero still writes none. `HERO_IMG.d19` is now `["southie-back","team-walk-hd"]`; every
  other ad keeps its order. The HERO_IMG comment now reads "the ad's hero images, the LCP element
  first (measured on d19: img.jb, on d21: img.ph); only the first is preloaded, see D24".
- `lib/season1/__tests__/landingHead.test.ts`: check (a) is a set equality (same images, same count,
  any order) plus explicit assertions that `HERO_IMG.d19[0]` is southie-back and `HERO_IMG.d21[0]` is
  team-walk-hd (comment names D24 and the evidence file). Preload expectations are one entry per ad
  (d19, `?ad=D019`, d20, d21, d11 as briefed). New test: no ad, at 412 px or 1440 px, writes more
  than one preload link.
- One expectation outside the briefed list changed with the rule: desktop d8 (`?ad=d8` at 1440 px)
  was `[[couch, true], [laughing, false]]` and is now `[[couch, true]]`, because the slice applies
  to every case. The "X1" test's preload count for d19 went from 2 to 1 for the same reason.
- Body scripts, CSS, the fonts logic and `route.ts` are untouched.

Pixel output is unchanged by construction: the change only alters which image the head asks for
early (delivery order). The hero markup, the images the body scripts inject and the CSS are the
same bytes as 93d9cfd, so the pixel diff was not re-run. The probe below confirms both d19 images
are in the DOM and decoded after load.

## Diff

```diff
diff --git a/app/season1/landing.html b/app/season1/landing.html
index fe51d2e..0519dcb 100644
--- a/app/season1/landing.html
+++ b/app/season1/landing.html
@@ -6,14 +6,14 @@
 <script>
 // Season 01 head bootstrap (s1-cls-field Slice 2). One source for the ad tables the body scripts read (AD_HERO, HERO_KEYS, IMG), then, before any stylesheet, the chosen ad's hero image preloads and a stylesheet with only the font families that ad paints.
 // The other families load async as a safety net (not all of them: a second @font-face for a family already in use sends its text back to the fallback while it reloads). Any failure here writes the all-families stylesheet as a blocking stylesheet instead, which is the page as it was; <noscript> in the body does the same without JS.
-// HERO_IMG: every ad's hero images in template order (the full-bleed .ph first, so the largest first). FONTS: families beyond FONT_BASE, from T's font, the template CSS and the module CSS. lib/season1/__tests__/landingHead.test.ts checks both against D, T and the CSS.
+// HERO_IMG: the ad's hero images, the LCP element first (measured on d19: img.jb, on d21: img.ph); only the first is preloaded, see D24. FONTS: families beyond FONT_BASE, from T's font, the template CSS and the module CSS. lib/season1/__tests__/landingHead.test.ts checks both against D, T and the CSS.
 window.S1={
  AD_HERO:{d1:"amount",d2:"screentime",d3:"games",d4:"shortlist",d5:"shortlist",d6:"amount",d8:"games",d9:"shortlist",d10:["amount","games"]},
  HERO_KEYS:["amount","games","screentime","shortlist"],
  IMG:{"boys-girls-club": "/images/season1/landing/boys-girls-club.webp", "laughing": "/images/season1/landing/laughing.webp", "team-walk": "/images/season1/landing/team-walk.webp", "hands-in": "/images/season1/landing/hands-in.webp", "coach-and-mom": "/images/season1/landing/coach-and-mom.webp", "couch": "/images/season1/landing/couch.webp", "jersey-back": "/images/season1/landing/jersey-back.webp", "green-team": "/images/season1/landing/green-team.webp", "kid-couch": "/images/season1/landing/kid-couch.webp", "mc-blocks": "/images/season1/landing/mc-blocks.webp",
   // Round 4 jersey ads (d19 to d21): photos served as files, not inlined.
   "team-walk-hd": "/images/season1/jersey/team-walk-1600.webp", "southie-back": "/images/season1/jersey/southie-back.webp", "southie-front": "/images/season1/jersey/southie-front.webp"},
- HERO_IMG:{d1:["mc-blocks"],d2:["couch"],d3:["boys-girls-club"],d4:["coach-and-mom"],d5:["laughing"],d6:["couch"],d7:["hands-in"],d8:["couch","laughing"],d9:["team-walk"],d10:["kid-couch"],d11:["green-team","jersey-back"],d12:["coach-and-mom"],d13:["kid-couch"],d14:["couch"],d15:["team-walk"],d16:["hands-in"],d17:["team-walk"],d18:["laughing"],d19:["team-walk-hd","southie-back"],d20:["southie-front","southie-back"],d21:["team-walk-hd","southie-front"]},
+ HERO_IMG:{d1:["mc-blocks"],d2:["couch"],d3:["boys-girls-club"],d4:["coach-and-mom"],d5:["laughing"],d6:["couch"],d7:["hands-in"],d8:["couch","laughing"],d9:["team-walk"],d10:["kid-couch"],d11:["green-team","jersey-back"],d12:["coach-and-mom"],d13:["kid-couch"],d14:["couch"],d15:["team-walk"],d16:["hands-in"],d17:["team-walk"],d18:["laughing"],d19:["southie-back","team-walk-hd"],d20:["southie-front","southie-back"],d21:["team-walk-hd","southie-front"]},
  FAM:["Anybody:wdth,wght@50..150,900","Archivo:wght@400;600;700","Archivo+Black","Bricolage+Grotesque:opsz,wght@12..96,500;12..96,800","Dela+Gothic+One","Graduate","Hanken+Grotesk:wght@500;800","Inter+Tight:wght@500;700;800","JetBrains+Mono:wght@500;700","Rubik:wght@500;900","Rubik+Mono+One","Sora:wght@400;800","Space+Grotesk:wght@500;700","Syne:wght@600;800","Unbounded:wght@400;800"],
  FONT_BASE:["Inter Tight","JetBrains Mono"],
  FONTS:{d1:["Space Grotesk"],d2:["Archivo","Archivo Black"],d3:["Unbounded"],d4:["Bricolage Grotesque"],d5:[],d6:["Syne"],d7:["Anybody"],d8:["Dela Gothic One"],d9:["Rubik Mono One"],d10:["Sora"],d11:["Rubik"],d12:["Hanken Grotesk"],d13:["Sora"],d14:["Syne"],d15:["Hanken Grotesk"],d16:["Bricolage Grotesque"],d17:["Space Grotesk"],d18:[],d19:["Rubik"],d20:["Rubik"],d21:["Rubik"]}
@@ -30,6 +30,7 @@ window.S1={
     // Phones: an interactive hero hides #hero and repeats only its first image as .ih-bg; the shortlist hero shows no image. Desktop shows #hero as on page A.
     var imgs=H[id];
     if(hero && innerWidth<960) imgs = hero==="shortlist" ? [] : imgs.slice(0,1);
+    imgs = imgs.slice(0,1);
     var out="";
     imgs.forEach(function(u,i){ out+='<link rel="preload" as="image" href="'+u+'"'+(i?"":' fetchpriority="high"')+'>'; });
     var want=S.FONT_BASE.concat(S.FONTS[id]);
diff --git a/lib/season1/__tests__/landingHead.test.ts b/lib/season1/__tests__/landingHead.test.ts
index 602f21d..ecc7ca5 100644
--- a/lib/season1/__tests__/landingHead.test.ts
+++ b/lib/season1/__tests__/landingHead.test.ts
@@ -6,7 +6,7 @@ import vm from "node:vm";
 
 /**
  * s1-cls-field Slice 2: the landing page's head bootstrap holds the ad tables the body scripts read
- * (one source) and, per ad, preloads the hero images and requests only the fonts that ad paints.
+ * (one source) and, per ad, preloads the hero's LCP image and requests only the fonts that ad paints.
  * These tests derive the truth from the page itself (D, T, the CSS) and check the head tables.
  */
 const html = fs.readFileSync(path.join(process.cwd(), "app", "season1", "landing.html"), "utf8");
@@ -91,13 +91,19 @@ describe("landing head bootstrap: one source for the ad tables", () => {
     assert.deepEqual(Object.keys(S1.FONTS).sort(), ids);
   });
 
-  it("(a) every D entry's art images, in template order, equal HERO_IMG[id]", () => {
+  it("(a) every D entry's art images, as a set, equal HERO_IMG[id], LCP element first", () => {
     for (const d of D) {
       const srcs = [...(d.art("feed").matchAll(/<img\b[^>]*?\bsrc="([^"]+)"/g) as Iterable<RegExpMatchArray>)].map((m) => m[1]);
       assert.ok(srcs.length > 0, d.id);
-      assert.deepEqual(S1.HERO_IMG[d.id], srcs, d.id);
+      assert.equal(S1.HERO_IMG[d.id].length, srcs.length, d.id);
+      assert.deepEqual([...S1.HERO_IMG[d.id]].sort(), [...srcs].sort(), d.id);
       for (const s of srcs) assert.ok(fs.existsSync(path.join(process.cwd(), "public", s)), s);
     }
+    // D24: the first entry is the measured LCP element, the only image preloaded. d19's LCP is img.jb
+    // (southie-back), d21's is img.ph (team-walk-hd); evidence in
+    // docs/s1-cls-field-2026-11/evidence/fable/preload-competition.md.
+    assert.equal(S1.HERO_IMG.d19[0], S1.IMG["southie-back"]);
+    assert.equal(S1.HERO_IMG.d21[0], S1.IMG["team-walk-hd"]);
   });
 
   it("(b) every family an ad paints (T font, template CSS, module CSS, art) is in FONT_BASE + FONTS[id]", () => {
@@ -143,14 +149,26 @@ describe("landing head bootstrap: per-ad preloads and fonts", () => {
     "https://fonts.googleapis.com/css2?family=" + S1.FAM.filter((f) => fams.includes(famName(f))).join("&family=") + "&display=swap";
   const IMG = S1.IMG;
 
-  it("page A photo heroes preload their images, the first at high priority", () => {
+  it("page A photo heroes preload only their LCP image, at high priority (D24)", () => {
     let r = runBoot("?ad=d19&utm_source=fb");
-    assert.deepEqual(r.preloads, [[IMG["team-walk-hd"], true], [IMG["southie-back"], false]]);
+    assert.deepEqual(r.preloads, [[IMG["southie-back"], true]]);
     assert.equal(r.fonts, url(["Inter Tight", "JetBrains Mono", "Rubik"]));
     r = runBoot("?ad=d18");
     assert.deepEqual(r.preloads, [[IMG["laughing"], true]]);
     assert.equal(r.fonts, url(["Inter Tight", "JetBrains Mono"]));
-    assert.deepEqual(runBoot("?ad=D019").preloads[0], [IMG["team-walk-hd"], true]);
+    assert.deepEqual(runBoot("?ad=D019").preloads[0], [IMG["southie-back"], true]);
+    assert.deepEqual(runBoot("?ad=d20").preloads, [[IMG["southie-front"], true]]);
+    assert.deepEqual(runBoot("?ad=d21").preloads, [[IMG["team-walk-hd"], true]]);
+    assert.deepEqual(runBoot("?ad=d11").preloads, [[IMG["green-team"], true]]);
+  });
+
+  it("no ad's bootstrap output contains more than one preload link (D24)", () => {
+    for (const id of Object.keys(S1.HERO_IMG)) {
+      for (const w of [412, 1440]) {
+        const n = (runBoot(`?ad=${id}`, w).out.match(/rel="preload"/g) ?? []).length;
+        assert.ok(n <= 1, `${id} at ${w}px writes ${n} preloads`);
+      }
+    }
   });
 
   it("no ad or an unknown ad is d1 page A", () => {
@@ -170,7 +188,7 @@ describe("landing head bootstrap: per-ad preloads and fonts", () => {
     assert.deepEqual(runBoot("?ad=d18&hero=shortlist").preloads, []);
     assert.deepEqual(runBoot("?ad=d18&hero=games").preloads, [[IMG["laughing"], true]]);
     assert.deepEqual(runBoot("?ad=d2&hero=none").preloads, [[IMG["couch"], true]]);
-    assert.deepEqual(runBoot("?ad=d8", 1440).preloads, [[IMG["couch"], true], [IMG["laughing"], false]]);
+    assert.deepEqual(runBoot("?ad=d8", 1440).preloads, [[IMG["couch"], true]]);
     assert.deepEqual(runBoot("?ad=d4", 1440).preloads, [[IMG["coach-and-mom"], true]]);
   });
 
@@ -186,7 +204,7 @@ describe("landing head bootstrap: per-ad preloads and fonts", () => {
   it("preloads come before the fonts stylesheet, and only the chosen ad's images load (X1)", () => {
     const r = runBoot("?ad=d19");
     assert.ok(r.out.lastIndexOf("preload") < r.out.indexOf("s1-fonts"));
-    assert.equal((r.out.match(/rel="preload"/g) ?? []).length, 2);
+    assert.equal((r.out.match(/rel="preload"/g) ?? []).length, 1);
   });
 
   it("any failure writes the blocking all-families stylesheet, the page as it was (X17)", () => {
```

## Tests and types

- `STRIPE_SECRET_KEY="sk_test_placeholder_build_only" npm test`: unit suite 589 tests, 588 pass,
  1 skipped, 0 fail; harness suite 5 tests, 5 pass. Baseline at 93d9cfd (same command, stashed
  changes) was 588 tests, 587 pass, 1 skipped, so the one added test accounts for the difference.
- `./node_modules/.bin/tsc --noEmit`: clean, no output.
- Build: `npm run build` with `COMMIT_REF=b9ef6a3`; served marker `s1-build` = `b9ef6a3`.

## Probe (next start on port 3103, 412x915, fb-android UA, no throttling)

Analytics hosts routed to 204 and non-GET `/api/*` aborted (neither fired: the tags load nothing on
127.0.0.1 without `?s1qa=1`, and no form was submitted). Images listed are those inside `#hero` and
`#ihero` after load plus 1.5 s.
Every listed image had `complete` true and `naturalWidth` > 0 (nw).

Seen, not acted on: on d11 the measured LCP element is `img.jb` (jersey-back), while `HERO_IMG.d11`
lists green-team first, so d11 now preloads an image that is not its LCP element. D24 kept d11's
order without a measurement; this run is that measurement (one unthrottled run). Left for Fable.

| URL | Head preloads | s1-build | data-s1-ready | Hero images after load | LCP element | Console errors |
|---|---|---|---|---|---|---|
| `/season1?ad=d19` | 1: `southie-back.webp` fp=high | b9ef6a3 | 1 | `team-walk-1600.webp` .ph nw=1600; `southie-back.webp` .jb nw=846 | img.jb (`southie-back.webp`) | 0 |
| `/season1?ad=d21` | 1: `team-walk-1600.webp` fp=high | b9ef6a3 | 1 | `team-walk-1600.webp` .ph nw=1600; `southie-front.webp` .jb nw=799 | img.ph (`team-walk-1600.webp`) | 0 |
| `/season1?ad=d20` | 1: `southie-front.webp` fp=high | b9ef6a3 | 1 | `southie-front.webp` .f nw=799; `southie-back.webp` .b nw=846 | img.f (`southie-front.webp`) | 0 |
| `/season1?ad=d18` | 1: `laughing.webp` fp=high | b9ef6a3 | 1 | `laughing.webp` .ph nw=1100 | img.ph (`laughing.webp`) | 0 |
| `/season1` | 1: `mc-blocks.webp` fp=high | b9ef6a3 | 1 | `mc-blocks.webp` .ph nw=1100 | img.ph (`mc-blocks.webp`) | 0 |
| `/season1?ad=d2` | 1: `couch.webp` fp=high | b9ef6a3 | 1 | `couch.webp` .ih-bg nw=1400; `couch.webp` .ph nw=1400 | img.ih-bg (`couch.webp`) | 0 |
| `/season1?ad=d11` | 1: `green-team.webp` fp=high | b9ef6a3 | 1 | `green-team.webp` .ph nw=1207; `jersey-back.webp` .jb nw=880 | img.jb (`jersey-back.webp`) | 0 |

## Slow 4G, d19 (one run)

CDP `Network.emulateNetworkConditions` latency 150 ms, 1.6 Mbps down, 0.75 Mbps up; CPU 4x; cold
context; local `next start` over HTTP/1.1 (uncompressed HTML, the D25 artifact applies).

| Measure | This build (b9ef6a3) | Block 1 branch (2b9bc16) | Main (45dfe97) |
|---|---|---|---|
| Document responseEnd | 1608 | 2312 | 1074 |
| southie-back start to end | 277 to 1788 | 225 to 2365 | 1317 to 2964 |
| team-walk-1600 start to end | 1796 to 2831 | 222 to 2627 | 1317 to 3226 |
| LCP | 1956 (img.jb, southie-back) | 2536 | 3004 |
| s1Ready | 1781 | 2489 | 1338 (hero injected) |

In one line: against the block 1 branch, southie-back ends 577 ms earlier (1788 vs 2365),
LCP is 580 ms earlier (1956 vs 2536) and ready is
708 ms earlier (1781 vs 2489).

Notes on this run: team-walk-1600 now starts when the hero is injected (1796 ms) and ends at
2831 ms, later than the block 1 branch (2627) and the estimate in preload-competition.md (about
2.5 s), still earlier than main (3226). The document still ends about 534 ms
later than main, the cost of the 93 KB southie-back sharing the link with the uncompressed HTML.
One run only; Sentry's harness run is the gate.
