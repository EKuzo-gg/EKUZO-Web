# Interactive-hero CLS on phones (Scout, round 2)

Setup: copy of wt-build at /tmp/claude-0/scout-build, `next build` + `next start`, 375x667 DPR 2 mobile UA (Instagram), CPU 4x, 1.6 Mbps / 150 ms, analytics hosts blocked from the first request (0 hits reached the network). One cold run per URL. Script: measure-ihero.mjs. Raw data: shots/raw.json (every layout-shift entry, sources, rects, plus a 100 ms timeline of #hero/#ihero/#join-top heights). Screenshots at 1 s, 3 s, 6 s: shots/ (current code) and shots-proto/ (prototype). Rects are [x,y,w,h] in CSS px.

## Result per URL (current code, matches your numbers)

| URL | CLS | Shifts |
|---|---|---|
| ?ad=d2 (screentime) | 0.386 | 7.49 s 0.3215 section.how; 7.84 s 0.0333 and 7.99 s 0.0312 (ih-opts, #bridge, h1#ih-q, ih-skip, ih-sub) |
| ?ad=d4 (shortlist) | 0.177 | 7.38 s 0.1763 section.how; 8.0 s 0.0006 text |
| ?ad=d1 (amount) | 0.3215 | 7.37 s 0.3215 section.how |
| ?ad=d3 (games) | 0.169 | 7.40 s 0.1694 section.how |
| ?ad=d19&hero=games | 0.161 | 7.42 s 0.1610 section.how |

The big shift is the same in all five: section.how goes from [8,443,359,224] to off-screen (cur rect 0,0,0,0 means it left the viewport). Size differs by how far it was in view (d1 amount and d2 are larger because the pre-script layout is identical but the hero variant text/height decides how much of .how was still on screen and, for d1/d2, a larger visible area).

## Root cause in plain words

1. Page is 1.35 MB of HTML. Nearly all of it is one inline `<script>` full of base64 images (`const IMG = {...}`), and the code that builds the hero is at the end of it. Under the throttle the script does not run until about 7.4 s. (The `fonts` are loaded by 1.7 s; it is not a font problem.)
2. Until then the page paints in the "no hero yet" state (see shots/d1-1s.png, d1-6s.png, identical): `#hero` is empty (0 px), `#ihero` is `hidden` (0 px), and the sign-up form `#join-top` sits at the top, 371 px tall, with the bridge and "How a season works" below it.
3. When the script reaches `if(HD){...}` it un-hides `#ihero` (80svh = 534 px), adds `has-ihero` (hides `#hero`), and MOVES `#join-top` into `.ih-slot` inside the hero. In one frame the form leaves the top, a 534 px hero appears above everything, and the bridge/how sections that were at y 379/443 jump to y 542+. That is the 0.16 to 0.32.
4. Today's fix (`#hero.pa:empty{aspect-ratio:4/5}`) only reserves space for page A (the small script sets class `pa` only when no hero applies). Interactive-hero pages never get a reserved box, so they were never covered.
5. d2 only: extra 0.064. The d2 display font is requested only once the hero markup exists, so it arrives at about 7.7 s. h1 re-wraps (73 -> 101 px) and the hero grows 534 -> 562, then `fitHero` (re-run on fonts.ready) shrinks the type back (101 -> 59 px, hero back to 534). The bridge moves 28 px down and up again (two shifts, 0.033 + 0.031).

Note: `.ihero[hidden]` loses to the global `[hidden]{display:none !important}` at landing.html line 773, so you cannot reserve space by styling `#ihero[hidden]` (I tried; it stays display:none). Reserve on `#hero` instead.

## Fix option A (smallest, CSS plus 1 line, verified in a prototype)

Changes (prototype.diff, about 6 lines):
- Small script after #hero: for hero pages (valid `?hero=` or an AD_HERO entry whose value is a string) add class `pre-ih` to `#lp`. Mirror of the `pa` logic, same file, same function.
- CSS inside the existing `@media (max-width:959px)` block:
  - `.lp.pre-ih:not(.has-ihero) > #hero{min-height:80svh}` (reserves exactly the box #ihero will occupy: `.ihero{min-height:80svh}`)
  - `.lp.pre-ih:not(.has-ihero) > #hero ~ *{display:none}` (nothing below the hero is painted until the script runs, so there is nothing to push down, and the form does not appear at the top and then jump into the hero).
- Big script, `fitHero` line: hide `#ihero` (visibility:hidden, so it is exempt from CLS) until `document.fonts.ready` and `fitHero` have run, with a 1.5 s timeout fallback. Removes the d2 font-swap shifts.

Measured with prototype (same harness, same throttle):

| URL | before | after |
|---|---|---|
| d2 | 0.386 | 0.016 (bridge 125 <-> 97 px as the hero height flickers 534/562 while the font loads) |
| d4 | 0.177 | 0 (0.0006 text node at 8 s on the run before the visibility change) |
| d1 | 0.3215 | 0 |
| d3 | 0.169 | 0 |
| d19&hero=games | 0.161 | 0 |

Desktop and page A unchanged: all new CSS sits in the max-width:959px block; `pre-ih` is never set for page A (it is the `else` branch of the `pa` check), and `:not(.has-ihero)` makes the rules inert once the script has run. Desktop (>=960) never matches the media query.

Risks:
- UX trade-off: for about 7 s on a throttled phone (less on a normal connection) the user sees a blank dark screen with the logo instead of the early sign-up form (shots-proto/d1-3s.png). CLS is fixed but time-to-useful is not improved, and a bounce in that window is a bounce either way (today the form is visible and tappable, but it moves under the finger at 7 s, which is a worse failure for taps). If the script never runs, the join form stays hidden (today it would be visible). Mitigate with option B.
- Join form moved into `.ih-slot`: unaffected. It is only display:none before the script (same node, same listeners, same ids); the script then moves it as today. `scroll-margin`, `em-top` focus and the skip handler are untouched.
- Hero text height varying by hero: the reserved box is a min-height of 80svh, the same value `.ihero` uses, and `fitHero` already shrinks type until the hero fits 80svh+1px, so all five URLs end at 534 px on a 667 px phone. A hero whose content cannot be shrunk below 80svh (the `.tight` class case, very large Android text size) would still grow after reveal by the overflow only; that is below the fold and bounded by the 0.5 shrink floor.
- d10 random split: `AD_HERO.d10` is an array, so option A does not set `pre-ih` for d10 and d10 stays at about 0.3 (page A's 4:5 box is not set either, since the ad is in AD_HERO). To cover it, move the split choice (the localStorage read plus Math.random) into the small script, store it in a variable the big script reads, so there is one draw and the two scripts agree. Both heroes end at 80svh, so the reserved box is the same for B and C. Risk is the two scripts drifting; keep the `HERO_KEYS` drift warning pattern.
- `#hero ~ *{display:none}` also hides anything else that is a later sibling in `.lp` (sticky bar, footer) until the script runs; harmless, they are off-screen.
- The 0.016 on d2 remains. Remove it by giving `.ihero` a fixed `height:80svh` on phones (it is overflow:hidden); not done in the prototype because a fixed height can clip the `.tight` overflow case.

## Fix option B (root cause, bigger, helps every page including page A)

Stop making the hero wait for 1.3 MB: move the base64 `IMG` entries out of the inline script into files under public/images/season1/ (the jersey ads d19 to d21 already do this: `IMG["team-walk-hd"]="/images/season1/jersey/..."`), or split the script so the small part that builds the hero runs before the images. The script then runs at about 1 s instead of 7 s and the pre-script state lasts a fraction of a second. Combine with A so that the remaining window shows a reserved box and not a jump.

Changes: landing.html (images become `<img src>` URLs; they load on demand, so first paint of hero images needs a request each; add `fetchpriority`/preload for the first hero), plus cache headers. Page A and desktop keep the same markup; only image URLs change.
Risks: an extra request per hero image in in-app browsers (the inline choice may have been made to avoid it), a visible image pop-in (reserve with the existing aspect-ratio/`min-height`), and broader regression surface (all 20+ ads). Needs a visual pass on every ad. I did not prototype B.

## Recommendation

Ship A now (CSS plus a 1-line small-script change plus the font wait). Plan B as a separate round because it also fixes the 7 s blank. Open items for A: d10 split move, optional fixed height for the 0.016.

## Housekeeping

Prototype lives only in /tmp/claude-0/scout-build (repo untouched). Servers on ports 3140 to 3143 were started with `next start`; the recorded pids in .server*.pid are the npx wrappers, so a node `next-server` child may linger on those ports. I did not pkill; one such child was killed by pid earlier (881).
