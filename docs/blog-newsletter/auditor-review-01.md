# Auditor review: 01-requirements.md

Reviewer: Auditor. Inputs: 00-brief.md, scout-map.md, 01-requirements.md. Author of the requirements doc is Fable; this review is done by a separate role, per the loop rule that the author is never the verifier.

Checks applied to every row: (a) is the acceptance criterion executable by Sentry in this cloud checkout with Playwright and node, with no Beehiiv key, or is it explicitly assigned to Fable on Jamie's machine; (b) does every deliverable D1 to D5 have at least one requirement; (c) is the non-regression coverage sufficient given scout-map.md staleness flags 1, 3, 5, 7 and 8; (d) does anything contradict a locked decision in the brief; (e) does anything lack a gate.

## A. Product requirements

| ID | Verdict | Notes / proposed wording |
|---|---|---|
| P1 | PASS | Executable in the cloud checkout with Playwright, no Beehiiv key needed. |
| P2 | PASS | Same. |
| P3 | PASS | Explicitly mocks the `/api/newsletter` response (200 and 500), so no Beehiiv key is needed. |
| P4 | PASS | Executable in the cloud checkout. |
| P5 | PASS | Node test of the pure function plus a Playwright multi-context test, both executable here. |
| P6 | PASS | Depends on `02-copy-deck.md` existing (Phase 2 artifact), not on Beehiiv. |
| P7 | NEEDS-EDIT | The acceptance criterion does not say the `/api/newsletter` response is mocked, unlike P3. Without an explicit mock, "success closes the popup" cannot actually be observed in this checkout, because a real call would fail with no Beehiiv key. Proposed wording: "Playwright intercepts `/api/newsletter` at the network layer and asserts the JSON body; success state and the 365-day suppression are verified after a mocked 200 response, error state after a mocked 500 response; no real Beehiiv call is made or required." |
| P8 | NEEDS-EDIT | "axe-core (if available) or manual attribute check" is a conditional, non-deterministic gate; two runs of the same code could pass or fail differently depending on what happens to be installed. Proposed wording: "Playwright: assert `role=\"dialog\"`, `aria-modal=\"true\"`, and `aria-label` (or `aria-labelledby`) are present; assert `document.activeElement` is inside the dialog immediately after open; assert Escape closes the dialog and focus returns to the element that had focus before open. These four assertions are required and must pass deterministically; axe-core may be added as a supplementary, non-blocking check but is not a substitute for them." |
| P9 | PASS | Executable in the cloud checkout. |
| P10 | NEEDS-EDIT | Owner is Relay and the check touches the Beehiiv tag endpoint, but "Unit" does not say the fetch is mocked, unlike T1 and T3. Proposed wording: "Unit test with mocked `fetch` (no real Beehiiv key used or required): route handler builds the email HTML containing the line; the mocked call to the tag endpoint receives `heard-x` for \"X (Twitter)\"; grep of the route file confirms no new key is added to `custom_fields`." |

## B. Technical requirements

| ID | Verdict | Notes / proposed wording |
|---|---|---|
| T1 | PASS | Explicitly mocked fetch, no Beehiiv key needed. |
| T2 | NEEDS-EDIT | Same gap as P10: "Unit: tag-endpoint body per case" does not say mocked, while T1 and T3 do. Proposed wording: "Unit test with mocked `fetch` (no real Beehiiv key used or required): asserts the tag-endpoint request body for a blog case and a non-blog case." |
| T3 | PASS | Explicitly mocked. |
| T4 | PASS | Node test executes directly, no Beehiiv dependency. |
| T5 | PASS | Playwright plus a file diff, both executable here. |
| T6 | PASS | `tsc`, `eslint`, and dev-server console checks, none touch Beehiiv. |
| T7 | PASS | Explicit M+H gate with Steward as the human checkpoint; screenshots are all renderable in this checkout (the homepage popup screenshot notes "flag forced on, dev only," which is fine since it only renders the UI and does not require a successful Beehiiv submission). |

## C. Copy requirements (Story)

| ID | Verdict | Notes |
|---|---|---|
| C1 | PASS | File-existence gate plus Steward review, both concrete. |
| C2 | PASS | Mechanical grep plus Steward judgment, concrete enough for an M+H gate. |
| C3 | PASS | Mechanical grep, concrete. |

## D. Integration requirements (Relay)

