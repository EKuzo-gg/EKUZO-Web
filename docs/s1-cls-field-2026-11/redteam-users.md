# Red team, users, trust and privacy lens (E2)

Lens: a parent on a phone inside the Facebook or Instagram app. Inputs read: `00-brief.md`, `00-phase0-field-truth.md`, `01-requirements.md`, `app/season1/landing.html` (phone CSS 640 to 700, small script 902 to 915, big script 1001 on), `lib/season1/tags.ts`, `app/api/season-one/route.ts`, `app/season1/thanks/`, and the closed items in `docs/s1-join-sync-2026-11/parent-review.md`, `redteam-trust.md`, `docs/s1-round2-2026-11/steward-review.md` and `03-decision-log.md`. No source file was modified. Nothing was posted. The live pages were fetched with curl only.

Closed earlier and not repeated: repeat and quiet sign-ups reading as the normal confirmation (R3.4), the honeypot success (R2.3), the silent step drop behind the Text Karlin success line (R2-D4, R2-D11), the approved 429 copy (steward review item 2), and hiding the form until the hero is ready (R2-D10, "a blank screen of about 7 s"). Where a finding touches one of these it says so.

## Method and limits of the lab evidence

I loaded the live d18, d19 and d4 HTML (saved by curl, served to Chromium through request routing so the document itself arrives instantly) with every subresource going to the real ekuzo.gg, gstatic and Google Fonts. Profile: 412x915, Facebook Android UA with `FB_IAB/FB4A`, CPU 4x, 1.6 Mbps and 150 ms latency. GA4, Pixel, Clarity and doubleclick were aborted (3 blocked requests each run, zero reached the vendors). This is desktop Chromium, not a WebView, and it omits HTML transfer time, so every number below is a floor. Screenshots are in the scratchpad (`ft/ft/d19-1s.png`, `d19-3s.png`, `d18-1s.png`, `d4-0.6s.png`) and are not committed.

| Ad | First paint (blank canvas) | First contentful paint | Fonts CSS (start to end) | Hero image request start | Hero image done | LCP element, time |
|---|---|---|---|---|---|---|
| d18 | 536 ms | 836 ms | 108 to 796 ms | 1050 ms (laughing.webp, 41 KB) | 1883 ms | `IMG.ph`, 1912 ms |
| d19 | 588 ms | 884 ms | 65 to 518 ms | 740 ms (two files, 145 KB + 93 KB) | 2421 and 2664 ms | `IMG.jb`, 2460 ms |
| d4 | n/a | text and options painted in the first frame we captured (0.6 s) | n/a | n/a | n/a | n/a |

What the filmstrip shows. At 1 s on d19 the headline, sub line, blue button and the whole sign-up form are painted in the right fonts, with a dark void where the two photos will go. At 3 s the photos are in. On d18 the photo is in by 1 s. On d4 the interactive hero is already built in the first frame; the reserved box is not seen at all in this lab.

## Ranked findings

Severity is the effect on sign-ups for a parent in an in-app browser. Type codes: code-bug, spec-gap, accepted-risk, improvement.

