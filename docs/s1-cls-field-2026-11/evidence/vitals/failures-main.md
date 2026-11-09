# Failure profiles on main (OR3, U-1)

Chronos, 2026-11-09. Baseline facts for Atlas and Sentry: how origin/main `45dfe97` (local build,
port 3101) behaves when a dependency fails. `fb-android-412`, `slow4g`, CPU 4x, full H3 journey,
analytics blocked. N=3 per cell, N=2 for the 20 s font stall. Generated tables: `failures-main/table.md`;
commands and hashes: `failures-main/manifest.json`. The sentinels (OR2) do not exist on main yet,
so every cell reads "absent / absent".

"Form usable" is the harness form check: tap the bottom email field, type `a`, tap its button; a
working handler shows "Check the email address and try again." and sends nothing. No run attempted
a POST (0 in `failures-main/blocked.json`). "Body font" is the first family in the computed
`font-family` of `body`, which names the declared family, so with fonts blocked the text paints in
the fallback face while this column still says Inter Tight.

| Failure | Ad | N | visible result at the end (hero state; body font) | FCP med | LCP med | CLS win med | CLS win max | +input max | form usable | page errors (first) | s1Ready / s1-pre |
|---|---|---|---|---|---|---|---|---|---|---|---|
| fonts-blocked | d18 | 3 | hero 495px; Inter Tight | 616 | 1348 | 0.0001 | 0.0001 | 0.0066 | 3/3 | 0 | absent / absent |
| fonts-blocked | d19 | 3 | hero 495px; Inter Tight | 640 | 2148 | 0.0014 | 0.0014 | 0.0066 | 3/3 | 0 | absent / absent |
| fonts-blocked | d2 | 3 | ihero 882px; Inter Tight | 604 | 1556 | 0.0000 | 0.0001 | 0.1195 | 3/3 | 0 | absent / absent |
| fonts-blocked | noad | 3 | hero 495px; Inter Tight | 612 | 1936 | 0.0000 | 0.0000 | 0.0066 | 3/3 | 0 | absent / absent |
| fonts-slow-8s | d18 | 3 | hero 495px; Inter Tight | 8956 | 9428 | 0.0035 | 0.0035 | 0.0066 | 3/3 | 0 | absent / absent |
| fonts-slow-8s | d19 | 3 | hero 495px; Inter Tight | 8984 | 10232 | 0.0014 | 0.0014 | 0.0066 | 3/3 | 0 | absent / absent |
| fonts-slow-8s | d2 | 3 | ihero 882px; Inter Tight | 8924 | 9624 | 0.0004 | 0.0004 | 0.1195 | 3/3 | 0 | absent / absent |
| fonts-slow-8s | noad | 3 | hero 495px; Inter Tight | 8976 | 10000 | 0.0003 | 0.0003 | 0.0066 | 3/3 | 0 | absent / absent |
| fonts-slow | d18 | 2 | hero 495px; Inter Tight | 21050 | 21504 | 0.0035 | 0.0035 | 0.0066 | 2/2 | 0 | absent / absent |
| fonts-slow | d19 | 2 | hero 495px; Inter Tight | 20994 | 22244 | 0.0014 | 0.0014 | 0.0066 | 2/2 | 0 | absent / absent |
| fonts-slow | d2 | 2 | ihero 882px; Inter Tight | 21046 | 21654 | 0.0004 | 0.0004 | 0.1195 | 2/2 | 0 | absent / absent |
| fonts-slow | noad | 2 | hero 495px; Inter Tight | 21070 | 22172 | 0.0003 | 0.0003 | 0.0066 | 2/2 | 0 | absent / absent |
| hero-404 | d18 | 3 | hero 495px; Inter Tight | 1228 | 1228 | 0.0035 | 0.0035 | 0.0066 | 3/3 | 0 | absent / absent |
| hero-404 | d19 | 3 | hero 495px; Inter Tight | 1216 | 1216 | 0.0015 | 0.0015 | 0.0066 | 3/3 | 0 | absent / absent |
| hero-404 | d2 | 3 | ihero 882px; Inter Tight | 1196 | 1364 | 0.0004 | 0.0004 | 0.1195 | 3/3 | 0 | absent / absent |
| hero-404 | noad | 3 | hero 495px; Inter Tight | 1244 | 1336 | 0.0003 | 0.0003 | 0.0066 | 3/3 | 0 | absent / absent |
| small-script-throws | d18 | 3 | hero 495px; Inter Tight | 876 | 1644 | 0.3609 | 0.7072 | 0.7072 | 3/3 | 0 | absent / absent |
| small-script-throws | d19 | 3 | hero 495px; Inter Tight | 824 | 2612 | 0.6394 | 0.6395 | 0.6395 | 3/3 | 0 | absent / absent |
| small-script-throws | d2 | 3 | ihero 882px; Inter Tight | 836 | 2092 | 0.4962 | 0.4962 | 0.4962 | 3/3 | 0 | absent / absent |
| small-script-throws | noad | 3 | hero 495px; Inter Tight | 928 | 2364 | 0.8858 | 0.8859 | 0.8859 | 3/3 | 0 | absent / absent |
| big-script-fails | d18 | 3 | hero empty 495px; Inter Tight | 844 | 844 | 0.0001 | 0.0001 | 0.0066 | 0/3 | 1 (Unexpected token ')') | absent / absent |
| big-script-fails | d19 | 3 | hero empty 495px; Inter Tight | 836 | 836 | 0.0001 | 0.0001 | 0.0066 | 0/3 | 1 (Unexpected token ')') | absent / absent |
| big-script-fails | d2 | 3 | hero empty 732px; Inter Tight | 852 | 852 | 0.0000 | 0.0000 | 0.1195 | 0/3 | 1 (Unexpected token ')') | absent / absent |
| big-script-fails | noad | 3 | hero empty 495px; Inter Tight | 840 | 840 | 0.0001 | 0.0001 | 0.0066 | 0/3 | 1 (Unexpected token ')') | absent / absent |