| ID | Verdict | Notes / proposed wording |
|---|---|---|
| I1 | NEEDS-EDIT | The brief's Environment section says the live pre-flight is "done by Fable on Jamie's machine," but I1's text only says "(read-only, Jamie's machine)" without naming who executes it, and the table has no Owner column at all for section D (the section header names "Relay," but Relay is an integration-planning role, not the one with hands on Jamie's machine). Proposed wording, with an Owner field added: "Owner: Fable. Pre-flight against the live Beehiiv publication, executed by Fable on Jamie's machine (read-only; this cloud checkout has no Beehiiv key and cannot run this check): confirm create-subscription accepts `utm_medium` and `utm_campaign`, confirm the tag endpoint, list existing automations, confirm whether segments can filter on utm fields. Results into `02-frozen-spec.md` § Pre-flight, dated." |
| I2 | NEEDS-EDIT | Same gap: a live write cannot happen in this checkout (no key), but the requirement does not say so. Proposed wording: "Owner: Fable. Any live write during testing, executed by Fable on Jamie's machine only (this cloud checkout has no Beehiiv key and cannot perform a live write), uses a disposable identity (`newsletter-test+<timestamp>@ekuzo.gg`) and is logged in `06-cleanup-ledger.md` with the subscriber id." |
| I3 | NEEDS-EDIT | No live-write dependency, so it is fine for Sentry-free execution, but it also has no Owner, and "Relay" (the section's implied owner) is not who drafts copy or writes a human-action checklist. Proposed wording: "Owner: Story (copy), Fable (files the human-action list). Welcome email draft `welcome-email-thumbs.md` plus a human-action list for Beehiiv: create automation \"Blog welcome (thumbs)\", trigger = tag `source-blog` applied (or segment `utm_source = blog`), one email, 24h delay optional, thumbs-down = `{{unsubscribe_url}}` (or Beehiiv's equivalent merge tag, verified in pre-flight I1), thumbs-up = link to the newest post." |

## E. Non-regression requirements

| ID | Verdict | Notes / proposed wording |
|---|---|---|
| N1 | NEEDS-EDIT | Scout staleness flag 3 documents `isCheckoutPage` (`/register`, `/success`, `/swamp`, `/woodward`), which forces the bar fully hidden regardless of scroll, and the brief's own list of protected routes never names a checkout route either. N1's route list omits this branch entirely, so a regression that broke `isCheckoutPage` (for example, a blog-branch change that accidentally made the checkout check no longer short-circuit) would not be caught. Proposed wording: "StickyCTA on `/`, `/programs/ekuzo-camps`, `/programs/ekuzo101`, `/programs/ekuzo100`, `/programs/ekuzo-teams`, `/schools`, `/parents`, and at least one `isCheckoutPage` route (`/register` or `/woodward` or `/swamp`): rendered bar innerHTML/outerHTML identical before and after, including that the checkout-page route still renders nothing (bar stays hidden regardless of scroll)." Also add an Owner column: Sentry for all of N1 to N6, since the section otherwise has none. |
| N2 | PASS | Directly resolves staleness flag 1 (the homepage popup is dark by default here) by testing both the flag-unset state and a dev-only flag-forced-on state. |
| N3 | PASS | Covers staleness flag 5's concern about the create-subscription body for the footer caller. |
| N4 | PASS | Concrete diff, executable here. |
| N5 | PASS | Concrete unit case. |
| N6 | PASS | Mechanical `git diff --stat` check. |

## F / G

Out of scope and human-action-item sections are consistent with the brief (thumbs-only welcome email, no new Beehiiv custom fields, no automation build in this run, camps `querySelector("footer")` bug logged but not fixed). No changes needed there.

## Missing requirement

Staleness flag 7 (z-index convention: StickyCTA is `z-40`, the existing NewsletterPopup is `z-[9999]`) and flag 8 (the existing popup is self-contained and outside `ModalContext`, so `StickyCTA` does not hide when it opens) together raise a question the brief never answers and 01-requirements.md never states: does the blog popup need to hide the sticky bar, or the reverse, and what is the popup's z-index. T7 would likely catch a gross visual break by side-by-side screenshot, but nothing names the expected stacking or resolves whether the two components must coordinate state. This should be a requirement of its own, not an incidental catch.

Proposed new requirement:

