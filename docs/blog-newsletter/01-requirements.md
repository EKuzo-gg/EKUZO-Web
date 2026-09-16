# 01 Requirements: blog newsletter capture (A/B) + inquiry-form attribution

Author: Fable. Inputs: 00-brief.md, scout-map.md (Scout, 2026-09-15). Status: Auditor SIGN-OFF 2026-09-15; Phase 2 amendments T4 (fallback thumbs, in-memory guard) and T9 (impression event) added by Fable under the frozen spec; copy per 02-copy-deck.md v2.

Every requirement has an ID, an owner role, an acceptance criterion a Sentry can check, and a gate type (M = mechanical artifact, H = human checkpoint).

## A. Product requirements

| ID | Requirement | Owner | Acceptance criterion | Gate |
|---|---|---|---|---|
| P1 | On blog post pages (pathname starts with `/blog/` and is not `/blog/author/*` and not `/blog`), the sticky bottom bar is a newsletter bar: one line of copy, an email input, a submit button. No Enroll button, no Talk to Humans button. | Atlas | Playwright: on `/blog/gaming-study-13-7-years-younger-what-it-means-for-kids` after scrolling past 300px, the fixed bar contains an `input[type=email]` and no text "Enroll my gamer" or "Talk to Humans". Screenshot at 1440 and 375. | M |
| P2 | The newsletter bar keeps StickyCTA's existing behavior: hidden until scrollY > 300, hidden when the site footer is in view, hidden when a Contact/Enroll modal is open. | Atlas | Playwright: bar absent at top, present mid-page, absent when footer intersects viewport. | M |
| P3 | Submitting the bar posts `{ email, utm_source: "blog", utm_medium: "sticky", utm_campaign: <variant> }` to `/api/newsletter` and shows a success state in place ("You're in." or Story's copy); errors show inline without navigating away. | Atlas | Playwright intercepts `/api/newsletter` and asserts the JSON body; success state visible after a mocked 200; error text after a mocked 500. | M |
| P4 | On blog post pages, a newsletter popup appears when the reader has scrolled to 50% of the document height, once per browser per 30 days, never on page entry. It does not appear on `/blog` (index), `/blog/author/*`, or any non-blog route. | Atlas | Playwright: fresh context, load post, wait 5s at top: no dialog. Scroll to 50%: dialog appears within 1s. Reload: no dialog (dismissed timestamp stored). Set stored timestamp to 31 days ago, reload and scroll: dialog appears. Load `/blog` and `/`: scroll to bottom, no dialog. | M |
| P5 | The popup carries one of two copy variants, "thumbs" or "classic", assigned 50/50 at random on the reader's first blog-post visit and stored in localStorage (`ekuzo_nl_variant`). The same browser always sees the same variant, in the popup and in the sticky bar. | Atlas | Node test of the pure assignment function (distribution over 10,000 draws within 48 to 52 percent; deterministic when a stored value exists). Playwright: 20 fresh contexts yield both variants; within one context, popup variant == sticky bar campaign field. | M |
| P6 | Popup copy per variant is exactly the frozen copy deck (02-copy-deck.md), rendered as real text. | Story, Atlas | Copy-fidelity diff: rendered dialog innerText contains every sentence of the deck for the shown variant; zero em-dashes in rendered text. | M |
| P7 | Submitting the popup posts `{ email, firstName?, utm_source: "blog", utm_medium: "popup", utm_campaign: <variant> }` to `/api/newsletter`; success closes the popup after the existing 800ms and suppresses it for 365 days; dismiss (X or Escape or backdrop) suppresses for 30 days. | Atlas | Playwright: intercept `/api/newsletter` with a mocked 200 (success path) and a mocked 500 (error path); assert the JSON body; assert storage values after success, dismiss (X), Escape and backdrop. | M |
| P8 | The popup is accessible: `role="dialog"`, `aria-modal`, labelled, focus moves into the dialog on open and returns on close, Escape closes it. | Atlas | Playwright: dialog element has `role="dialog"`, `aria-modal="true"` and a non-empty `aria-label`; `document.activeElement` is inside the dialog within 200ms of open; Escape closes it and `document.activeElement` returns to the previously focused element. | M |
| P9 | The inquiry form (ContactModal) gains one optional field "How did you hear about us?" as a select with options: X (Twitter), Instagram, TikTok or YouTube, Google search, ChatGPT or another AI, A friend or another parent, My kid's school, Other. Default empty ("Choose one"). | Atlas | Playwright: field present in the modal, optional (form submits without it), value included in the `/api/contact` body as `heardAbout`. | M |
| P10 | `/api/contact` includes the `heardAbout` value in the Resend email to Karlin (line "How they heard about us: ...") and, when present, applies a Beehiiv tag `heard-<slug>` via the existing tag endpoint. No new Beehiiv custom field. | Relay | Unit with mocked fetch (Beehiiv and Resend): the Resend body HTML contains the line; the tag-endpoint body contains `heard-x` for "X (Twitter)". Grep: no new key in `custom_fields`. | M |

## B. Technical requirements

| ID | Requirement | Owner | Acceptance criterion | Gate |
|---|---|---|---|---|
| T1 | `/api/newsletter` accepts optional `utm_source`, `utm_medium`, `utm_campaign` and passes them to Beehiiv create-subscription. Values are validated against an allowlist (`utm_source` in {newsletter-signup, blog}; `utm_medium` in {popup, sticky, footer}; `utm_campaign` in {thumbs, classic}); anything else is dropped, not rejected. Missing values fall back to today's behavior (`utm_source: "newsletter-signup"`, no medium/campaign). | Relay | Unit test with mocked fetch asserting the outbound Beehiiv body for: no utm fields (unchanged from today), valid blog fields (all three present), invalid values (dropped). | M |
| T2 | Blog-sourced signups (`utm_source: "blog"`) get the tag `source-blog` and `variant-<campaign>` via the existing fire-and-forget tag call, in addition to nothing else (they do not get `source-newsletter`). Non-blog signups keep `source-newsletter` exactly as today. | Relay | Unit with mocked fetch: tag-endpoint body per case. | M |
| T3 | The tag call remains non-blocking; a tag failure never fails the signup response. | Relay | Unit: mocked tag 500, route still returns `{ success: true }`. | M |
| T4 | Assignment, storage keys, thresholds and cadence live in one pure module (`lib/newsletterAb.ts`): `getOrAssignVariant(storage, random)`, `isBlogPostPath(pathname)`, `shouldShowPopup(storage, now)`, `recordDismiss(storage, now)`, `recordSuccess(storage, now)`. Keys: `ekuzo_nl_variant`, `ekuzo_nl_blog_dismissed_at`, `ekuzo_nl_blog_subscribed_at`. The 30-day re-ask governs popup re-display only; the variant, once assigned, is never reassigned (so a returning reader stays in the same arm). All storage access wrapped in try/catch; storage unavailable = show popup once per page load (module-scoped in-memory guard, so a private-mode reader is not re-prompted on every scroll or re-render), variant "thumbs" (the preferred arm; decision D-05). | Atlas | Node test file executes (`node --experimental-strip-types` or equivalent) with output in the ledger. | M |
| T5 | The homepage popup stays exactly as today: mounted only when `NEXT_PUBLIC_NEWSLETTER_POPUP_ENABLED === "true"`, 2.5s first-visit trigger, key `ekuzo_newsletter_dismissed`. The blog popup mounts on blog post pages regardless of that flag. | Atlas | Diff of `app/layout.tsx` shows the flag still gating site mode; Playwright: `/` with flag unset shows no dialog after 5s; blog post shows the blog dialog at 50%. | M |
| T6 | `tsc --noEmit` and `eslint` pass on all touched files; the dev server renders every touched route with a clean console (no hydration or invalid-DOM warnings originating from our code). | Atlas, Sentry | Command output in the ledger; console log per page in the ledger. | M |
| T9 | GA4 events via `lib/analytics.ts`: `newsletter_impression` when the blog popup opens (params: variant) and `newsletter_signup` on a successful `/api/newsletter` response (params: source in {popup, sticky}, variant). Without impressions per arm the A/B yields counts, not rates. GA-only, mirroring `trackRegisterClick`. | Atlas | Playwright: stub `window.gtag` (or the ga4 helper) and assert both events fire with the right params; no event on failed submit. | M |
| T8 | The blog popup renders at `z-[9999]` (above StickyCTA's `z-40`), portaled to `document.body` like the existing popup. Neither component hides the other via shared state; the popup simply overlays the bar, mirroring today's NewsletterPopup/StickyCTA relationship on non-blog routes. | Atlas | Grep of the class on the dialog root; Playwright: with the popup open, the bar is still in the DOM and the dialog is on top (elementFromPoint at the bar's location returns an element inside the dialog or its backdrop). | M |
| T7 | Visual parity (ADAPT): the blog sticky bar matches the camps variant of StickyCTA in position, height, padding, font classes and show/hide; only the listed deltas differ. The blog popup matches the existing NewsletterPopup in layout, portal, close button, success state, styling; only the listed deltas differ. The contact select matches the existing input class string. | Atlas, Steward | Side-by-side screenshots in `screenshots/` (`sticky-camps-1440.png` vs `sticky-blog-1440.png`, same at 375; `popup-site-1440.png` (flag forced on, dev only) vs `popup-blog-thumbs-1440.png` and `-classic-`; `contact-before` vs `contact-after`). Steward records PASS/FAIL. | M + H |

## C. Copy requirements (Story)

| ID | Requirement | Acceptance | Gate |
|---|---|---|---|
| C1 | Copy deck `02-copy-deck.md` with: thumbs popup (headline, body, button, success line, microcopy), classic popup (same fields), sticky bar line + button per variant, contact field label + placeholder + option labels, welcome email (subject, body, thumbs-up link text, thumbs-down link text, footer). | File exists; Steward review. | M + H |
| C2 | Every line passes the hard rules in anti-ai-writing.md: zero em-dashes, no negative-parallelism reframes, no engagement bait, no title case in headers, no banned words or transitions. Voice per voice-dna.md and ekuzo-messaging-voice.md (commitment voice; no urgency, no "join our community"). | Mechanical grep for em-dashes and the banned list on the deck; Steward judgment on the rest. | M + H |
| C3 | No claim in the copy or the welcome email needs a fact-library row (no numbers, no studies, no outcomes). If Story wants one, it must map to a register row. | Steward grep of digits and study names in the deck. | M |

## D. Integration requirements (Relay)

| ID | Requirement | Acceptance | Gate |
|---|---|---|---|
| I1 | Executor: Fable, on Jamie's machine via the device shell, because this cloud checkout has no Beehiiv key and cannot run it. Pre-flight against the live Beehiiv publication (read-only): confirm create-subscription accepts `utm_medium` and `utm_campaign` (API docs and a GET of an existing subscription showing the fields), confirm the tag endpoint, list existing automations, confirm whether segments can filter on utm fields. Results into `02-frozen-spec.md` § Pre-flight. | Section exists with fetch date. | M |
| I2 | Executor: Fable, on Jamie's machine only; no live write is possible from this checkout. Any live write during testing uses a disposable identity (`newsletter-test+<timestamp>@ekuzo.gg`) and is logged in `06-cleanup-ledger.md` with the subscriber id. | Ledger rows. | M |
| I3 | Owner: Story (email copy), Fable (human-action list). Welcome email draft `welcome-email-thumbs.md` plus a human-action list for Beehiiv: create automation "Blog welcome (thumbs)", trigger = tag `source-blog` applied (or segment `utm_source = blog`), one email, 24h delay optional, thumbs-down = `{{unsubscribe_url}}` (or Beehiiv's equivalent merge tag, verified in pre-flight), thumbs-up = link to the newest post. | Files exist; human-action list in the review guide. | M |

## E. Non-regression requirements (explicit)

| ID | Surface | Acceptance | Owner | Gate |
|---|---|---|---|---|
| N1 | StickyCTA on `/`, `/programs/ekuzo-camps`, `/programs/ekuzo101`, `/programs/ekuzo100`, `/programs/ekuzo-teams`, `/schools`, `/parents`, and one checkout route (`/programs/ekuzo-camps/register`, where the bar must stay hidden): rendered bar outerHTML identical before and after. | Playwright: capture the bar's outerHTML on each route from the pre-change build (the committed HEAD in a second checkout or git stash) and after; byte-equal. Screenshots at 1440 and 375 both states. | Sentry | M |
| N2 | NewsletterPopup on `/` with the flag unset: no dialog before or after. With the flag forced on in dev: dialog after 2.5s, same copy, same storage key, before and after. | Playwright as described. | Sentry | M |
| N3 | FooterNewsletter: outbound `/api/newsletter` body unchanged (`{ email }`), and the route's Beehiiv body for that call unchanged from today. | Unit test case in T1 (no utm fields case) + grep of FooterNewsletter.tsx diff (must be empty). | Sentry | M |
| N4 | Blog post pages: article text unchanged (innerText diff of `article` before and after is empty on the gaming-study post and one older post). | Playwright diff. | Sentry | M |
| N5 | `/api/contact` without `heardAbout`: email body and Beehiiv payload unchanged. | Unit case with mocked fetch. | Sentry | M |
| N6 | No changes to Stripe, Klaviyo, Sheets code paths. | `git diff --stat` shows no files under `app/api/webhooks`, `app/api/camps`, `app/api/ekuzo100`, `lib/klaviyo*`, `lib/sheets*`. | Sentry | M |

## F. Out of scope (recorded so nobody builds it)
- Changing the homepage popup's copy or enabling it.
- Any Beehiiv custom field.
- Building the Beehiiv automation itself (human action).
- The X bio link.
- Fixing StickyCTA's `querySelector("footer")` bug on camps/101 (logged as a KB backport candidate, not touched here).

## G. Human-action items expected (to be confirmed in Phase 2)
- Create the Beehiiv automation and paste the welcome email.
- Decide whether `NEXT_PUBLIC_NEWSLETTER_POPUP_ENABLED` stays off (it does unless Jamie says otherwise).
- Add a test runner to the repo (vitest) in a later PR; this run executes its tests with node directly and logs the output.