Runs at or above 0.25 windowed CLS: `small-script-throws` 2 of 3 in every cell (d18, d19, d2,
noad); every other profile 0.

## Reading, ranked by effect on sign-ups

1. **A slow fonts host blanks the whole page for the length of the stall.** With
   `fonts.googleapis.com` and `fonts.gstatic.com` held 8 s, FCP moves from about 1.0 to 1.2 s
   (main-baseline) to 8.9 to 9.0 s on all four ads; held 20 s, FCP is about 21 s. Nothing paints and
   no handler attaches before the stylesheet arrives, because the all-families stylesheet blocks
   rendering and every script after it. CLS stays low and the form works once the page shows. This
   is the users lens U-1 case measured, and the reason for the frozen spec's Slice 2 items 1 and 2.
2. **The small script failing at runtime brings the original W4 jump back.** A throw inside its
   `try` block is caught, so there is no page error, but `#hero` never gets `pa` (or `#lp` never
   gets `pre-ih`), nothing reserves the box, and the join section drops when the big script fills
   the hero: windowed CLS up to 0.71 (d18), 0.64 (d19), 0.50 (d2), 0.89 (noad), sources
   `section#join-top.join` and `section.how`. The form still works. The one low run per cell is a
   timing race: in this profile the harness hands the browser the rewritten HTML unthrottled, so
   the hero sometimes renders before the first paint. Atlas's head bootstrap must keep the
   `try/catch` fallback that still sets `pa` / `pre-ih` (X17), and this profile should be run on
   the branch to prove it.
3. **The big script failing kills both forms with no message.** One page error ("Unexpected token
   ')'", the Clarity-visible kind), the hero stays an empty reserved box (495 px on page A, 732 px
   on d2 from the `pre-ih` 80svh rule), and the form check fails 0 of 3 on every ad: the submit does
   nothing and shows nothing. CLS stays near 0 because the reserved box never fills. OR1 (compile
   test) and OR2 (sentinel) exist for this case.
4. **Fonts blocked outright is harmless.** The browser fails the stylesheet fast, FCP is earlier
   than baseline (about 0.6 s), text paints in the fallback face, CLS stays at or under 0.0014 and
   the form works on every ad.
5. **Hero image 404 is harmless.** No shift (the hero box is reserved), the form works, LCP falls
   back to a text block (`p`) at about 1.2 s.

The d2 "+input" value of 0.1195 appears in every d2 cell including the baseline: it is the hero
answer tap growing the interactive hero, flagged `hadRecentInput`, so it does not count toward CLS.