| ID | Sev | Type | Effect on sign-ups | File:line | Proposal |
|---|---|---|---|---|---|
| U-1 | High | spec-gap | Every page-A and interactive variant shows nothing until `fonts.googleapis.com` answers (32 KB wire, 158 KB parsed, 226 `@font-face` rules); if that host stalls the page stays blank and no form handler ever attaches | `landing.html:7`, `:3` | Treat the blocking CSS as the first-paint problem; shrink it per ad (about 45 rules, 17.8 KB parsed for d19) or self-host, and add a "fonts host stalled 8 s" harness profile |
| U-2 | High | spec-gap | L2 as written buys at most about 250 ms of a 1.9 s image wait, because the small script in the body is held behind the same stylesheet | `landing.html:902` (small script), `01-requirements.md` L2 | Put the preload in the head (a sync inline script beside `{{TAGS}}`) so it starts at about 110 ms, and gate it on FCP not regressing |
| U-3 | High | spec-gap | L3 as written can leave the interactive hero's headline permanently undersized (pixel-parity break, visible), because `document.fonts.ready` resolves before late CSS even exists | `landing.html:1340-1351` | Add a must-hold: `fitHero` reruns on `loadingdone` and on the font stylesheet's `load`; test with CSS delayed 3 s |
| U-4 | Med | spec-gap | A parent can tap "Save their spot" before its handler exists and nothing happens; on interactive pages a typed email is lost when the form is moved into the hidden answer panel. L2 and L3 widen both windows | `landing.html:919, 957` (`action="javascript:void(0)"`), `:1331` | Hide the original form in `pre-ih` state (space kept, `visibility:hidden`), and add a pre-ready submit stub that replays on ready |
| U-5 | Med | code-bug | Session replay may record typed email and phone: no `data-clarity-mask` on the landing's email, tel or confirmation card, only an assumption about the Clarity project mode | `lib/season1/tags.ts:165`, `landing.html:919-960, 981-984` | Add the attribute (no pixel change), confirm the project's masking mode, add a landing test beside the P1 mask tests |
| U-6 | Med | spec-gap | A per-ad font list that omits one painted family silently shows Arial in part of the page (X2 breach that N1 may not catch at 0.1%) | `01-requirements.md` L3, X2 | Derive the list from template data, and add a DOM check that every computed primary family is a requested family |
| U-7 | Med | improvement | The first thing a parent sees is a white canvas (lab: 536 ms, 300 ms before any content), then dark; on slow phones that is the "blank" | `landing.html:1-8` | Inline `html{background:#0B0A0D}` at the top of the head |
| U-8 | Med | code-bug | After tapping, the button reads "Saving…" with no timeout; a stalled connection leaves it disabled until the parent reloads and retypes | `landing.html:1424-1449` | Client `AbortController` at about 15 s, then the existing "Check your connection" text and a re-enabled button |
| U-9 | Med | spec-gap | The landing collects an email and a phone number and runs three trackers with no Privacy Policy link (the thanks page has one); geo is also stored and never disclosed | `landing.html:970` (footer), `route.ts:114-124` header note | Jamie decision: add the footer link (copy is locked, so not mine to add) |
| U-10 | Low | spec-gap | The Text Karlin fine print reads as a joke more than a consent, names no sending number, and promises "soon" | `landing.html:986` | Flag only (copy locked); Steward or Jamie to judge |
| U-11 | Low | code-bug | The 429 text gives a phone number as plain red text and re-enables the same button, so the likely next tap is a second 429 | `landing.html:1448-1449`, `route.ts:604` | Render the number as an `sms:` link without changing the words; keep the button |
| U-12 | Low | spec-gap | `fitHero` reruns on every `resize`; Android in-app toolbars collapse during scroll and change `innerHeight`, which can change headline size on d1 to d10 before an answer | `landing.html:1351` | Add the journey (viewport height drops 56 px mid-scroll) and measure shifts |
| U-13 | Low | accepted-risk | On WebViews older than Chrome 108 or 105, `svh` and `cqw` declarations are dropped: the reserved boxes become 0 and the ad art loses its type scale | `landing.html:654-656`, `:54` | Add `80vh` before `80svh`; accept the rest; log the field share from Clarity |
| U-14 | Low | improvement | Tap targets under 44 px: header mini button (about 34 px), FAQ summary (about 22 px) | `landing.html:645, 689` | Pad the summary (not the details); mini button is hidden until scroll, accept |
| U-15 | Low | spec-gap | 200% text zoom is unverified: page A's cqw type may clip inside the fixed 4/5 box; interactive heroes may exceed the 80svh reserve | `landing.html:652-656` | One real-device check on the S25 at the largest font size; the harness cannot emulate WebView text zoom |
| U-16 | Low | improvement | Reduced motion is ignored by smooth scrolls, the sticky bar transition and the confirmation fade | `landing.html:1337, 1410, 696` | Guard JS `behavior` with `matchMedia`; additive |
| U-17 | Low | improvement | A hidden confirmation avatar (14 KB) loads at the start of the critical window; hero and tag scripts all start within 120 ms of each other | `landing.html:979` | `loading="lazy"` on the avatar; measure before touching the tag order |
| U-18 | Low | improvement | A 500 or 502 from the server shows "Check your connection", which blames the parent | `landing.html:1463` | Keep as is unless copy is reopened; note for the next copy pass |
| U-19 | Low | improvement | Page A has no h1; the hero is `role="img"` so screen readers never read the headline; `.ih-resp` is a live region that contains the whole form | `landing.html:1248`, `:1328` | Flag for Aaron; no change this run |