| ID | Requirement | Owner | Acceptance criterion | Gate |
|---|---|---|---|---|
| T8 (proposed) | The blog popup's stacking relative to the sticky bar is explicit: the popup keeps `z-[9999]` (matching the existing NewsletterPopup, per Scout's documented z-index convention, where StickyCTA is `z-40`), so it always renders visually above the sticky bar. Neither component is required to hide the other via component state when the popup is open; this matches the existing, non-blog relationship between NewsletterPopup and StickyCTA today (the popup is self-contained and outside `ModalContext`), and is an accepted, pre-existing characteristic, not a regression to fix in this run. | Atlas | Playwright: with the blog popup open, assert the dialog root's computed `z-index` is `9999`; assert `document.elementFromPoint()` at the sticky bar's on-screen coordinates resolves to a node inside the popup dialog, not the sticky bar's submit button. | M |

The dead `app/blog/[slug]/page.tsx` route (scout-map.md item 7 and staleness flag 2) is confirmed irrelevant: it always calls `notFound()`, every real post is its own static folder, and P1/P4's pathname logic (`startsWith("/blog/")` minus `/blog/author/*`) already does not depend on it. No edit needed on that point.

## Contradictions with locked decisions

None found. One ambiguity worth a one-line clarification rather than a contradiction: the brief's "50/50 assignment on first view, stored per browser (localStorage), re-asked after 30 days (not forever)" reads naturally as two different things (the assignment, and the re-ask), and 01-requirements.md resolves it as "the popup re-appears every 30 days if not dismissed permanently, but the stored variant itself never changes" (P4, P5, T4 together). That reading is reasonable and internally consistent, but the requirements doc does not say in so many words that it chose that reading over "the variant is re-rolled every 30 days." Recommend one added sentence to P5 or T4 making this explicit, so it is not re-litigated at test time.

## Requirements lacking a gate

None. Every row in sections A through E carries a Gate value (M or M+H).

## Deliverable coverage (D1 to D5)

- D1 (StickyCTA blog bar): P1, P2, P3, N1.
- D2 (NewsletterPopup blog behavior): P4, P5, P6, P7, P8, N2, N4.
- D3 (`/api/newsletter` utm passthrough, existing callers unchanged): T1, T2, T3, N3.
- D4 (welcome email draft, human-action item, not code): I3, C1.
- D5 (ContactModal plus `/api/contact` field): P9, P10, N5.

All five deliverables have at least one requirement. No MISSING items needed for coverage; the one MISSING item (T8) is about an underspecified interaction, not an uncovered deliverable.

## Verdict: SIGN-OFF

Update 2026-09-15: Fable applied all 11 edits below to 01-requirements.md. Re-read and confirmed: P7 and P8 mock/assert deterministically, P10 and T2 name mocked fetch, N1 adds `/programs/ekuzo-camps/register` as the checkout-page route, I1 and I2 name Fable as executor on Jamie's machine, I3 has named owners, section E has an Owner column (Sentry), T8 is added with the z-index/no-cross-hide requirement, and T4 states the variant is never reassigned. No new gaps found. 01-requirements.md is signed off for Phase 2.

Original edit list (for the record, all applied):

1. P7: make the `/api/newsletter` response mocking explicit, so the success and 365-day-suppression path is actually testable without a Beehiiv key.
2. P8: remove the "if available" conditional on axe-core; require the four deterministic assertions listed above.
3. P10: make "mocked fetch" explicit for the Relay unit test, matching T1 and T3.
4. T2: make "mocked fetch" explicit, matching T1 and T3.
5. N1: add at least one `isCheckoutPage` route to the zero-diff check list, per scout-map.md staleness flag 3.
6. I1: name Fable as executor and state plainly that this cloud checkout cannot run the check (no Beehiiv key).
7. I2: name Fable as executor, state the live-write happens on Jamie's machine only, and cannot happen in this checkout.
8. I3: add an explicit Owner (Story for copy, Fable for the human-action list) instead of relying on the section header's "Relay."
9. Add an Owner column to section E (Sentry, for N1 through N6), so every row in every section states an owner role as the doc's own opening line requires.
10. Add new requirement T8 (z-index and stacking between the blog popup and the sticky bar), as proposed above.
11. Add one clarifying sentence to P5 or T4 confirming that the 30-day re-ask affects popup re-display only, not the stored variant, to remove the brief's ambiguity before it reaches test time.
