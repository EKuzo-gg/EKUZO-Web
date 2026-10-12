# 02 Frozen spec (Fable, 2026-09-16). Deviations after this point require a logged spec-change here.

Frozen inputs: 01-requirements.md (Auditor SIGN-OFF plus Phase 2 amendments T4, T9), 02-contract.md (Relay, sections 1 to 7 are the API contract; section 8 answered below), 02-copy-deck.md v2 and welcome-email-thumbs.md (Story, after the Parent and Steward reviews), 03-decision-log.md D-01 to D-12.

## What gets built (Phase 3)

Relay (Sonnet), first, against the contract:
- `app/api/newsletter/route.ts`: optional `utm_source`, `utm_medium`, `utm_campaign` with the T1 allowlists; pass-through to Beehiiv; tag rules per contract section 3 (`source-newsletter` for non-blog exactly as today; `source-blog` plus `variant-<campaign>` for blog; `source-blog` alone when campaign missing or invalid). Fire-and-forget tag call kept un-awaited. Case (a) body byte-identical to today.
- `app/api/contact/route.ts`: optional `heardAbout` slug (x, instagram, tiktok-youtube, google, ai, friend, school, other); unknown values dropped; Resend line "How they heard about us: <label>"; tag `heard-<slug>` appended to the existing `source-contact-form` tag array in the same call; no new custom_fields key. Case without heardAbout byte-identical to today.
- `lib/analytics.ts`: `trackNewsletterImpression({ variant })` and `trackNewsletterSignup({ source, variant })`, GA-only, after `trackRegisterClick`.
- Unit tests under `docs/blog-newsletter/tests/` (routes with mocked global fetch, the node:module resolution shim Relay verified), executed with node; output to the ledger.

Atlas (Sonnet), in parallel with Relay against the contract:
- `lib/newsletterAb.ts` exactly per contract section 5, plus: fallback variant "thumbs" when storage throws (D-05), and an exported module-scoped `shownThisLoad` guard used by the popup so a storage-less reader sees it once per page load. Node test of the pure functions in `docs/blog-newsletter/tests/`.
- `components/ui/StickyCTA.tsx`: third arm for `isBlogPostPath(pathname)`; ADAPT from the camps variant (position, height, padding, font classes, scroll and footer thresholds, modal hide unchanged); content = one line from the deck per variant, `input[type=email]`, submit button; in-place success and error lines from the deck; posts `{ email, utm_source: "blog", utm_medium: "sticky", utm_campaign }`; fires `trackNewsletterSignup({ source: "sticky", variant })` on success. Non-blog arms untouched byte-for-byte.
- `components/ui/NewsletterPopup.tsx`: add `mode: "site" | "blog"` (default "site"; site mode unchanged). Blog mode: mounted from `app/layout.tsx` unconditionally as `<NewsletterPopup mode="blog" />` (the site-mode mount stays behind the existing env flag); inside, renders nothing unless `isBlogPostPath(pathname)`; trigger at 50 percent of `document.documentElement.scrollHeight` (scroll listener, passive, fires once), gated by `shouldShowPopup` and the in-memory guard; variant copy from the deck including eyebrow, headline, body, byline, placeholders, button, loading, success, microcopy, error; `role="dialog" aria-modal="true" aria-label` per variant; focus moves into the dialog on open and returns on close; Escape, X and backdrop call `recordDismiss`; success calls `recordSuccess` and closes after the existing 800ms; posts `{ email, firstName?, utm_source: "blog", utm_medium: "popup", utm_campaign }`; fires `trackNewsletterImpression` on open and `trackNewsletterSignup({ source: "popup", variant })` on success; `z-[9999]`, portaled to body (T8). Layout, purple pane, close button, styling: unchanged from site mode (ADAPT).
- `components/ui/ContactModal.tsx`: one optional `<select name="heardAbout">` after the message field, label and options and helper text from the deck, option values = slugs, same class string as the text inputs; included in the POST body.
- Screenshots into `docs/blog-newsletter/screenshots/` immediately after building, 1440 and 375: sticky-blog (each variant), popup-blog-thumbs, popup-blog-classic, contact-after; plus the references sticky-camps and contact-before.

## Reference relationships (visual-parity gate, Steward judges)
- Sticky bar: ADAPT from `/programs/ekuzo-camps` bar. Deltas allowed: copy, email input + submit replacing buttons, colors may follow the default (red) variant rather than camps purple. Must match: position, height, padding, font classes, show/hide.
- Popup: ADAPT from site-mode NewsletterPopup (force the env flag on in dev for the reference screenshot). Deltas allowed: copy fields, trigger, byline line. Must match: two-pane layout, purple pane, close button, inputs, button, success state.
- Contact select: ADAPT from the existing text inputs' class string.

## Pre-flight results (I1, Fable, live Beehiiv, 2026-09-16, read-only except one disposable write)
- Auth and network from Jamie's machine: OK (publication "EKUZO's Newsletter").
- Create-subscription accepts `utm_medium` and `utm_campaign`; a GET echoes `utm_source`, `utm_medium`, `utm_campaign`, `referring_site`. Confirmed with the disposable identity in 06-cleanup-ledger.md.
- Tag endpoint `POST /v2/publications/{pub}/subscriptions/{sub}/tags` returns 201 and the tags are readable on GET with `expand[]=tags`.
- Automations: three, all status draft, trigger "api": CAMPS (aut_4db31c63...), EKUZO100 (aut_3dd66d4e...), TEAMS (aut_fea2b01b..., not in docs/beehiiv-config.md). None triggers on a tag or on utm_source, so no double-send risk for the new automation.
- Unsubscribe merge tag: NOT verified by API (it is an editor feature). Human action below.

## Human-action items (go in 07-review-guide.md)
1. Beehiiv: create automation "Blog welcome (thumbs)", trigger = tag `source-blog` applied, delay 24 hours (required, the copy says tomorrow), one email from welcome-email-thumbs.md. Thumbs-up link = newest post URL with `?utm_source=beehiiv&utm_medium=email&utm_campaign=thumbs-up`. Thumbs-down link = the editor's unsubscribe link (use the editor's "Unsubscribe" link option or the `{{unsubscribe_url}}` merge tag if listed). Send it once to the pre-flight subscriber, then delete that subscriber.
2. Sequencing (D-01): blog merge, then the automation, then the X push. The copy promises "one email tomorrow" from the first blog signup onward.
3. Add `docs/beehiiv-config.md`: the TEAMS automation id, the new automation, the tags `source-blog`, `variant-thumbs`, `variant-classic`, `heard-<slug>`.
4. Beehiiv segments for reporting: `utm_campaign = thumbs` vs `classic`; GA4: `newsletter_impression` and `newsletter_signup` by variant.
5. Later PR: add vitest and move `docs/blog-newsletter/tests/` under a real `npm test`.
6. StickyCTA `querySelector("footer")` bug on camps and 101 (Scout flag 4): KB backport candidate, not touched here.

## Spec-change log
- 2026-09-16, SC-01 (Fable, on Steward's ruling): popup blog mode below `lg` may hide the mobile duplicate heading block (kid artwork plus the "GAMING MATTERS." wordmark) so the form fits at 375x667, but must show the 24px EKUZO logo that site mode shows at `lg` and up, so the sheet is branded. Allowed-delta list for the popup becomes: copy fields, trigger, byline line, mobile heading block replaced by the logo below lg. Everything else in the must-match list stands.
