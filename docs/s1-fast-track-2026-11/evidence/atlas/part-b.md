# Atlas self-test: Part B (B1 to B3), 2026-11-10

Lane `lane/ft-atlas-b` from 5ef3b0c. Code commits 61865c4 (the port, `app/season1/landing.html`),
d84a498 (tests, `lib/season1/__tests__/landingCopy.test.ts`) and 9c18894 (the header mini button, a hunk
my first pass filed as "byte-level only"; an audit of every `+` line in the diff caught it); this file
and `part-b/` are the evidence commit on top. Build tested: 9c18894 (`<meta name="s1-build"
content="9c18894">` on the served landing). Everything below was re-run on 9c18894.
Main for comparison: `/home/claude/wt-main` at 3bf6c58, already built, served as it stood.

## Method

Three-way read per hunk of `aaron/v2-vs-1105.diff`: the Nov 5 line (`-`), Aaron's line (`+`), and the
current live line in `app/season1/landing.html`. A hunk is ported only when his line is a change of
copy or markup he made on top of Nov 5; a hunk where his side is the older state of something changed
since Nov 5 (or never existed in his base) is skipped. The port was done with a script that copies his
lines out of `aaron/landing-v2.html` byte for byte (so `&nbsp;`, `’` and `→` are his), then swaps
`data-ready` for `data-join`. The only text not copied from his file is the five hero button labels in
row 15, which his file does not change (see "For Fable" 1).

## Port table

Ported 17, skipped 20. Audit: every `+` line of the diff is either in the live file now (ported, with `data-ready` read as `data-join`) or in the skipped list.

| # | Hunk | Live line (before) | His line | Ported |
|---|---|---|---|---|
| 1 | CSS after the Text Karlin comment | (none) | `.ready`, `.ready span`, `.ready-note`, `.lock`, `.conf .lock h3`, `.conf .lock p`, `.lock .lock-j`, `.lock-btn` | the 8 rules verbatim, same place: after the Text Karlin comment, before `.tk` |
| 2 | Top form `h2#jt` | `Save their spot for season&nbsp;one.` | `Get the season one&nbsp;details.` | his |
| 3 | Top form `p` | `Join the list and you’ll hear first …` | `Karlin sends you the schedule, the price and the coaches. Free, and it doesn’t sign them up for&nbsp;anything.` | his |
| 4 | Top submit label | `Save their spot` | `Send me the details` | his |
| 5 | Top ready link and note | (none) | `<a class="ready" href="/season1/join?src=ad" data-ready="top">…</a><p class="ready-note">…</p>` after `</form>` | his markup with `data-join="top"` for `data-ready`; static href kept as the no-JS fallback |
| 6 | FAQ "When does it start?" | `Season 01 starts in January 2027. Everyone on the list hears first …` | `Season 01 starts in mid January 2027. Sign-ups are open&nbsp;now.` | his |
| 7 | FAQ "Do I pay anything now?" | `This is a free interest list. …` | `Not for the details. If you’re ready to save a spot, it’s $100 for January and fully refundable until Dec&nbsp;31.` | his |
| 8 | Bottom form `h2#je` | `Get them on the&nbsp;list.` | `Still thinking it&nbsp;over?` | his |
| 9 | Bottom form `p` | `Spots for season one are limited. …` | `Get the details from Karlin and decide when you’re&nbsp;ready.` | his |
| 10 | Bottom submit label, ready link and note | `Save their spot`; (none) | `Send me the details`; link `data-ready="bottom"` and note | his, link as `data-join="bottom"` |
| 11 | Sticky bar | `Save their spot` | `Get the details` | his |
| 12 | Confirmation kick | `You’re on the list` | `Details on the way` | his |
| 13 | Lock card | (none) | `<div class="lock">…<a class="lock-btn" … data-ready="confirm">Save their spot · $100</a></div>` before `#tk` | his, `data-join="confirm"` |
| 14 | Text Karlin `h3` | `Chat with our founder` | `Questions first?` | his. The Nov 5 base reads `Chat with our founder` too, so this is his change, not an older base |
| 15 | Hero buttons d6, d9, d11, d13, d14 | `<span class="cta">Save their spot →</span>` | unchanged in his file (still `Save their spot →`) | `Get the details →`, per brief B2 and his message; arrow kept (see "For Fable" 1) |
| 16 | Big script: `CTA` default, both `.ih-list` templates, the two `listLine` lines, the skip heading | `Save their spot`; `Join the Season&nbsp;01 list.` (4 places); `Save their spot.` | `Send me the details`; `Get the Season&nbsp;01&nbsp;details.` (4); `Get the details.` | his |
| 17 | Header mini button (`.mini-cta`, hidden on phones until the header turns solid) | `Join the list` | `Get the details` | his (9c18894) |