## Detail

### U-1 and U-2: where the blank really is

The fonts stylesheet sits in the body at line 7, before the first-party `<style>`. A stylesheet in the body holds back rendering of what follows it and holds back every script after it. So the first paint, the small script, the big script that builds the hero and the handlers that make the form work all wait for one request to a third-party host. In the lab that request finishes at 518 to 796 ms with an instant document; on a real slow phone the TLS handshake alone is several round trips at 150 ms. The 158 KB of rules (16 families, 226 `@font-face` blocks) also has to be parsed at 4x CPU.

The reserved boxes (`landing.html:654-656`) are therefore not the blank a parent sees. They show only if a paint lands between the CSS arriving and the big script running, which needs the HTML to arrive in pieces. In my capture d4 had already built its hero in the first frame. The blank a parent sees is before first paint, and in the lab the browser painted a white canvas at 536 ms and the first content at 836 ms. In an in-app browser that white is the thing a parent sees while the ad's promise is still in their head.

Consequences for the spec:

1. L3 says to stop the stylesheet from blocking. If it stops blocking, the reserved box becomes the first thing painted in the field, which makes S5 ("stay as shipped") riskier than it looks. Making the blocking request small keeps first paint a complete page. For d19 the three families the page needs (Inter Tight 500/700/800, JetBrains Mono 500/700, Rubik 500/900) are 45 rules and 17.8 KB parsed, about a ninth of today. Self-hosting those woff2 files removes the third-party hop and the single point of failure, and it is the only way to preload the exact font file (Google's gstatic URLs carry a version segment).
2. L2 puts the preload in the small script. That script is inside `.lp`, after the stylesheet, and cannot run until the stylesheet has loaded. Measured gap from stylesheet end to the hero image request: 222 ms (d19) and 254 ms (d18). So the preload as written recovers about a quarter second of a wait of 1.7 to 1.9 s. A preload created by a synchronous inline script in the head starts at about 110 ms, in parallel with the fonts request. The ad id has to be parsed there too (the head runs before `AD_HERO` exists, so the small list of photo-hero ads and their files must be in that script, one source with the big script's `IMG` map).
3. The head preload competes with the render-blocking stylesheet on a 1.6 Mbps link. 145 KB of image takes about 0.7 s of pure transfer. `fetchpriority=high` on the largest hero image only (d19: `team-walk-1600`, not `southie-back`), and a gate that FCP on `fb-android` Slow 4G is not later than main, keeps the parent's first screen from getting slower while the photo gets faster.
4. Add a harness profile where `fonts.googleapis.com` is delayed 8 s (not blocked, delayed), because a block fails fast and a stall does not. Today the page is blank for the full delay and the form never works. The thanks page has the same blocking stylesheet in its head (`thanks.html:12`).

### Question 1 answer: blank versus a small shift

A blank or logo-only screen for several seconds is worse than a small shift. A shift under 0.1 is a small move of a section the parent has not yet read. A parent who tapped an ad about a jersey and sees a white or dark void for 3 seconds has lost the thing that made them tap, and abandonment from a slow first screen is not recorded as a shift, it is recorded as no session. Round 2 reached the same view (R2-D10) when it declined to hide the form.

That said the choice is not binary. The order that serves the parent is: dark immediately, text and the form next, photos last.

What the reserved box should show:

- Page A (d18, d19 to d21 and the rest of page A): nothing but the ad's own background. The lab shows the text already carries the page without the photo. For d5 and d11 the art background is `--ink`, which is the page's colour, so the box is invisible. No skeleton and no shimmer: a pulse tells a parent "loading" and draws the eye to the empty part.
- Photos: a short opacity fade (150 to 200 ms) on `img.ph` and `img.jb` when they decode, so the photo does not pop. This changes nothing once loaded. It is optional and Aaron's to veto.
- Interactive heroes (d1 to d10): the box stays ink. For `shortlist` (d4, d5, d9) the built hero is the ad's own colour (the purple in the d4 capture) and the box is ink, so if a paint ever lands between, a dark panel turns purple. If Atlas wants to remove that, a two-line per-ad colour table in the small script is enough, at the price of duplicating palette data that drifts. I rate it low and would not do it unless the harness shows the box is actually painted in the field.
- Before first paint: `html{background:#0B0A0D}` inline at the top of the head, so the first paint the parent sees is the dark page and not white (U-7).

### U-3 and Question 2: what must hold for the font swap to be invisible

Today the display type already swaps: the CSS carries `display=swap`, the hero text is built, then the font file arrives (lab: Inter Tight woff2 about 1.5 s on d18, Rubik 1.74 s on d19, after the CSS), and the hero redraws. A parent on a slow phone sees Helvetica or Arial bold caps for a moment, then Inter Tight or Rubik. L3 can shorten or lengthen that moment. For it to read as nothing, all of these must hold:

1. `font-display:swap` stays (X3 is right: `optional` would leave the fallback on the slowest phones, which are the ones in this audience).
2. The font file request starts no later than it does today. With self-hosted woff2 and `<link rel=preload as=font crossorigin>` in the head for Inter Tight and the ad's display family it starts at about 110 ms instead of after the CSS.
3. The fallback face matches the real font's metrics (a local Arial `@font-face` with `size-adjust`, `ascent-override`, `descent-override`, `line-gap-override` per family). Without it `text-wrap:balance` headlines in cqw units re-wrap on swap, and Inter Tight is narrower than Arial so the headline gets an extra line first.
4. `fitHero` must re-run when fonts arrive. It measures the hero and shrinks `--ds` until it fits in 80% of the screen. Its rerun hook is `document.fonts.ready.then(fitHero)` (`landing.html:1350`). That promise resolves when no font is loading. Today the blocking CSS guarantees faces exist when the script runs, so the first layout starts the loads and `ready` waits. With the stylesheet async, `ready` can resolve immediately, before the CSS exists, and `fitHero` never runs again with real metrics. It would size the hero against Arial (wider), shrink `--ds` too far and keep the smaller headline after the real font loads. That is visible and permanent on d1 to d10, and it breaks N1. Required: rerun on `document.fonts` `loadingdone`, on the stylesheet `load`, and on `load`. Test: delay the font CSS 3 s and compare the headline's computed size to main.
5. The per-ad family list must cover everything the page paints (U-6): Inter Tight (`--ui`, so every ad's body copy and the join form), JetBrains Mono (kickers and `.top small`), the ad's display family, and any hard-coded family in an ad's template or module (Archivo and Archivo Black appear in the d2 overheard module at `landing.html:714-715`; Rubik is hard-coded in d11's `h3`, `.sub` and `.cta`). Derive it from `D`, `T` and the CSS, not a typed list, and add a DOM check: for every text node in the page, the first family in its computed `font-family` appears in the requested set.
6. Measure first paint, not only CLS: a faster hero with a later FCP is a worse outcome.

### U-4: the form before its handler

The form is `method="post" action="javascript:void(0)" onsubmit="return false"` (`landing.html:919`). Its real handler attaches in the big script near line 1430. Between a paint of the form and that line a tap on the button does nothing and says nothing. Today the blocking CSS mostly keeps those two close together. L2 and L3 move paint earlier than script execution, which lengthens the window on exactly the slow phones in the field.

On interactive pages there is a second hazard: the page's own form is moved into the hidden answer panel (`landing.html:1331`, `.ih-resp{display:none}`). In `pre-ih` state the top of the join section peeks in below the 80svh box. A parent who taps it and types before the script runs loses the focus, the keyboard and the text when the form moves. This is rare and gets more likely with L3.

Proposals, none of which change a rendered pixel after load: (a) `.lp.pre-ih:not(.has-ihero) > #join-top{visibility:hidden}` inside the existing phone media query, since that form is never seen in its final state on those pages; (b) a four-line inline stub on both forms that remembers a pre-ready submit and replays it when the real handler attaches. A `<noscript>` line is a copy decision and is Jamie's.

### U-5 and Question 3: privacy

| Question | Finding |
|---|---|
| Email or phone in a URL | No. The forms use `method="post"` with a dead `action`, so a failed script cannot fall back to a GET that puts an email in the address bar. The phone and email travel only in a JSON body to `/api/season-one`. The share link adds `ad`, `hero` and two UTM keys only (`landing.html:1494-1497`). |
| GA4 | Events carry ad, hero, location, FAQ slug, and the reasons `invalid_email`, `network`, `server`. No email, no number, no game chips. `page_location` on the landing is the full URL including `fbclid` and UTMs because the landing does not use the address-bar allow list (`route.ts:20` passes `""` for `{{URL_ALLOW}}`). No child data in it; by design. Note the thanks page does send the game answer to GA4 (`season1_play_answer`, `thanks.html`), and its URL carries `?play=`. That was a decision, not new. |
| Meta | Pixel autoConfig is off, no advanced matching, `Lead` carries `content_name` and an `eventID`. The Text Karlin step and the games step are never sent to Meta. Server CAPI was not re-read. |
| Clarity | Loaded on the landing (`CLARITY_PAGES.landing = true`). The landing carries no `data-clarity-mask` anywhere. `tags.ts:165` says "Typed inputs are masked by Clarity", which is true only for the masking mode set in the project. I cannot read the project setting. The email input, the tel input, the "Chat with our founder" card and the pressed state of the game chips (child's games, as text in the DOM) are all inside the replay. Fix: add `data-clarity-mask="true"` to the two email inputs, the tel input and `#tk` (an attribute, no pixel change), confirm Settings, Masking in the Clarity project is Balanced or Strict, and add a landing test beside the P1 mask tests (`lib/season1/__tests__/tags.test.ts:348`). Jamie can check the setting in two clicks; I would not rely on a recollection of the default. |
| Preload and the ad id | A same-origin preload for `/images/season1/jersey/team-walk-1600.webp` adds no new third party and puts no parameter in the URL. The image request's Referer is the full landing URL (including `fbclid`) to ekuzo.gg itself, as today. The new exposures to watch are different: a per-ad Google Fonts URL tells Google which variant a visitor is on through its `family=` list (Referer is origin-only under the default policy, so no query string reaches Google); and any `crossorigin` preload to a third party. Self-hosting fonts avoids both and removes two third-party hosts from the critical path. M3 should read "no new request to any new host and no new ad-specific data to any third party". |
| Geo and timezone | Every sign-up stores Netlify's city, region, postal and tz in Klaviyo (`route.ts:106-114`). The landing says nothing about it (see U-9). |

### Question 4: trust, as the visitor reads it

Copy quoted as shipped, flagged only.

- Invalid email: "Check the email address and try again." Human, recoverable, focus returns to the field. Fine. It does not catch a typo that still has a dot (`gmial.com`); a "did you mean" would be a copy decision and a likely small gain.
- Network failure: "That didn’t go through. Check your connection and try again." Recoverable. It is also what a parent sees for a server 500 or 502 (`landing.html:1463`, U-18), which blames their connection when the fault is ours.
- 429: "We couldn’t save your sign-up just now. Text our founder at (832) 271-0150 and we’ll add you by hand." The copy is approved and human. As rendered it is plain 14 px red text (`.join .err`, `#FF8B8B`), the number is not a link, and the button is re-enabled with "Save their spot" so the obvious next tap repeats the 429 until the clock hour turns (U-11). On a phone the fix is an `sms:` link around the number, same words.
- Button states: "Saving…" then either the card or an error. With no client timeout, a stalled request leaves "Saving…" on a disabled button (U-8).
- Confirmation: "You’re on the list" / "Awesome." / "We can’t wait to make screentime the highlight of your day too." / "Check your inbox for a note from Karlin, our founder." For an ad about a jersey or a not-sporty kid the "screentime" line is the generic version; I flag it as ad-scent only. The inbox promise depends on a welcome flow. The route's header says none existed when it was written (`route.ts:63-65`); the thanks page promises "It lands in your inbox in two days." I could not verify the flow from here. If it is not live, both lines are promises with no sender. Ops or Steward should confirm before Wednesday's move to the main ad set.
- Text Karlin: "Have questions and want to talk to a human? Leave your number and I’ll text you myself." followed by "By submitting your number you agree to text a real human, and you are in fact a real human. Karlin texts you himself, from his own phone. No marketing list, no automated texts. Msg and data rates may apply. Reply STOP any time." The second sentence reads as a joke in the one place a parent wants plain words about their number; "agree to text a real human" does not say who texts whom. It never says which number Karlin will text from, so the text arrives from an unknown number. "Reply STOP any time" implies an automated system that the same paragraph says does not exist. The success line "Got it. I’ll text you soon. – Karlin" gives no time. The server note says the number is stored as a plain property with no SMS consent (`route.ts:95-101`), which fits "no marketing list". Nothing on the card says location is also stored. Copy is locked; this is for Jamie.
- Thanks page: reached from an email link, so a parent with no `?play=` sees "Got it. Thanks." and "Thanks, that helps." with nothing saying what was recorded. With `?play=` the h1 changes after load (`thanks.html` script) from "Thanks." to the game name, which can add a line; the script sits at the end of the body so it usually runs before first paint. Low.
- Landing footer: "EKUZO · Youth esports with real coaches" and a bare `ekuzo.gg` link. No Privacy Policy or Terms link (U-9). The thanks page footer has "EKUZO Inc. · Privacy Policy". Meta's Business Tools terms ask advertisers to give notice of pixel use, and a lead page with email and phone is where a parent looks for it. Not a conversion blocker; an account and trust risk.

### Question 5: accessibility on phones

- Focus order into the moved form: DOM order is header, `#ihero` (options, answer panel containing the form, skip button), then the rest. After an answer the next Tab reaches the form. After "Just join the list" the skip button is hidden while focused, focus drops, then the script focuses the email at 400 ms (`landing.html:1382`). Acceptable. The whole answer panel is `aria-live="polite"`, so opening it announces the form and any error text; verbose, not blocking.
- Tap targets measured from CSS: header mini button about 34 px tall (`:645`, hidden until scroll), FAQ summary about 22 px tall because the padding is on `details` not `summary` (`:689-690`), footer link 13 px. Submit, email field, game chips (52 px), option rows (56 px), `.ih-skip` (44 to 54 px) and the sticky bar are fine.
- Focus rings: buttons and summaries have a 3 px white ring. The email and tel inputs remove the outline and show a 2 px accent border, which reads on the dark field.
- Reduced motion: `prefers-reduced-motion` covers header transitions, the answer fade, the shortlist underline and the achievement chip. Not covered: `scrollIntoView({behavior:"smooth"})` (`:1337, 1410`), the sticky bar slide (`:696`), the confirmation overlay.
- Text zoom 200%: Page A's headline is in container units inside a fixed 4/5 box with `overflow:hidden`. If the WebView text zoom scales those computed sizes, the sub line and button can clip; no layout shift, but the button the parent should tap is gone. `fitHero` handles only interactive heroes and only to a floor of 0.5. On `pre-ih` pages the reserve is a minimum of 80svh, and at 200% the built hero can exceed it, moving everything below. Neither is testable in desktop Chromium. One check on the S25 with the largest font size, in the Instagram in-app browser, d19 and d4.
- The viewport meta allows pinch zoom. Good; keep it.

### U-8: no client timeout

`post()` is a bare `fetch` (`landing.html:1424-1426`). The server's own budget is 6.8 s worst case, but a parent in an elevator or on a 2G fallback never reaches the server and fetch does not time out for minutes. The button stays disabled on "Saving…", and the only recovery is a reload that loses the email. A 15 s `AbortController` that falls into the existing network message, with the same `eventId` reused on retry (already the behavior), is the whole fix.

## Missing journeys and must-nots (paste into 01-requirements.md)

Journeys (section G)

- J8 Fonts host slow, not down: `fonts.googleapis.com` delayed 8 s. First contentful paint must still be under 2.5 s on `fb-android` Slow 4G, the form must work, and no text may remain invisible. Today this journey is blank for the whole delay.
- J9 Fonts host blocked (content blocker, data saver): the page renders in fallback fonts, `fitHero` still fits the hero, the form works.
- J10 Early tap: tap "Save their spot" and type in the email field at 300, 600 and 1000 ms after the first visible form on d19 and on d4. Nothing may be lost, and a submit before the handler exists must run once the handler attaches.
- J11 Viewport height drops about 56 px mid-scroll (toolbar collapse) on d1 to d10 before any answer: no headline size change after the first fit unless the screen genuinely changed, and shift under 0.01.
- J12 Stalled sign-up: POST delayed 30 s. After the client timeout the button is re-enabled, the email is still in the field, and a retry reuses the same `eventId`.
- J13 iPhone in-app (Facebook or Instagram iOS, WKWebView): 80svh, 4/5 box, `text-wrap` and the fitHero fit checked on a real iPhone or in WebKit; Aaron's phone covers it.
- J14 Old Android WebView (Chrome 100 class): the page is usable, the form works, reserved boxes fall back to `vh`.
- J15 Return visit after a sign-up (`ekuzo_s1_joined` set): the page still loads normally and the form works (R3.7 covers shared devices).
- J16 Second tap on the 429 path: the number is tappable as an `sms:` link and the button does not hide the error.
- J17 Largest system font size (200% where the device allows), page A and interactive: no clipped button, no hidden form, shift under 0.1. Human check on the S25.
- J18 Samsung Pass or Google autofill fills the email, then the parent taps the sticky bar: no `form_start` until a real click (X7 holds), and one sign-up.

Must-nots (section H)

- X9 First paint must not be gated on a third-party host. A stalled font host may delay font swap only.
- X10 The first paint must be the page's own dark background, never a white canvas.
- X11 `fitHero` must not be the only place a font load is waited on: it reruns on `loadingdone`, the font stylesheet `load` and window `load`, and after a delayed-CSS run the headline's computed size must equal main's.
- X12 A preloaded hero image must not delay first contentful paint on `fb-android` Slow 4G beyond main's value; the preload is per ad, one hero image per `fetchpriority=high`.
- X13 The per-ad font request must include every family any painted text node uses, proved by a DOM check of computed families against the requested set.
- X14 No ad-specific data goes to a third party through the font or image requests (self-host, or a request that does not vary by ad).
- X15 A visitor's typed email must never be discarded by a script move. In `pre-ih` state the original form is not interactive.
- X16 A tap on submit before the handler attaches must not be silently dropped.
- X17 The landing's email, phone and Text Karlin fields carry `data-clarity-mask="true"` and a test asserts it.
- X18 The sign-up button must not stay on "Saving…" past a client timeout.
- X19 The 429 number is tappable without changing the approved words.
- X20 `100svh` and `80svh` declarations are preceded by a `vh` fallback inside the existing phone media query; no change at 960 and up.

Process notes for Fable

- H7 needs a second faithfulness check this lens would add: the harness must reproduce a blank first paint on main when the font host is delayed (J8), or its first-paint numbers cannot be trusted for L3.
- The harness should record first paint and FCP per run (H4 lists LCP and layout shifts but not FCP). U-1 to U-3 are judged on FCP.
- Ask Jamie only about U-9 (privacy link on the landing) and, if he wants it, the Text Karlin wording (U-10). Everything else is Atlas and Chronos work inside the locked design.
