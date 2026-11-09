# Steward review: Season 01 landing, field stability and load speed (2026-11-09)

Steward (brand, product and offer). Branch `build/s1-cls-field` at `32d39d4`. Reference: main
(`45dfe97`) on port 3101. Branch: Atlas's final build (`s1-build=d35ea36`; `landing.html` and
`route.ts` byte-identical to `32d39d4`), served from `/home/claude/wt-atlas`. I record verdicts and
route defects. I fix nothing. Copy is locked, so copy conflicts go to Jamie as findings.

**Overall: N1b PASS. Claims: 14 checked, 10 match canon, 4 findings (3 already on record, 1 new on
the signup error line). Never-say: no new hits on d18 or d19.**

## 1. Visual parity (N1b), declared relationship: clone

Method. (a) I opened Atlas's committed pairs in `screenshots/` and judged them by eye, side by side
(main left, branch right), at full resolution for the hero and form. (b) I diffed every committed
pair myself (sharp, channel delta > 8, largest 8-connected region) and hashed the files. (c) I made
my own captures: Playwright 1.63 Chromium, localhost outside the proxy, analytics hosts aborted,
`POST /api/*` aborted, `reducedMotion: reduce`, animations frozen, `Math.random` = 0.25, localStorage
cleared, after `load`, `document.fonts.ready` and every non-lazy image decoded; full page. Main came
from 3101, the branch from my own server on 3105 (started from `wt-atlas`, stopped by PID afterwards,
port confirmed closed).

### Verdict table

"Atlas" = the figure in `evidence/atlas/self-test.md` § 3. "Committed files" = my diff of the PNGs in
`screenshots/`. "Steward capture" = my own pair.

| Pair | Atlas | Committed files | Steward capture | My eye | Verdict |
|---|---|---|---|---|---|
| d18 412 initial | 0 | 0 (byte-identical) | not run | identical type, colour, photo crop, spacing, buttons | PASS |
| d18 412 email | 0 | 0 (byte-identical) | not run | identical; "a" in the field, yellow focus border on both | PASS |
| d18 1440 initial | 0 | 0 (byte-identical) | not run | identical | PASS |
| d18 1440 email | 0 | 0 (byte-identical) | not run | identical | PASS |
| d19 412 initial | 0 | 0 (byte-identical) | 0 (412x915 @2.625) | identical; sticky bar overlays the same section on both | PASS |
| d19 412 email | 0 (rerun; first 0.1083%, 24x63) | 0 (byte-identical) | 0 | identical | PASS |
| d19 1440 initial | 0 | 0 (byte-identical) | 0 | identical | PASS |
| d19 1440 email | 0 | 0 (byte-identical) | 0 | identical; "a" typed, green focus border on both | PASS |
| d2 412 initial | 0 | 0 (byte-identical) | not run | identical | PASS |
| d2 412 email | 0 | 0, but **the PNGs equal the initial ones** (see E-1) | 0.0444%, 17x22 on run 1; 0 on runs 2 and 3 (answer tapped, then "a" typed) | identical: selected answer, "Let the coach call time.", "a" in the field, "Count me in" | PASS |
| d2 1440 initial | 0 | **0.5250%, region 51x56** (see E-2) | 0.0181% 7x14 run 1 (main vs main: the same 0.0181%); 0 run 2 | identical, photo included | PASS |
| d2 1440 email | 0 | 0, PNGs equal the branch initial (E-1) | not run | identical | PASS |
| noad 412 initial | 0 | 0 (byte-identical) | not run | identical | PASS |
| noad 412 email | 0 | 0 (byte-identical) | not run | identical | PASS |
| noad 1440 initial | 0.0253%, 9x13 | **0.8441%, region 60x61** (E-2) | 0 on runs 1 and 2 | identical, photo included | PASS |
| noad 1440 email | 0 | 0 (byte-identical) | not run | identical | PASS |

### Non-zero diffs, read as a human would