Skipped (his side is the older base or something Part A or yesterday replaced):

| # | Hunk | Why skipped |
|---|---|---|
| S1 | Head: inline Meta Pixel, Clarity and GA4 in place of `{{TAGS}}` | older base; `{{TAGS}}` (host gating, QA mode) stays |
| S2 | Head: blocking Google Fonts stylesheet and preconnects | yesterday's head bootstrap (`window.S1`, per-ad fonts, preload) stays |
| S3 | CSS: round-4 `.s1j` block missing | his base predates round 4; stays |
| S4 | CSS: W4 `.pa:empty` and `.pre-ih` reservation (`80vh`/`80svh`) missing | stays |
| S5 | Page A marker script after `#hero` missing | stays (`data-s1-pre` sentinel too) |
| S6 | `const IMG` as base64 data URIs | stays `window.S1.IMG` (files) |
| S7 | D entries d19, d20, d21 missing | stay |
| S8 | `T.d15`, `T.d16` with a counselor `mod` note | removed on purpose in 3433a5b ("remove counselor note from d15 and d16 heroes"); his base predates it |
| S9 | `T[d19..d21]=T.d11` mapping missing | stays |
| S10 | `heroCls` without `d.cls` | `d.cls` is what applies `.s1j`; stays |
| S11 | `AD_HERO` redefined in the big script | defined once in the head bootstrap; stays |
| S12 | `HERO_KEYS` drift check missing | stays |
| S13 | `LIVE` regex adds `netlify\.app` | analytics C12: test deploys send no Lead; stays |
| S14 | per-email `eventId` and `inflight` guard missing | stays |
| S15 | 429 handling and `repeat`/`quiet` Lead suppression missing | stays |
| S16 | `ekuzo_s1_joined` localStorage write missing | stays |
| S17 | `eventId` missing on the games and text-karlin posts | stays |
| S18 | Trailing `[data-ready]` script (href rewrite plus GA `s1_join_click`) | replaced by Part A's `window.S1.joinHref` and the delegated `[data-join]` handler (adds Clarity, `hero`, `utm_id`, normalised `ad`) |
| S19 | `data-clarity-mask` on inputs and `#tk`, `loading="lazy"` on the avatar | not in his diff against Nov 5 (absent in his base); live stays |
| S20 | `AbortSignal.timeout` on the post, `fitHero` font listeners, `s1Ready` sentinel | same as S19 |

Ambiguous hunks kept as live: none beyond row 15's arrow.

## Tests and types

| Run | Result | Source |
|---|---|---|
| Before (5ef3b0c) | 607 tests; field-vitals 5 of 5 | brief |
| After (9c18894) | 618 tests, 617 pass, 1 skipped, 0 fail; field-vitals 5 of 5 | `STRIPE_SECRET_KEY="sk_test_placeholder_build_only" npm test` |
| `tsc --noEmit` | clean | |

The 11 new tests (`landingCopy.test.ts`): exactly three `data-join` elements in order top, bottom,
confirm; each with the static href `/season1/join?src=ad`; the two form links read `Ready now?
<span>Save their spot for&nbsp;$100&nbsp;→</span>` and the confirm link `Save their spot · $100`; each
form link sits right after its `</form>` with its note, inside `form-wrap`; the lock card is in `#conf`
before `#tk`, with the new kick and `Questions first?`; no `data-ready` anywhere; the old labels ("Save
their spot for season one.", "Get them on the list.", "Join the Season 01 list.", "You’re on the list",
"Chat with our founder") are gone; two `Send me the details` buttons, the `CTA` default and the sticky
label; hero buttons d6, d9, d11, d13, d14 read `Get the details →` while d19 to d21 keep `Save their
spot →`; the header mini button reads `Get the details`; exactly three `Save their spot →` hero buttons remain.

## Build and servers

`COMMIT_REF=9c18894 STRIPE_SECRET_KEY=… npm run build`: exit 0. Branch on 3103 (`next start`, PID
15845); main 3bf6c58 on 3101 from `/home/claude/wt-main` (PID 15847, its `next-server` child 15848).

## Screenshots, main vs branch, 412x915 at DPR 2.625

