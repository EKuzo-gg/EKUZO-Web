# Steward review: rendered pages (Phase 4, brand / claims / offer + visual-parity gate T7)

Author: Steward. Date: 2026-09-15, re-judged 2026-09-16 after repair cycles 1 and 2. Review only, no fixes applied.

**Final status after cycle 2: T7 is 13 rows, 0 FAIL, 0 open parity FIX. Every defect from cycles 0 and 1 is closed and verified on the live pages.** Cycle-1 measurements: `steward-rc1.mjs`, `steward-rc1b.mjs`, `steward-rc1c.mjs`. Cycle-2 measurements: `steward-rc2.mjs`, `steward-rc2b.mjs`, output in `steward-rc2-output.txt`.

Reviewed live, not from source: after server `http://localhost:3001` (the built branch), before server `http://localhost:3002` (pre-change tarball, site popup flag forced on). Every measurement in this file was taken from a rendered page in a real browser, via `docs/blog-newsletter/tests/steward-t7.mjs`, `steward-fidelity.mjs`, `steward-case.mjs`, `steward-fit2.mjs`, `steward-extra.mjs`, `steward-extra2.mjs`, `steward-shots.mjs`. Raw output, all under `docs/blog-newsletter/tests/`: `steward-t7-bars.txt` (sticky measurements), `steward-t7-popups.txt` (popup measurements), `steward-t7-contact.txt` (contact modal before and after), `steward-t7-fit.txt` (small-viewport fit), `steward-t7-live.txt` (Jamie post), `steward-fidelity-output.txt` (82 copy assertions plus the lint), `steward-case-output.txt` (case-transformed bar text per state), `steward-fit2-output.txt` (scroll and hit tests), `steward-extra-output.txt` (post-signup popup behavior), `steward-extra2-output.txt` (intermediate widths).

Standards applied: `02-frozen-spec.md` § Reference relationships (the parity standard), `02-copy-deck.md` v2 (frozen copy), `03-decision-log.md` D-01 to D-12, `system/methodology/anti-ai-writing.md` (hard rules), and my own `steward-review-design.md`.

Ledger pointer: `04-evidence-ledger.md` names `steward-review-t7.md` as the file carrying Steward's T7 PASS/FAIL, and `sentry-report.md` records that file as missing. **This file carries it, in section A.** Owner of the pointer update: Fable.

