# Frozen spec (Fable, 2026-10-11)

Frozen: `01-requirements.md` through Revision 3, `02b-contract-and-preflight.md` (Relay), and the non-copy build below. **Not frozen: the copy items S1 to S4**, which wait for Jamie's approval one at a time. Later changes are logged here as spec changes.

## Built and in the tree (uncommitted items are listed in the commit below)

- Merge of `origin/main` `a449abc` (`8bab088`).
- C1, C3, C3b, C4, C5, C6, C8, C9, C10; dates 2026-10-12; visible "Updated" date; `featured` moved; three-card Keep Reading; three images byte-identical to the finals; sitemap and llms.txt entries (`03-atlas-build-notes.md`).
- Gating: PB-6's two edits.

## Not built, waiting on Jamie

| Item | State in the tree now | Design-review outcome |
|---|---|---|
| S1 opening (replaces C2) | old text: "I saw the post the same day you did..." | Steward: approve with fix (keep the quoted sentence). Parent: the version that quotes the doctor's sentence reads better; "That press-release line" only just lands |
| S1 link | n/a | Story and Steward: original post only; "Gaming ftw" as an optional second link on "the posts that quoted it"; never the second Musk quote (never-say A at the click target) |
| S2.1 to S2.5 inbound sentences | four September sentences still in place, three with factual errors, none with the entity in the anchor; no link in the fifth post | Steward: approve S2.1, S2.2 as drafted; S2.3, S2.4, S2.5 with small fixes. Parent: S2.2 reads as an ad; S2.4 "camps" trips on a site that sells camps; S2.5 is a mid-article detour |
| S3 hero alt | old alt describing a photo that no longer exists | Steward: the short version, with the note tied to the underlined number |
| S4 view counts (C7) | old September 15 sentence | Steward: keep the September 15 read in front, since S1's "first week" leans on it. Parent: two read dates are hard to follow |
| Subhead "More than 30 million people saw it" | unchanged (Jamie accepted the wording 2026-10-05) | Parent rates it the one trust blocker: the doctor's post is 17.2M, the 30M is the wave, and views are not people. Raised to Jamie as a question, not changed |

## Pre-flight results

- Guard: `evidence/guard-selftest.txt`. Every non-local request denied; hosts attempted: connect.facebook.net, www.clarity.ms, www.googletagmanager.com, www.google-analytics.com.
- Local `.env.local` would send a live server-side Meta Lead on any sign-up that reaches `/api/season-one`. QA server runs with fake keys; sign-up POSTs are intercepted in the browser.
- `ai_referral` fires only on a production build.
- No Klaviyo, Beehiiv or Meta API was called in pre-flight. The Klaviyo list and flow check is read-only and runs before the write, after Jamie's go.

## Human-action items

1. Copy approvals S1, S2.1 to S2.5, S3, S4 (and the subhead question).
2. Confirm the three images in `assets/final/` are the finals (sizes differ from the handoff's).
3. Ship-day read of the two Musk quote-post view counts (login needed).
4. Netlify env readout for the context that serves `dev`: CAPI token absent, or `META_CAPI_USE_TEST_CODE=true` with a test code.
5. Go for push to `dev`; phone check (look and tap, no sign-up); go for `main`.
6. Go for the Klaviyo-side proof (one or two disposable sign-ups) and where to run it.
7. Featured-revert reminder for ship + 7 days; delete "recent" from the opening at the same time.
8. Beehiiv "Blog welcome (thumbs)" automation before Season 01 mode is switched off.
9. A courtesy note to Muhammad Hossain about the editor's line under his post (Steward's suggestion).

## Out-of-scope findings (not changed; for the WORKLOG)

- Em dashes in `what-your-kids-gaming-is-telling-you` (lines 230, 616, 666); "running all summer" in the League post (line 626).
- `DESCRIPTION` and the index excerpt say "30M+ people".
- The Season 01 popup has no live-host guard.
- FooterBanner's red torn-paper image 404s under local `next start` (file exists; component unchanged from main); Sentry compares against a main build.
- Repo-wide `eslint .` reports 93 errors, none in files this run changed (scripts and older files).