Script `part-b/ft-b-pixel.mjs`, comparison `part-b/ft-b-compare.mjs`. Analytics hosts stubbed to 204 by
host regex, POST `/api/season-one` fulfilled locally, reduced motion, animations frozen,
`Math.random` 0.25. States: **first** (fonts.gstatic.com aborted, so the fallback faces of the first
paint, settled), **fit** (fonts loaded, `document.fonts.ready`, two frames after, so `fitHero` has run on
`loadingdone`), **conf** (an email submitted from the visible form, `#conf` open). Shots are per section
(the children of `#lp`, plus `#sticky`; the children of `.conf-in` for conf) so one taller section does
not mask the rest. Downscaled copies of the viewport and confirmation shots are in `part-b/shots/`
(md5s in `shots/_pixel.json` are of the full-size originals).

Two passes. **Plain** (`shots/_pixel.json`, `shots/_compare.json`): the ready link and note add 59 CSS px
to each form section (`#join-top` 371 to 430, `#join-end` 338 to 397 on d18), which is 154.875 device px
at 2.625, so every section below an addition re-rasterises at a fractional offset and its md5 changes
while it looks the same (checked by eye on d19 `#bridge` and d18 `footer`). **Masked**
(`mask/_pixel.json`, `mask/_compare.json`): the same run with `.ready, .ready-note, .lock` hidden on the
branch only, so positions match and any remaining difference is copy. The table is the masked pass.

| Ad | Same in all three states | Differ (masked) | Explained by |
|---|---|---|---|
| d18 | `#hero`, `#bridge`, `.how`, `.faq`, `footer`, `#sticky` | `#join-top`, `#join-end`; conf | form copy (h2, p, button); conf below |
| d19 | `#hero`, `#bridge`, `.how`, `.faq`, `#sticky` | `#join-top`, `#join-end` (302 to 332 px: "Still thinking it over?" wraps to two lines), `footer` (moved 30 px by that, sub-pixel re-raster); conf | form copy |
| d2 | `#ihero` (holds `#join-top` in its closed slot), `#bridge`, `#mod`, viewport | `#join-end`; `.how` and `.faq` crops; conf | form copy; the crops include the fixed sticky bar, whose label changed (crop `mask/crop-d2-fit-how-sticky-main-over-branch.png`: "Save their spot" over "Send me the details") |
| d6 | `#ihero`, `#bridge`, `.how`, `#sticky`, viewport | `#join-end`; `.faq` crop (fit); conf | form copy; sticky bar in the crop |
| d9 | `#ihero`, `#bridge`, `.how`, `#sticky`, viewport | `#join-end`; `.faq` crop (first); conf | form copy; sticky bar in the crop |
| noad (`/season1`) | `#hero`, `#bridge`, `#mod`, `.faq`, `#sticky` | `#join-top`, `#join-end`, `footer` (moved), `.how` crop; conf | form copy; sticky bar in the crop |

Confirmation (every ad): `.kick` (copy), `#tk` (373 to 364 px: `Questions first?` is one line), the new
`.lock` card (224 px in the plain pass), and the other children re-rasterised because `.conf-in` centres
vertically (`margin:auto 0`) and its height changed. FAQ answers sit in closed `<details>`, so they do not
paint in these states; the string tests cover them.

Hero labels: at 412 the d6 and d9 heroes are interactive (`#hero` art not shown), so the label change is
read from the DOM: `.hero .cta` is `Save their spot →` on main and `Get the details →` on the branch for
d6 and d9; d18 `Find their team →`, d19 `Save their spot →`, d2 `Play their game →`, noad `Be the hero →`
equal on both. The header mini button is hidden at the top of the page on phones, so it does not paint in
these states; the string test covers it (it shows once the header turns solid, and on desktop). No region
outside the list above differs.

Layout shifts (buffered observer, fit state): one entry of 0.00014 from the header `svg` on every ad, on
both builds; no new source. The additions are static markup inside their sections, so nothing above them
moves when they render.

Offenders: none. Console errors: none.

## Class Q on 3103

Script `part-b/ft-b-classq.mjs`, result `part-b/classq.json`, journey on both builds at
`/season1?ad=d19&utm_source=meta&utm_medium=paid_social&utm_campaign=s1&utm_content=d19-a&s1qa=1`, 412x915.
The tap's navigation is held by a capture-phase `preventDefault` so the page and its queues stay; the
stubs mean the beacon lists are the queued calls to `gtag` (dataLayer), `fbq` and `clarity`.