- **d2 and noad 1440 initial (committed files).** By the N1a numbers these two committed files
  fail: over 0.1% of pixels, and regions (51x56, 60x61) over 12x12. By eye they are the same
  picture. Where the deltas sit (d2): 41% of the pixels inside the hero photo box (x 140 to 748)
  differ; of those, 52% differ by 1 or 2 levels of 255 and 41% by 3 to 8. Outside the photo
  2% differ, almost all by 8 or less, scattered along glyph edges. That is the photo being
  rasterised on a different decode pass plus text anti-aliasing noise, not a crop, colour or layout
  change. Three things confirm it: my own captures of both pairs are 0 on two runs (noad) and on the
  second run (d2); my d2 first run shows the same 0.0181% in main against main; and nothing in the
  diff touches CSS that paints the photo (the branch adds a preload, which changes when the image
  arrives, not how it is drawn).
- **d2 412 email (my run 1), d19 412 email (Atlas's first pass).** Small regions spread thinly over
  every text block of the page, gone on rerun. Text rasterisation noise, the same signature as
  Atlas's main-vs-main control.

No pair shows a real change. N1b PASS. Steward evidence (scratchpad, not committed):
`/tmp/claude-0/-home-claude/cac98b32-16dd-5200-9796-19cc82c22d7f/scratchpad/steward/` (captures, `cap.mjs`, `text.mjs`) and
`/tmp/claude-0/-home-claude/cac98b32-16dd-5200-9796-19cc82c22d7f/scratchpad/sbs/` (side-by-side composites).

### Evidence defects (not visual defects)

- **E-1, d2 email state never exercised (MINOR, owner Atlas; Sentry A to note).** All four d2 412
  PNGs share one hash, and `d2-1440-email-*` equals `d2-1440-initial-branch`. `atlas-pixel.mjs`
  line 54 clicks `#em-top` with `.catch(() => {})`; on d2 the field is hidden until an answer is
  chosen, so the click fails silently, the keystroke goes nowhere, and the "email" shot is the
  initial page. My capture (answer tapped first, then typed) covers the 412 phone state and passes;
  1440 email for d2 is still unevidenced by anyone. Fix: answer first on interactive heroes, and fail
  the run if the field is not visible.
- **E-2, committed PNGs do not match the reported table (MINOR, owner Atlas).** The d2 and noad 1440
  initial files in `screenshots/` diff at 0.5250% and 0.8441% while § 3 of the self-test reports 0
  and 0.0253%. The files come from a different run than the table. Re-commit the PNGs from the run
  the table reports, or add a line under the table naming which run the files are from.

Note for the runbook: starting `./node_modules/.bin/next start` with `&` and `$!` still left a
`next-server` child running after `kill` of the saved PID here (the saved PID was 29357, the server
29359). I found it by its working directory and stopped it by PID. Atlas reported the same with `npx`.

## 2. Claims, copy and offer integrity

### No copy change on the landing page

`git diff origin/main -- app/season1/landing.html` touches only: the head (`html` background, the
`s1-build` meta, the bootstrap script, the fonts link moved into `<noscript>`), one CSS rule
(`80vh` before `80svh`), the small script (table reads, `data-s1-pre`), attributes
(`data-clarity-mask` on `#em-top`, `#em-end`, `#tk`, `#tk-ph`; `loading="lazy"` on `img.tk-av`),
and the big script (`IMG` read, `fitHero` hooks, fetch `signal`, `s1Ready`). No text node changed.
Rendered-text check: `document.body.innerText` and the full `textContent` (hidden confirmation, Text
Karlin card and FAQ answers included) are identical on main and branch for d18 and d19 at 412.

### Signup page (M-1 fix)

The diff adds two lines in `pay()`: on `payment_intent_unexpected_state` it drops the cached secret
(and the confirmed flag when the PaymentIntent is canceled), then the existing line shows Stripe's
message. No visible copy was added.

Is Stripe's message fine for a parent? **No.** On this path the PaymentIntent is canceled, and Stripe's
message for confirming a canceled PaymentIntent is developer text. Relay's probe stubs it as "You
cannot confirm this PaymentIntent because it has a status of canceled." (`probe-3declines.out.json`,
tap 4), and the live text adds a list of status names. A parent who has just had three declines
reads "PaymentIntent" and "canceled" as "your sign-up was canceled". They are the parent most
likely to leave at this point, and the fix only helps if they tap again. Severity: low frequency
(live path has fired 0 times since Aug 22), high cost when it fires. Recommendation: on that one error
code, show the line the page already uses as its fallback, "The payment did not go through. Try again
or use another card." (`signup.html:569`). That is approved copy, so no new words. The decision is
Jamie's, because the signup page is protected. Money check: clearing the secret when the PaymentIntent
had *succeeded* in another tab does not risk a second charge, because the commit route answers 409
for any in-flight or succeeded PaymentIntent (`app/api/season1/commit/route.ts:339-345`).