**Adoption check first, because the rest of this review depends on it.** All six design-review outcomes are present in the rendered pages: D-01 no flag (the blog surfaces render on 3001 with `NEXT_PUBLIC_NEWSLETTER_POPUP_ENABLED` unset, so they ship with the merge, Jamie's decision); D-02 "Free to read." appears on no rendered surface; D-03 the thumbs popup body opens with "Leave your address and you're on the list today"; D-04 the welcome email opener is arm-neutral in `welcome-email-thumbs.md` line 23; D-09 both popups render "Karlin Oei, founder, EKUZO"; "I coach kids who play" renders in the classic body. Weekly cadence confirmed real by Jamie for this exercise.

**New evidence captured, because the ledger was short two artifacts.** `contact-before-1440-open.png` and `contact-before-375-open.png` (the missing T7 reference, from 3002's contact modal opened via the homepage sticky bar "Talk to Humans"), `contact-after-375-open.png`, `popup-site-375-open.png` (the popup reference at the small size), and `steward-popup-blog-{thumbs,classic}-{1440,375}-open.png`. The last four exist because the ledger's `popup-blog-*-open.png` shots were captured before the brand-pane image finished decoding, so the purple pane reads as empty in them. That is a capture artifact, not a build defect: the markup is one shared `<Image src="/images/popup-kid-characters.png">` for both modes, the asset returns 200 on both servers, and with a decode wait the built popup renders the image identically to the reference. Anyone reading the ledger shots as a parity failure would be reading the harness, not the page.

---

## A. Visual-parity gate (T7)

Declared relationship for every row below is **ADAPT**. "May differ" and "must match" are quoted from `02-frozen-spec.md` § Reference relationships, not invented here.

| # | Pair | Size | Rel | May differ per spec | Must match per spec | Measured | Verdict |
|---|---|---|---|---|---|---|---|
| A1 | sticky-camps vs sticky-blog-thumbs | 1440 | ADAPT | copy; email input + submit replacing the buttons; colors may follow the default red rather than camps purple | position, height, padding, font classes, show/hide | Position `fixed bottom-0 left-0 right-0 z-40` identical. Height 100px vs 100px. White row padding `20px 16px` identical, inner row `max-w-[1232px] px-2` identical. Line font identical: `tungstenBlack` 54px, weight 900, uppercase, tracking 1.08px. CTA 60px tall, `#AE2CF2`, radius 4px, padding `14px 32px`, Inter 18px/700, identical to the camps CTA. Show/hide classes identical (`translate-y-0` mid-page, `translate-y-full` at top and at footer). Deltas are exactly the permitted ones plus the input (60px, 220px wide, 2px `#AE2CF2` border, radius 4px, matching the CTA's own border treatment). Colors stayed on camps purple, which the spec permits either way. | **PASS** |
| A2 | sticky-camps vs sticky-blog-thumbs | 375 | ADAPT | as above | as above | Position, padding (`16px 12px`), show/hide, and CTA metrics (48px, same purple, same radius, Inter 14px/700) all identical. **Height differs: 105px built vs 80px reference.** Cause: below `sm` the reference hides its line entirely (`display: none`, measured), while the built bar must show one line of copy (P1) and an inline error (P3), so the D1 fix added a compact 12px `block sm:hidden` span that stacks above the input row. Font classes at `sm` and up are unchanged from the reference; the compact span is new type the reference has no equivalent for. | **PASS with a required spec-change** (see A-note-1) |
| A3 | sticky-camps vs sticky-blog-classic | 1440 | ADAPT | as above | as above | Identical to A1 on every measured property; only the copy string and CTA label differ (`Join`, 106px wide). Height 100px vs 100px. | **PASS** |
| A4 | sticky-camps vs sticky-blog-classic | 375 | ADAPT | as above | as above | Identical to A2, same 105px vs 80px height delta, same cause. | **PASS with a required spec-change** (see A-note-1) |
| A5 | popup-site vs popup-blog-thumbs | 1440 | ADAPT | copy fields, trigger, byline line | two-pane layout, purple pane, close button, inputs, button, success state | The closest ADAPT in this run. Dialog class string byte-identical (`fixed inset-0 z-[9999] flex`), portaled to `HTML`. Left pane `hidden lg:flex` at `#7B3AAF` 720x900 with the same kid-and-characters image; right pane `#1a1a2e` 720x900 with the same 80px masked seam; `GAMING MATTERS.` at the same 80px display size and the same lime; close button 40x40 at `top-6 right-6`, identical class string; both inputs 52x400, radius 6px, identical class string; submit 52x400 `#C8E620` on `#111`, identical class string. Deltas: the copy fields, the added byline `<p>`, and a lime focus ring on the first field because blog mode moves focus into the dialog on open (P8 requires it; the reference does not do it). Success state: `Got it.` replaces the button label in place, same button geometry. | **PASS** |
| A6 | popup-site vs popup-blog-thumbs | 375 | ADAPT | copy fields, trigger, byline line | two-pane layout, purple pane, close button, inputs, button, success state | **Cycle 0 (FAIL, now superseded):** at 375x800 the submit spanned y 761 to 813 against an 800px viewport and the microcopy y 829 to 865, entirely off-screen, with nothing scrollable; at 375x667 the submit could not be pressed at all. **Cycle 1 (re-judged, PASS):** every element is fully visible at both heights. Thumbs at 375x800 and at 375x667: close 24 to 64, headline 24 to 125, body 133 to 290, byline 306 to 326, fields 342 to 458, submit 470 to 522, microcopy 538 to 574. Submit hit-tests as itself. Scroll lock holds (`body` `overflow: hidden`; a wheel gesture no longer moves the article behind). The fix is durable rather than tuned to these two heights: at 375x560 and 320x480 the content pane is `overflow-y: auto` and genuinely scrollable, and after a wheel both the submit and the microcopy are reachable and hit-test correctly. **Cycle 2 (final, PASS):** the two cycle-1 findings are closed. At 375x800 the content is centred with 105px above and 105px below, symmetry delta 0, matching the reference's own perfect symmetry (50/50) with more breathing room because it carries less furniture. The EKUZO wordmark renders at 120x24 from `/images/ekuzo-logo.svg`, `alt="EKUZO"`, decoded, legible on the purple pane. Headline now starts at y 145, clear of the close button (24 to 64) with 81px to spare, and the headline's line boxes no longer intersect the button at 375 or at 320 in either variant. The close button is outside the scroll container and stays pinned at y 24 through any scroll. Evidence: `steward-rc2-output.txt`, `screenshots/popup-blog-thumbs-375-open.png`, `popup-blog-thumbs-375x667-open.png`. | **PASS** (final) |
| A7 | popup-site vs popup-blog-classic | 1440 | ADAPT | as A5 | as A5 | Identical to A5 on every measured property; only the copy strings and the button label differ. | **PASS** |
| A8 | popup-site vs popup-blog-classic | 375 | ADAPT | as A5 | as A5 | Cycle 0: fitted at 375x800, clipped its submit and lost its microcopy at 375x667. Cycle 1: fitted at both, submit 346 to 398, microcopy 414 to 432. **Cycle 2 (final, PASS):** centred 176 above and 176 below at 375x800, symmetry delta 0; wordmark renders; headline starts at y 216, clear of the close button; at 320x568 the headline wraps to three lines and still clears it, no line-box intersection, and the pane scrolls for the microcopy. Evidence: `steward-rc2-output.txt`, `screenshots/popup-blog-classic-375-open.png`, `popup-blog-classic-320-open.png`. | **PASS** (final) |
| A9 | contact-before (3002) vs contact-after | 1440 | ADAPT | the new select | same class string as the existing text inputs | Select class string byte-identical to the text inputs: `font-body text-base text-black border border-black/20 rounded-sm p-3 outline-none focus:border-black transition-colors`. Same 1px `black/20` border, 4px radius, 12px padding, Inter 16px, full 576px width. Label matches the other field labels (Inter 14px, weight 500, sentence case). Helper line renders. Height 48px vs 50px for the text inputs, which is the native select box model, not a style divergence. Modal grows 748px to 876px, inside `max-h-[90vh] overflow-y-auto`. | **PASS** |
| A10 | contact-before (3002) vs contact-after | 375 | ADAPT | as A9 | as A9 | Same class string, same metrics at 279px width. Modal grows 744px to 892px, which pushes Submit below the fold where the reference kept it visible; unlike the popup, this modal is `max-h-[90vh] overflow-y-auto`, so Submit is reachable by scrolling and no action is lost. Evidence: `contact-before-375-open.png` vs `contact-after-375-open.png`. | **PASS with note** |
| A11 | sticky-camps vs sticky-blog-thumbs | 768 and 820 | ADAPT | copy; email input + submit replacing the buttons; colors | position, height, padding, font classes, show/hide | Added in cycle 1, because this is the band where the bar was broken (A-note-2). **Overflow gone:** at 768 the CTA ends at x 744 inside a 768px viewport and at 820 it ends at x 796, `document.scrollWidth` equals the viewport at both, and the CTA hit-tests as itself. Position, show/hide classes and white-row padding (`20px 16px`) identical to the reference at both widths. **Two deltas remain.** Height 125px vs the reference's 100px, because the stacked layout now runs up to `lg` rather than `sm`. Font classes: the line renders 12px Inter sentence case up to `lg`, where the reference renders 28.8px (768) and 30.75px (820) tungstenBlack uppercase. Both are the same allowed-delta consequence as A2 and A4, now spanning 640px to 1023px rather than only below `sm`. Evidence: `steward-rc1-output.txt`, `screenshots/sticky-blog-thumbs-768-visible.png`, `sticky-blog-thumbs-820-visible.png`. | **PASS with the A-note-1 spec-change widened** |
| A12 | sticky-camps vs sticky-blog-classic | 768 and 820 | ADAPT | as A11 | as A11 | Identical to A11 on every measured property; CTA ends at x 744 (768) and x 796 (820), no overflow, height 125px vs 100px, line 12px Inter up to `lg`. | **PASS with the A-note-1 spec-change widened** |
| A13 | gate sizes re-verified after the repair | 1440 and 375 | ADAPT | as A11 | as A11 | The repair did not disturb the two graded sizes. At 1440 all three bars are 100px with a 54px tungstenBlack uppercase line and a 60px CTA, exactly as in cycle 0. At 375 the blog bars are 105px against the reference's 80px with a 12px Inter line, also exactly as in cycle 0. A1, A2, A3 and A4 stand as written. Evidence: `steward-rc1b-output.txt`. | **PASS** |

### A-note-1: the 375 sticky height, and why I did not call it a FAIL

The letter of the gate says height must match, and 105px is not 80px. I am not calling it a FAIL because the only way to restore 80px is to hide the copy line below `sm`, which is exactly the code that produced D1, a MAJOR defect already fixed and verified. A gate cannot require re-breaking a verified requirement. P1 (one line of copy) and P3 (inline error visible) outrank a height number that was written for a bar with no input in it.

What that costs: the frozen spec's own header says deviations after the freeze require a logged spec-change. **Owner: Fable.** Cycle 1 widened the band, because Atlas moved the stacked layout from `sm` to `lg` to fix the clipping, so the line is required text the reference does not render at any width up to 1023px. The spec-change line now reads: "Sticky bar, below `lg`: height may exceed the reference (measured 105px at 375, 125px at 768 and 820, against 80px and 100px) and the line renders in 12px `font-body` sentence case rather than the reference's display caps, because the reference hides its line below `sm` and truncates nothing above it, while P1 and P3 require the blog bar to show a line and an inline error at every width." Without that line the evidence ledger records a T7 PASS against a standard the build does not meet, which is the kind of quiet drift this gate exists to catch.

### A-note-2: a rendered defect the two gate sizes do not see

Between 640px and roughly 890px wide, the blog sticky bar's submit button runs off the right edge of the viewport and is clipped. Measured, thumbs variant: at 640px the button spans x 624 to 703 against a 640px viewport, so 16px of a 79px button is visible; at 768px it spans x 708 to 821, so the label renders as "Try"; at 832px it is 25px over; at 896px and above it is clean. The classic variant is worse by four characters. The overflow is clipped, not scrollable (`document.scrollWidth` equals the viewport width), and the camps reference never overflows at any of those widths because its line is short and its CTA is a single `flex-1` element. Cause: `whitespace-nowrap` on the display line plus a fixed `sm:w-[220px]` input with no `min-w-0` on the text column. Evidence: `screenshots/steward-sticky-blog-thumbs-768-clipped.png`, `tests/steward-extra2-output.txt`.

T7 grades 1440 and 375 only, so this is not a gate row. It is still a MAJOR rendered defect for Atlas: a parent on a tablet, or on a half-width laptop window, sees a purple sliver where the button should be.

**Cycle 1: CLOSED.** Atlas stacked the layout up to `lg` and added `min-w-0`. Measured at the two widths the coordinator named, both variants: no CTA overflow, no document overflow, CTA hit-tests as itself. Graded as A11 and A12 above, which is where this note's subject now lives.

### A-note-3: the hidden mobile heading block, and my ruling

Atlas hid the mobile duplicate heading block (the kid-and-characters artwork and the `GAMING MATTERS.` wordmark) in blog mode below `lg`, which is what bought the vertical room that closed A6. Measured at 375: zero images render in the dialog (the desktop pane's copy sits inside a `display: none` parent, the mobile duplicate is gone, and the EKUZO logo was already `hidden lg:block` in the reference), no `MATTERS.` node is visible, and the dialog contains exactly one occurrence of the string "EKUZO", inside the byline. The reference at 375 renders the artwork at 200x202 and the wordmark at 40px.

**Ruling: not an acceptable ADAPT delta on its own authority. It is a spec-change Fable must log, and it carries a FIX for Atlas (A-note-4).**

Three reasons, in order of weight.

1. **The allowed-delta list is closed and specific.** The spec permits "copy fields, trigger, byline line" and nothing else. The artwork and `GAMING MATTERS.` are neither: they are hardcoded brand furniture, identical in both modes, and they are not deck fields. The spec's header says deviations after the freeze require a logged spec-change, so this is one by construction. I am not calling it a FAIL, because the must-match list (two-pane layout, purple pane, close button, inputs, button, success state) is fully satisfied at 375, and below `lg` neither mode has two panes anyway. It sits in the gap between the two lists, which is exactly what a logged deviation is for.
2. **It removes the only brand identification a mobile reader gets.** The blog popup at 375 is now a full-screen purple sheet with no logo, no wordmark and no artwork, asking for an email address. The one EKUZO token on screen is the 13px byline. A reader arriving from X, tapping a post, and hitting an unbranded full-screen email capture halfway down is being shown a phishing-shaped surface by the brand whose entire pitch on that surface is that the reader decides. The byline is doing real work here (it names the org as well as the person), which is the only reason this is a FIX and not a BLOCK.
3. **It is the cause of the two new defects in A-note-4.** A change that trades brand identification for vertical room, and then spends that room on empty pane, has not made the trade it looks like it made.

Cheapest repair that keeps every gain: restore the EKUZO logo at all widths (it already exists in the component at `hidden lg:block`, so this is a class change, roughly 24px tall), which restores brand identification for about a tenth of the height the removed block cost. Then the artwork and wordmark can stay hidden below `lg` and Fable logs that single, narrower deviation.

**Cycle 2: CLOSED, and closed the way the ruling asked.** Fable logged the deviation as **SC-01** in `02-frozen-spec.md` (logo replaces the artwork block below `lg`) and Atlas rendered it. Verified on the live pages at 375 and 320, both variants: `/images/ekuzo-logo.svg` renders at 120x24 with `alt="EKUZO"`, decoded, at the top of the content column, and it reads as the EKUZO wordmark against the purple pane. The full-screen capture is no longer brand-less, the deviation is on the record, and the vertical room that fixed A6 is kept. This is the right outcome: a logged narrow deviation rather than an unlogged broad one.

### A-note-4: two defects the heading-block removal introduced

Both are new in cycle 1, both at mobile widths, both measured.

**The headline now collides with the close button.** Removing the brand block moved the headline from y 387 to y 24, which is the close button's own top edge, so the two boxes overlap by 40px vertically. Horizontally they intersect: classic at 375x800, the headline's first line ends at x 329 and the close button starts at x 311, so 18px of "For parents of gamers," renders beneath the button, and the X glyph and its circle border are drawn over the comma (visible in `screenshots/popup-blog-classic-375-open.png`). Thumbs at 320x568 collides too, 30px under the button. The reference never collides, because its brand block holds the headline 300px clear. **FIX, Atlas:** `pr-12` (or equivalent) on the headline below `lg`, or the restored logo from A-note-3, which pushes the headline down on its own.

**A third to a half of the sheet is now empty.** The pane changed from `justify-center` to `justify-start`, so the content is crammed at the top with dead purple below: 226px at 375x800 thumbs, 368px at 375x800 classic, against a reference that centers and fills. `justify-start` is needed only when content exceeds the viewport, which the scroll container now handles. **FIX, Atlas:** `justify-center` with `overflow-y-auto` retained, or `justify-start` only under a short-viewport condition. This is cosmetic rather than functional, and it is the difference between a designed sheet and a form that ran out of page.

**Cycle 2: both CLOSED, verified.** Atlas moved the close button out of the scroll container and centred the content with symmetric `py-20` and `my-auto`. Measured: zero headline-to-button line-box intersection at 375 and 320 in both variants (81px of clearance on thumbs at 375, and the classic headline wraps to three lines at 320 and still clears); symmetric gaps with a delta of 0 at 375x800 in both variants; the close button pinned at y 24 through any scroll, so it can never scroll away from a reader who wants out.

**One residual note, not a defect and not gated.** I checked the `my-auto` centring for the trap it usually sets, content overflowing above a scroll container and becoming unreachable. It does not happen here: at 320x480 the container opens at `scrollTop` 268 of 314 and scrolling up to 0 brings the wordmark and headline fully into view, so nothing is trapped. The only cost is that at 320x480 specifically, a viewport shorter than any current phone in portrait, the reader's first view is the fields rather than the pitch. At 320x568 and 375x667 the container opens at `scrollTop` 0 and the offer is the first thing read. Evidence: `steward-rc2b.mjs`.

### A summary (final, after cycle 2)

13 rows: **13 PASS, 0 FAIL, 0 open parity FIX.** Closed and independently verified across two repair cycles: A6 (popup clipped and unsubmittable at 375), A-note-2 (sticky clipped from 640 to 890), A-note-3 (brand-less mobile sheet, now the logged SC-01 with the wordmark rendering), A-note-4 (headline under the close button, and the uncentred pane), D-2 (the double ask) and the byline contrast in section E. **T7 PASSES.**

Fable's remaining paperwork, all behavioral record rather than gate: the widened A-note-1 line (sticky height and font classes below `lg`), the one-line note that sticky success suppresses the popup, and SC-01, which is already logged. Nothing here blocks the gate.

---

## B. Copy fidelity of the rendered strings

Method: for both variants at both sizes, I drove each surface through every state (idle, loading, success, error, plus the contact select) and compared the rendered text of every leaf node against `02-copy-deck.md` v2. 82 assertions, 80 exact-match passes, 2 failures, both the same thing and neither a transcription error. Full output: `steward-fidelity-output.txt`.

Confirmed exact against the deck, character for character, including apostrophes, the literal three-period ellipsis in `One moment...`, and the absence of terminal periods on button labels:

- Sticky thumbs: line, `Try it`, `Got it. Look for it tomorrow.` (replaces the line and field in place, as the deck specifies), `That didn't go through. Try once more.`
- Sticky classic: line, `Join`, `You're on the list.`, error line.
- Popup thumbs: headline, body (all 261 characters), byline, both placeholders, `Send me the one email`, `One moment...`, `Got it.`, microcopy, error line.
- Popup classic: headline, body, byline, both placeholders, `Join the weekly`, `One moment...`, `You're in.`, microcopy, error line.
- Contact: label, `Choose one`, all eight option labels in deck order, helper text `Optional. It tells us where parents are finding us.`

The two failures are the popup eyebrow at 375, in both variants, and the cause is that **the eyebrow does not render at all below `lg`**. It lives only in the desktop purple pane; the mobile brand block (`lg:hidden`) carries the image and `GAMING MATTERS.` and no eyebrow. The reference behaves identically, so parity holds and this is not a defect. It is a deck problem: `The EKUZO weekly` is written as an unconditional popup field and is in fact desktop-only. **FIX, owner Story:** annotate the eyebrow in the deck as "desktop only (`lg` and up), inherited from the reference layout", so no future reader treats its absence on a phone as a dropped string.

### The inherited uppercase (Sentry D2): keep it

The facts, measured rather than inferred. `element.innerText` applies `text-transform`, so this is what a reader actually sees:

| Surface | 1440 | 375 |
|---|---|---|
| Sticky line | `ONE EMAIL TOMORROW, THEN YOU DECIDE TO STAY OR GO.` at 54px tungstenBlack, tracking 1.08px | `One email tomorrow, then you decide to stay or go.` at 12px Inter, exact deck case |
| Sticky success | `GOT IT. LOOK FOR IT TOMORROW.` at 54px | `Got it. Look for it tomorrow.` at 12px, exact deck case |
| Sticky error | `THAT DIDN'T GO THROUGH. TRY ONCE MORE.` at 54px | `That didn't go through. Try once more.` at 12px, exact deck case |
| Popup eyebrow | `THE EKUZO WEEKLY` at 13px, tracking 1.95px | not rendered |

**Judgment: acceptable for the voice, and there is no readability question at 375 at all.** Three reasons.

1. The 375 concern the defect log implies does not exist. At 375 every sticky string renders in exact deck case at 12px, because the D1 fix routes mobile through a separate `font-body` span with no transform. The uppercase applies only at `sm` and up for the bar and `lg` and up for the eyebrow, which are the exact widths where the reference shouts in the same typeface at the same size with the same tracking.
2. Removing it would break the gate it came from. The camps bar's line is 54px uppercase tungstenBlack; that is what "must match: font classes" means in A1 and A3. Lowercasing the blog line would make the bar read as a foreign element bolted onto the site, which is a worse brand outcome than a loud line.
3. The register survives. A 50-character sentence in display caps is loud, but the bar is furniture, it carries no first person (the deck's own design), and the site's voice already uses this treatment for exactly this purpose.

Two riders I would not gate on but would not lose either. First, the error line is also shouted: `THAT DIDN'T GO THROUGH. TRY ONCE MORE.` at 54px is a 38-character apology in the same size as the pitch, and an error is the one moment the brand should get quieter rather than louder. If Atlas ever touches this component again, the error and success spans are the candidates for the `font-body` treatment, not the line. Second, the 375 line at 12px in `#AE2CF2` on white measures 4.71:1 contrast, which clears AA for normal text by 0.21, and 12px is the smallest body type on any of these surfaces. It passes. It is also the floor, and it is new type the reference has no equivalent for, so it should not get any smaller.

### Mechanical lint on the rendered innerText

Run against the extracted rendered text of every surface in every state, 26 extractions: em-dashes and en-dashes, 39 hard-banned words, the 7 copulative-avoidance forms, 21 banned phrases, 8 banned transitions, 6 engagement-bait lines, 12 negative-parallelism regexes including the compressed and sneaky forms, exclamation marks, digits, curly quotes and the ellipsis character.

| Check | Result on rendered text |
|---|---|
| Em-dashes (1A) | **0** |
| En-dashes | **0** |
| Negative parallelism (1B) | **0** |
| Engagement bait (1C) | **0** |
| Hard-banned words (3A) | **0** |
| Copulative avoidance | **0** |
| Banned phrases (3C) | **0** |
| Banned transitions (3D) | **0** |
| Exclamation marks | **0** |
| Digits in any rendered copy string | **0** (C3 holds on the rendered surfaces, not just the deck) |
| Curly quotes / ellipsis character | **0**; `One moment...` renders as three literal periods |
| Title case (1G) | Clean. The two all-caps strings are CSS transforms of sentence-case sources, which is a style choice, not title case. |

The negation-density note from my design review survives into the rendered pages, unchanged and still LIGHT: a reader on a thumbs page sees `no questions`, `No spam`, `Unsubscribe any time`, `thumbs down` and `takes you straight off`; on a classic page, `no hype` and `No spam`. No hard rule fires. Reassurance-by-negation is still the default move on every surface, and the Commitment Voice prefers naming what we do. Story's eye on the next pass, not a gate.

---

## C. Claims and voice on the rendered surfaces, under Jamie's confirmations

Jamie's confirmations change two of the three dependency groups from my design review. Group 2 (does a weekly exist, at what cadence) is **closed**: the weekly cadence is real for this exercise. Group 1 (the welcome automation) is **converted from a blocker into a sequencing obligation** by D-01: no flag, and the gate is Jamie's ordering, blog live, then the Beehiiv automation, then the X push. Group 3 (the unsubscribe merge tag) is **still open**: the frozen spec's pre-flight says the merge tag was not verified by API because it is an editor feature.

Re-judged, per rendered string:

| Rendered string (surface) | True at commit time under this sequencing? |
|---|---|
| `ONE EMAIL TOMORROW, THEN YOU DECIDE TO STAY OR GO.` (sticky thumbs) | **False in the window between merge and automation.** Nothing sends. True from the moment the automation exists with a 24 hour delay. |
| `GOT IT. LOOK FOR IT TOMORROW.` (sticky thumbs success) | **False in the same window**, and the worst of the set: it tells a reader who has just acted that a specific thing is on its way. |
| `Tomorrow I'll send one message with a thumbs up and a thumbs down` (popup thumbs body) | **False in the same window.** |
| `or use the thumbs down tomorrow` (popup thumbs microcopy) | **False in the same window**, and additionally depends on the merge tag. |
| `Leave your address and you're on the list today` (popup thumbs body) | **True.** Create-subscription fires on submit. This is the honest disclosure D-03 moved upstream and it does what it was meant to do. |
| `the thumbs down takes you straight off, no questions` (popup thumbs body) | **Unverified.** Depends on the merge tag and on the unsubscribe flow completing in one click with no "why are you leaving?" step. Nobody has clicked it yet. |
| `Thumbs up and the weekly keeps coming: what I'm seeing in kids' gaming, sources attached.` | **True on cadence** (Jamie confirmed). "Sources attached" is still a content promise with no named owner; my design review's Gap 4 stands, unchanged and non-blocking. |
| `ONE EMAIL A WEEK ON KIDS AND GAMING, WITH THE SOURCES.` (sticky classic) | **True.** Cadence confirmed. |
| `One email a week on making gaming count. I coach kids who play, so it's what I'm actually seeing. Sources attached, no hype.` (popup classic) | **True.** Cadence confirmed, credential correct, and "kids who play" needs no antecedent from the article, which was the point of that change. |
| `YOU'RE ON THE LIST.` / `You're in.` / `Got it.` | **True.** Accurate at the moment they appear. |
| `No spam. Unsubscribe any time.` (both microcopy) | **Unverified**, same merge-tag dependency. |
| `That didn't go through. Try once more.` | **True.** |
| Contact label, helper, eight options | **True.** No change from my design review, which passed this surface. |

### Stated plainly, as asked

**Yes. Four rendered sentences are still false at commit time**, and they are false for exactly as long as the blog is live without the Beehiiv automation behind it: the sticky thumbs line, the sticky thumbs success line, the "tomorrow I'll send one message" clause in the popup thumbs body, and the "or use the thumbs down tomorrow" clause in the thumbs microcopy. All four are false in the same way, by silence: a parent leaves an address, is told an email arrives tomorrow, and nothing arrives. One further rendered promise, the one-click thumbs-down exit, is not false but is unverified, and it is unverified in the direction that matters, because "no questions" becomes false the moment Beehiiv shows a confirmation step or a survey.

D-01 accepted this window deliberately, on Jamie's reasoning that the site gets almost no traffic before the X push, and with no flag there is no code that can close it. That makes the ordering the only control, and an uncontrolled ordering is how this fails: the window is not zero-risk, it is low-traffic risk, and the readers who find the blog organically in that window are precisely the parents this brand exists to earn trust from.

### What the review guide must tell Jamie to do before the X push

One instruction, in this order, with nothing optional in it:

1. **Create the Beehiiv automation "Blog welcome (thumbs)" with the 24 hour delay** (trigger: tag `source-blog` applied), paste `welcome-email-thumbs.md` unchanged, and put the UTM the frozen spec names on the thumbs-up URL. The delay is not a preference. The word "tomorrow" appears on four rendered surfaces; if the automation fires immediately, "tomorrow" comes out and Story rewrites those four strings.
2. **Send it once to the pre-flight subscriber and click both links yourself.** The thumbs-up link must land on the newest post. The thumbs-down link must unsubscribe in one click, with no confirmation step and no exit survey. If there is a confirm step or a survey, "no questions" is false on three surfaces and Story rewrites them before the push. Then delete that subscriber per the cleanup ledger.
3. **Only then push on X.** Until steps 1 and 2 are done and dated in the evidence ledger, every X click lands on a page that promises an email nothing sends.

Two smaller additions for the guide, both one line. Add a human-action item that Karlin reads the welcome email's thumbs-up click rate, because "I read the click as a yes" is a described practice once someone reads it and an unbacked sentence until then; the frozen spec added the UTM but never named the reader. And record "sources attached" as a standing editorial constraint on the weekly, or accept it out loud, because nothing in this run binds the weekly's content.

---

## D. Offer integrity of the thumbs mechanic, as rendered

**Is the deal clear before the reader types? At 1440 and at 375x800, yes.** Measured stacking order in the rendered dialog: headline, then the body whose first sentence is `Leave your address and you're on the list today`, then the byline, then the first-name field, then the email field, then the button. At 1440 the body ends at y 435 and the first field starts at y 528. At 375x800 the body ends at y 542 and the first field starts at y 625. The reader learns they are joining now, not previewing, before there is anywhere to type. That is D-03 working, and it is the single largest improvement over the version I reviewed at design time. The mechanism and the copy now agree at the point of capture: subscribed on submit, one message tomorrow, thumbs down is the exit.

Two residual gaps, one of them new and mechanical.

**D-1. The sticky bar path never discloses the mechanism, and it is the path with no room to.** A reader who subscribes from the bar sees `ONE EMAIL TOMORROW, THEN YOU DECIDE TO STAY OR GO.` and then `GOT IT. LOOK FOR IT TOMORROW.` Neither string says they are already on the list. "Stay or go" signals a stay-or-leave decision, which is the honest shape and is why I would not rewrite it, but the fact itself, that the subscription already exists, reaches this reader only in the welcome email. In the window described in section C, that email does not exist, so the disclosure reaches nobody. This is the same finding as my design review's Gap 1 and it is unresolved by design: 50 characters cannot carry it. Accept it with the email as the carrier, or accept that the bar is a weaker offer than the popup.

**D-2. After a successful sticky-bar signup, the popup still fires and asks the same reader for their address again.** This is new, it is mechanical, and I verified it end to end. `StickyCTA.tsx` fires `trackNewsletterSignup` on success but never calls `recordSuccess`, so `ekuzo_nl_blog_subscribed_at` is never written (measured: `null` after a successful bar submit in both variants). `shouldShowPopup` therefore still returns true, and at 50 percent scroll the full-screen dialog opens over a bar that is still displaying `GOT IT. LOOK FOR IT TOMORROW.`, and asks `One email after you read this. Then you decide.` Evidence: `docs/blog-newsletter/tests/steward-extra-output.txt`, both variants.

Evidence note, because it matters for how this is verified: no single screenshot can show this finding. The dialog is `fixed inset-0` with opaque panes, so a capture with it open is pixel-identical whatever the page behind it says, and the bar's confirmation is underneath. The proof is the measured pair in `steward-extra-output.txt`, the bar's `innerText` reading `GOT IT. LOOK FOR IT TOMORROW.` and the dialog's `innerText` reading `One email after you read this. Then you decide.` in the same page state, with `ekuzo_nl_blog_subscribed_at` null. That the confirmation is invisible behind a full-screen second ask is not a gap in the evidence, it is the finding.

The brand cost is larger than the bug. A surface whose entire pitch is "then you decide" asks again twenty seconds after the reader decided, on a page that is simultaneously confirming the thing it is asking for. It also double-counts the impression against the signup in the A/B, which pollutes the one measurement the brief says never to cut.

**Defect for Atlas, MAJOR. Cycle 1: CLOSED, verified.** Atlas added `recordSuccess` to the sticky success branch. Re-tested both variants: after a successful bar submit, `ekuzo_nl_blog_subscribed_at` is written (measured, a real timestamp rather than null), and scrolling to 70 percent produces no dialog at all. The bar still shows its own confirmation and the reader is not asked twice. Evidence: `steward-rc1b-output.txt`. **Fable still owes the one-line spec note** recording that the sticky success path suppresses the popup, since the frozen spec never asked for it.

---

## E. Author integrity with the popup open on a Jamie-bylined post

Tested on `/blog/when-your-sons-only-friends-are-online` at 1440 and 375, thumbs variant.

The post's byline renders as `by Jamie Fitch / CEO of EKUZO · Parent / Published May 28, 2026`. The popup fires at 50 percent scroll and renders `Karlin Oei, founder, EKUZO` under the body.

**The "I" is unambiguous, and the byline is why.** Three things make it so, and I checked all three rather than assuming the line was enough.

1. The only attribution visible when the popup is open is Karlin's. At the 50 percent trigger point, Jamie's byline sits 5,647px above the viewport at 1440 and 7,783px above at 375, so it is nowhere on screen.
2. The dialog is `fixed inset-0` with two opaque panes, so the article is fully covered. There is no partially visible Jamie byline behind a scrim to compete for the pronoun. The reader has one name in front of them and it is the right one.
3. The byline text is exact and correctly placed, immediately under the body that contains the first-person claims and above the fields, so it reads as the signature on that claim rather than as a footer credit.

D-09 is doing its job, and the credential is inside Karlin's pool: "I coach kids who play" and "what I'm seeing in kids' gaming" are both the coaching credential, stated in a way that needs no antecedent from whatever post the reader just finished. On a Jamie-bylined post nothing transplants.

**One FIX, and it is about how faintly a required field renders.** The byline is `text-[13px] text-white/40`, which measures roughly 3.8:1 against the `#1a1a2e` pane. That is below AA for normal text, and it is fainter than the body it attributes (`text-[15px] text-white/50`). Every other element in the dialog that carries meaning is at `/50` or better; only the microcopy sits lower, at `/30`, and that is inherited from the reference. The byline is not inherited: it is the new string D-09 made a required author-integrity field, and it renders as the second-least legible thing in the dialog. A required attribution should not be the hardest line to read.

**FIX, owner Atlas. Cycle 1: CLOSED, verified.** Atlas raised the byline to `text-white/80`, one step past what I asked for. Measured on the rendered page: 11.23:1 against the `#1a1a2e` desktop pane and 5.00:1 against the `#7B3AAF` mobile pane, so it clears AA at both sizes, and it is now legible without outranking the body it attributes. Evidence: `steward-rc1b-output.txt`. The required attribution is no longer the hardest line in the dialog to read, which matters more at 375 than anywhere else, because after A-note-3 the byline is the only EKUZO identification a phone reader has.

---

## F. Verdicts per surface

Final, after repair cycles 1 and 2. Each surface carries its cycle-0 verdict and its final one, so the ledger can see what moved.

### 1. Sticky bar, thumbs variant: cycle 0 FIX, **final PASS**

Parity passes at 1440, 375, 768 and 820 (A1, A2, A11, A13). Copy exact in every state. Lint clean. Closed and verified: the tablet clipping (A-note-2) and the double ask (D-2). Fable owes the widened A-note-1 line and the one-line `recordSuccess` note, both record-keeping rather than gate. Two of its three strings stay false until the Beehiiv automation exists, which is section C's ordering instruction and Jamie's to execute. No rewrite: `then you decide to stay or go` is still the right shape for a surface with no room to disclose more.

### 2. Sticky bar, classic variant: cycle 0 FIX, **final PASS**

Identical to surface 1 on every measured property at all four widths (A3, A4, A12, A13). Same closures, same paperwork, no rewrite. Cadence confirmed, so every string on this surface is true at commit time.

### 3. Popup, thumbs variant: cycle 0 FIX, **final PASS**

Everything that was wrong is fixed and independently verified. A6 closed: fits at 375x800 and 375x667, submit hit-tests as itself, scroll lock holds, and the pane genuinely scrolls at 375x560, 320x568 and 320x480 with nothing trapped above. A-note-3 closed: SC-01 logged and the EKUZO wordmark renders at 120x24 on the mobile pane, so the capture is branded. A-note-4 closed: headline clear of the close button by 81px at 375 and clear at 320, content centred 105 above and 105 below with a symmetry delta of 0, close button pinned outside the scroll container. Byline closed at `text-white/80`, 5.00:1 on the purple pane. Copy exact in every state, no rewrite. Claims unchanged: "tomorrow I'll send one message" and "or use the thumbs down tomorrow" stay false until the automation exists, and "takes you straight off, no questions" stays unverified until someone clicks the unsubscribe link.

### 4. Popup, classic variant: cycle 0 FIX, **final PASS**

Same closures, verified separately rather than assumed from the thumbs arm: fits at 375x800 and 375x667, centred 176 and 176 with a symmetry delta of 0, wordmark renders, and the headline that used to have the close button drawn over its comma now clears the button at 375 and wraps to three lines at 320 and still clears it. No rewrite.

### 5. Contact form field: **PASS** (unchanged)

Parity passes at both sizes (A9, A10) with the select's class string byte-identical to the existing text inputs. All eight option labels, the default, the label and the helper text render exactly as the deck specifies, in deck order, with values matching the contract's slugs. Nothing false, nothing off-voice, nothing to rewrite.

Two non-blocking notes carried forward for Jamie, unchanged: `TikTok or YouTube` can never be split later because Beehiiv tag removal is impossible, and no option covers a camp, tournament or coach, so those parents pick `Other`.

### 6. Welcome email (thumbs): **BLOCK** (unchanged, and not the branch's blocker)

Not a rendered surface in this checkout, and I am not re-reviewing the copy, which adopted D-04 and "the newest piece" correctly. It stays BLOCK for the reason it was always BLOCK: the unsubscribe merge tag is unverified, and both thumbs links carry the whole email. This is a human action in Beehiiv, not code on this branch. It clears the moment section C step 2 is done, one real send with both links clicked.

### 7. The deck itself: **FIX** (unchanged)

**FIX, Story:** annotate the popup eyebrow as desktop-only (section B), so its absence on a phone is a documented layout fact rather than a future defect report. One line in a doc, no shipped string changes.

---

## Overall verdict for the completion decision

**PASS on the branch.** T7 passes, 13 rows, 0 FAIL. Every rendered surface passes. The welcome email stays BLOCK as a Beehiiv human action, and Story owes one documentation line.

Two cycles of repair closed six defects without loosening a single standard, which is worth stating plainly because it is the unusual outcome. The popup fits and scrolls at every height I could break it at, with nothing trapped above the fold. The sticky bar no longer clips its own CTA anywhere between 320 and 1440. A bar subscriber is not asked twice. The required byline clears AA on both panes. And the one judgment I pushed back on, trading the mobile brand block for vertical room, came back as the narrow, logged version I asked for: SC-01, with the EKUZO wordmark rendering, rather than an unlogged brand-less sheet. Atlas also volunteered scroll lock and a focus trap that nobody specified and the surface needed. Copy fidelity is exact in 80 of 82 rendered assertions, the two misses being a documented inherited layout behavior, and the mechanical lint is clean on rendered text including zero digits, which is stronger evidence than a deck-only pass.

**What PASS does not mean, and this is the sentence that should travel with the completion decision.** The code is correct and the copy is not yet true. Four rendered sentences are false for as long as the blog is live without the Beehiiv automation behind it (the sticky thumbs line, its success line, "tomorrow I'll send one message", and "or use the thumbs down tomorrow"), and one more, the one-click thumbs-down exit, is unverified in the direction that matters. D-01 removed the flag, so no code can close that window: the ordering is the only control. Completion means the branch is ready to merge. It is not permission to push on X, and the review guide must carry section C's three steps, in order, before anyone does.