| Check | Result |
|---|---|
| `[data-join]` hrefs (top, bottom, confirm) | all three `/season1/join?src=ad&ad=d19&utm_source=meta&utm_medium=paid_social&utm_campaign=s1&utm_content=d19-a`. Pass |
| Tap on the top link | one `s1_join_click {ad:"d19", hero:"none", location:"top"}`, one Clarity `event join_click`; the link's resolved href is the one above. Pass |
| Submit (top form) | branch: `generate_lead` 1, Meta `Lead` 1, Lead `eventID` a5bf5ecb-9e30-4b75-ad3e-6dd2d1181b1d equals the POST body's `eventId`; main: 1, 1, same pairing. Pass |
| Confirmation | kick `Details on the way`, `.lock` visible, confirm link `Save their spot · $100` with the same href as above (screenshots `part-b/classq-conf-d19-{main,branch}.png`). Pass |
| Beacon lists vs main | GA: main `config, generate_lead`, branch `config, s1_join_click, generate_lead`; equal with params once `s1_join_click` is removed. fbq: `set autoConfig, init, track PageView, track Lead` on both. Clarity: main `set ad, set hero, set utm_content, event signup, set signed_up`, branch the same plus `event join_click`. Pass |
| Offender check | none; stubbed: www.googletagmanager.com, connect.facebook.net, www.clarity.ms. Console errors: none on either build |

## Harness, Tier 1

`npm run vitals -- --target local:3103 --ads d18,d19,d2,noad --profile fb-android-412 --runs 3 --label
ft-b-atlas --expectMarker 9c18894 --requireReady`: exit 0, 12 runs, marker 9c18894 on every run, s1Ready 1,
form usable 3 of 3, 0 POSTs, 0 leaks. Table `docs/s1-cls-field-2026-11/evidence/vitals/ft-b-atlas/table.md`
against `docs/s1-cls-field-2026-11/evidence/vitals/ft-a-tier1/table.md` (marker 8550976):

| Ad | CLS win med (A to B) | top source (A to B) | first paint ms | LCP med ms | LCP max ms | +input max |
|---|---|---|---|---|---|---|
| d2 | 0.0004 to 0.0004 | `h1#ih-q #text` both | 704 to 720 | 1896 to 1892 | 1924 to 1932 | 0.1195 to 0.1496 |
| d18 | 0.0035 to 0.0038 | `h3 + div.row` (3x) to (2x; run 1 0.0001 `span #text`) | 728 to 768 | 1476 to 1380 | 1520 to 1728 | 0.0066 both |
| d19 | 0.0015 to 0.0020 | `form + p` both | 752 to 744 | 1936 to 1916 | 1984 to 1988 | 0.0066 both |
| noad | 0.0003 to 0.0005 | `button #text + span.tag` (2x) to `button #text + span #text` (3x) | 756 to 712 | 2240 to 2216 | 2300 to 2224 | 0.0066 both |

CLS under 0.1 everywhere, same sources (the noad source is the same button text node, with the
neighbouring span named by its text instead of its class). The small CLS rises are the same shifts over
taller form sections. LCP and first paint are within run spread (d18 LCP runs 1728, 1380, 1364 ms against an
A median of 1476; d18 first paint 768 against 728 with FCP runs 840, 812, 908). The d18 run-1 window is
smaller (0.0001), the font swap that moves `h3 + div.row` having landed before first paint in that run. S2 offenders unchanged (d19 1 in both). The d2 `hero state` reads `ihero 922px`
against 882: it is measured after the harness journey has answered the hero, when the open slot holds
the taller top form.

## Servers stopped

PIDs 15845 (3103) and 15847 (3101) stopped by PID; `fuser` then showed 15848 (`next-server`, the 3101
child) still on 3101, stopped by its PID. (The first pass on d84a498 ran and stopped the same way: 13033,
13035, child 13036.) After that `fuser 3101/tcp 3103/tcp` exits 1 with no PIDs and
`curl` to both ports returns 000 (refused).

## For Fable

1. Row 15 is the only text not copied from his file. His `landing-v2.html` still has `Save their spot →`
   on d6, d9, d11, d13 and d14; brief B2 and the task cite his doc and message for `Get the details`. I
   kept the template's ` →` (every hero `.cta` ends with it, and `?herocta=` appends it), so they read
   `Get the details →`. If he meant no arrow, it is five spans in `landing.html`.
2. d19, d20 and d21 hero buttons still read `Save their spot →` and lead to the email form, which is at
   odds with B2's "Save their spot only ever means paying". Not in his list, so left; worth asking him.
3. The sticky bar's static label is `Get the details`, but the big script sets every form button and the
   sticky button to `CTA`, so on the page it reads `Send me the details` (same in his file). The static
   label only shows if the script fails.
4. Ready link and lock card sit inside `#join-top`, which the interactive heroes move into `.ih-slot`, so
   on d2, d6 and d9 the top ready link appears only after an answer; the bottom link and the card are
   always there.
5. WORKLOG not updated (the slice's earlier commits did not either); leaving it for the merge.