### Claims table (rendered d18 and d19, branch = main)

Canon: `company/knowledge/ekuzo-faq-canon.md` (FAQ), `company/marketing/ekuzo-fact-library.md`
(FL), decision logs as cited.

| # | Claim | Page text | Canon text | Verdict |
|---|---|---|---|---|
| 1 | Season start | "Season 01 starts in January 2027." Header "Season one · 2027" (d18), "Youth gaming league · 2027" (d19) | FAQ 87: "The first practice is the week of January 18, 2027" | MATCH |
| 2 | Price now | "This is a free interest list. It doesn't sign your kid up for anything yet." "It's free and doesn't commit you to anything." | FAQ 91: $100 today covers January (join flow); the landing is the waitlist | MATCH. The landing names no price, so no $100 claim to check here |
| 3 | Practice cadence | "Weekly practice with a coach" (step 1, both ads) | FAQ 111: "Twice a week, 90 minutes each" | CONFLICT, **already on record**: s1-join-sync D20 (Jamie 11-05 10:28 CT), "weekly" goes to Aaron to reword. Still live on both ads; not new |
| 4 | Jersey with gamer tag | d19 hero "Their gamer tag. On a real jersey." and "A coach, a team and a custom jersey with their gamer tag on the back."; d19 section "a jersey with their gamer tag on it"; step 3 on both ads "a jersey with their gamer tag" | FAQ 107: free EKUZO jersey for the first 100 families who commit by Nov 30; comment: gamer tag on the back "not promised here"; team jersey "available to buy" | CONFLICT, **already on record**: PR-3 (`docs/season1-commit/05-defect-log.md`), join-sync steward S3, round 2 steward § "What's the jersey?". Still open. Weight rises on Wed 11-11 when d19 moves to the main ad set and runs the Purchase ad |
| 5 | Coaches | "Passionate top 1% college esports players, background-checked and trained to coach kids." | FAQ 25: "top 1% collegiate esports athletes or former professional players. Every coach is background-checked and trained..."; s1-heroes D13 (Jamie 10-14) | MATCH. FL 3390: top 1% of ranked League = Master and above (Sept 2026); FL notes those facts are not evidence about EKUZO's own coaches |
| 6 | Meet the coach | "You'll meet your coach before the season starts." | Not in FAQ canon or FL | NOT IN CANON, pre-existing (shipped with D13), unchanged by this build. Low; add to canon or confirm |
| 7 | Game | "With us, they play League of Legends on a team of five. It's free to download, and most kids start from scratch..." | FAQ 72 (Season 01 wording) | MATCH, word for word |
| 8 | Where and when | "Online, from home, on a computer with a headset. Practice runs in the evening, in your time zone." | FAQ 56 (home track evening, local time); D13 | MATCH |
| 9 | Same teammates | "the same teammates all season" | FAQ 87 "the same coach and the same teammates all season" | MATCH |
| 10 | Scarcity | "Spots for season one are limited. The list hears first." | messaging voice: no artificial scarcity; season1-launch ST-4; `season1-launch/notes-for-aaron.md` 22: stands, "partner capacity is real" | Known and decided. MATCH by decision |
| 11 | Email promise | "We only email about EKUZO, and you can unsubscribe anytime." | consistent with the waitlist flows | MATCH (no conflict found) |
| 12 | Confirmation inbox promise | "Check your inbox for a note from Karlin, our founder." | users lens Q4: welcome flow not verified from here | UNVERIFIED, pre-existing. Ops or Jamie to confirm the flow is live before Wed 11-11 |
| 13 | Text Karlin | "Karlin texts you himself, from his own phone. No marketing list, no automated texts... Reply STOP any time." | `api/season-one/route.ts:95-101`: number stored as a plain property, no SMS consent | MATCH on substance; wording is U-10, below |
| 14 | Signup error line (M-1) | Stripe's message on a canceled PaymentIntent | page fallback line 569 | FINDING, **new**, see above |

### U-10, Text Karlin fine print

The substance is honest and matches the code: Karlin texts from his own phone, there is no list and
no automation. The wording undercuts it: the joke sentence sits where a parent looks for plain words
about their number, the card never says which number will text them, and "Reply STOP any time"
implies the automated system the same paragraph rules out. Not a defect in this run (copy locked,
no false claim); it goes to Jamie as a low-priority wording item for Aaron's next copy pass.

## 3. Positioning and never-say (d18 and d19 only)

Checked against voice-dna § 3B (soft-banned), anti-ai-writing § 3A, 3C, 3D (hard-banned words,
phrases, transitions), voice-dna § 4 (protected terms) and `ekuzo-messaging-voice.md` § Language
We Avoid (the target of voice-dna § 5).

**New or missed hits: none.**

Considered and cleared, so the next reviewer need not recheck:

- "Achievement unlocked": game sense of "unlock", allowed by § 3B. Tone flagged in earlier rounds
  (season1-launch steward, join-sync parent review); not new.
- "Know a parent still figuring out screen time?": a neutral share prompt, not screen-time panic or
  gaming-as-problem.
- "We can't wait to make screentime the highlight of your day too": noun "highlight", not the
  soft-banned verb; ad-scent mismatch already flagged (season1-launch, users lens Q4).
- "...and play to win" (step 2): stakes, not pressure; no trophy, scholarship or parent-pride frame.
- "Passionate" (coaches): not on either list; Jamie's D13 wording.
- "Got it. I'll text you soon. – Karlin": an en dash as a sign-off, not a clause dash; already noted
  in join-sync Sentry A's dash lint; out of scope for a copy-locked run.
- d18 "Not a sports kid? Perfect." and "They don't have to like soccer to love a team.": no
  blame of the child, no anti-gaming frame; a positive reframe, not "It's not X. It's Y.".

No em dashes, no hard-banned words, no banned transitions in the rendered text of either ad.

## 4. Defects routed

| ID | Severity | Owner | What |
|---|---|---|---|
| N1b | none | Atlas | No visual FAIL. Nothing routed as MAJOR |
| E-1 | MINOR (evidence) | Atlas; Sentry A to note | d2 "email" state never captured (silent click on a hidden field); d2 1440 email unevidenced |
| E-2 | MINOR (evidence) | Atlas | Committed d2 and noad 1440 initial PNGs come from a different run than the self-test table |
| F-1 | finding, new | Jamie (protected signup page; Relay builds if approved) | M-1 path shows Stripe's developer message to a parent; recommend the existing fallback line for `payment_intent_unexpected_state` |
| F-2 | finding, on record | Jamie, then Aaron | "Weekly practice" against canon twice a week (D20), still live on d18 and d19 |
| F-3 | finding, on record | Jamie | Gamer-tag jersey promise on d19 (and step 3 on both ads) against canon's EKUZO jersey (PR-3); decide before d19 moves to the main ad set Wed 11-11 |
| F-4 | finding, low | Jamie | "You'll meet your coach before the season starts" is not in canon; confirm and add, or leave |
| F-5 | finding, low | Jamie (Ops to verify) | Confirmation promises a note from Karlin; confirm the welcome flow sends one |
| U-10 | finding, low | Jamie, then Aaron | Text Karlin fine print wording (§ 2) |
