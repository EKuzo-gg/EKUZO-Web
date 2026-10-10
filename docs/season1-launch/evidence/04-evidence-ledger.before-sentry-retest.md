# 04 Evidence ledger

Result values: PENDING, PASS, FAIL, ACCEPTED-RISK (with rationale and owner), N/A. PROPOSED rows are not in 01-requirements.md until the lead accepts them (see auditor-phase1.md, section 4).

| Req ID | Test | Evidence path | Result | Verified by |
|---|---|---|---|---|
| P1 | Playwright/curl: `/season1?ad=dN&utm_*` for N=1..12 returns 200, URL unchanged, correct variant headline and `--acc`; same on `/roadshow/landing.html` | evidence/P1-*.png, evidence/P1-curl.txt | PENDING | |
| P2 | Browser: valid email -> `#conf` visible; invalid -> `.err`, no fetch; forced 500/502/network via `page.route` -> retry message, no confirmation | evidence/P2-*.png, evidence/P2-network.json | PENDING | |
| P3 | Tap 2 chips -> one POST `step:games` 900 ms after last tap, Klaviyo shows `kid_games`; Network tab shows no request to facebook.com after the Lead | evidence/P3-network.har, evidence/P3-klaviyo.png | PENDING | |
| P4 | Playwright on `/?join=season-one`, Nav, Sticky, Enroll (mode on) CTAs: each opens popup, submit succeeds, same POST contract as P2/T2/T3 | evidence/P4-*.png | PENDING | |
| P5 | curl -I table for each `/register` path (see PROP-P5), 307 + `Location` with `?join=season-one`; `/success` returns 200 | evidence/P5-curl.txt | PENDING | |
| P6 | `git ls-tree -r 4457689` excludes the 7 path groups (done in auditor-phase1.md section 1b); on prod after release, curl each -> 404 | evidence/P6-lstree.txt, evidence/P6-prod-404.txt | PENDING (git half verified by Auditor 2026-10-10: 0 files) | Auditor (git half) |
| P7 | `curl -s <url>/season1 \| grep -o 'name="robots" content="noindex"'`; sitemap has no season1 | evidence/P7-curl.txt | PENDING | |
| T1 | Pixel Helper or network: PageView to `1284038230557204` on `/season1` | evidence/T1-network.json | PENDING | |
| T2 | Network + fbq spy: exactly one `Lead` with `eventID` after ok; retry after forced 502 reuses same eventID; second submit after success does not re-fire | evidence/T2-fbq-log.json | PENDING | |
| T3 | Route test with `fetch` spy and live Test Events capture: CAPI body has same `event_id`, `content_name`, sha256 `em`, ip, ua, `fbp`, `fbc`; Klaviyo-fail path sends no CAPI; awaited before response | evidence/T3-capi-body.json, evidence/T3-testevents.png | PENDING | |
| T4 | Grep all outbound request bodies to graph.facebook.com and fbevents for child keys (`kid`, `game`, `age`) | evidence/T4-grep.txt | PENDING | |
| T5 | Games chip tap produces no facebook.com request and no CAPI call (route test: `step:games` never invokes `sendCapiEvent`) | evidence/T5-*.txt | PENDING | |
| T6 | Klaviyo API read of profile+event after test sign-up: metric "Season 01 Waitlist", props per list, `season1_*` profile props, list `XGTv2F` membership with consent | evidence/T6-klaviyo.json | PENDING | |
| T7 | Network: request to `clarity.ms/tag/wml8wll5ua` on `/season1`; session visible in Clarity | evidence/T7-network.json | PENDING | |
| T8 | Load landing from non-allowlisted host (e.g. 127.0.0.1 via file or alt host header): submit shows success, zero POSTs, zero Lead | evidence/T8-network.json | PENDING | |
| T9 | Unit test of `sendCapiEvent`: flag true + code -> `test_event_code` in body; flag true, no code -> no fetch, warn logged | evidence/T9-unit.txt | PENDING | |
| S1 | POST with `ekz_hp:"x"` -> 200, Klaviyo unchanged, no CAPI; DOM check: field off-screen, `autocomplete=off`, `tabindex=-1`, not focusable by Tab | evidence/S1-*.txt | PENDING | |
| S2 | Contract test of length caps (email 254, ad 40, adName 80, kidGames 200, eventId 100, eventSourceUrl 1000); `grep -r KLAVIYO\|CAPI_ACCESS .next/static` empty; no user input in URL or header | evidence/S2-*.txt | PENDING | |
| S3 | Route test: Meta fetch rejects -> still `{ok:true}`; Klaviyo event 500 -> 502 and `sendCapiEvent` not called | evidence/S3-unit.txt | PENDING | |
| S4 | Assessment note with accepted-risk rationale or mitigation (superseded by PROP-S4a/b/c) | evidence/S4-assessment.md | PENDING | |
| N1 | `git diff --stat 3aefd6c 4457689 -- <14 protected paths>` | auditor-phase1.md section 2 | PASS (all 14 empty; each path exists at base) | Auditor 2026-10-10 |
| N2 | `tsc --noEmit`, eslint on 19 changed files, `next build`, `find .next -name '*.mp4'`, `du -sh .next/server` | evidence/N2-*.txt | PENDING | |
| N3 | Console capture on `/season1?ad=d1`, `d3`, `d10`, `/`, `/?join=season-one`, `/programs/ekuzo-camps`, register redirect | evidence/N3-console-*.txt | PENDING | |
| N4 | Side-by-side vs 2f3a83f at 1440 and 375, empty form and confirmation states; deltas limited to pixel/Clarity tags, honeypot, tracking script | evidence/N4-*.png | PENDING | |
| L1 | curl dev: P1 URLs 200, `/ads/season1/d1-a-toomuch-feed.jpg` 200 | evidence/L1-curl.txt | PENDING | |
| L2 | One real dev sign-up: Klaviyo profile + event + LIST MEMBERSHIP; Test Events shows browser + server Lead with one event ID, deduplicated; Clarity session | evidence/L2-*.png | PENDING | |
| L3 | Human check of Netlify env per context (H1) | evidence/L3-env-screenshot.png | PENDING | Jamie |
| L4 | Same as L1/L2 on ekuzo.gg after release; internal pages 404 | evidence/L4-*.txt | PENDING | |
| PROP-T10 | List-subscribe failure contract: stub Klaviyo subscribe 500; assert status, Lead on both sides | evidence/PROP-T10-*.txt | PROPOSED | |
| PROP-S1b | Honeypot browser Lead suppressed or documented | evidence/PROP-S1b-*.txt | PROPOSED | |
| PROP-P1b | Invalid/missing `ad` table of 8 URLs: variant shown and `ad` posted | evidence/PROP-P1b-*.txt | PROPOSED | |
| PROP-S4a | games/age steps gated by prior sign-up, or accepted | evidence/PROP-S4a-*.txt | PROPOSED | |
| PROP-S4b | Third-party enrolment / consent decision (single vs double opt-in) | decision-log entry | PROPOSED | |
| PROP-S4c | Rate limit or accepted-risk: 50 scripted POSTs, profile count | evidence/PROP-S4c-*.txt | PROPOSED | |
| PROP-P2b | Server failure variants 400/500/502/network, copy and no Lead | evidence/PROP-P2b-*.txt | PROPOSED | |
| PROP-T11 | Browser Lead policy on `*.netlify.app` (dev) | evidence/PROP-T11-*.txt | PROPOSED | |
| PROP-P5 | Widened redirect matrix incl. `/camps/register`, `/ekuzo-camps/register?cta=header`, `/api/**` untouched | evidence/PROP-P5-curl.txt | PROPOSED | |
| PROP-P8 | SEASON_ONE_MODE touchpoint matrix (Nav, Footer, Sticky, EnrollModal, NewsletterPopup, Trigger auto-open and link hijack, snooze, quiet paths) | evidence/PROP-P8-*.png | PROPOSED | |
| PROP-P9 | Flag-off build restores old funnel; flag is build-time | evidence/PROP-P9-*.txt | PROPOSED | |
| PROP-T12 | Property contract table + snapshot test of outgoing Klaviyo bodies (resolve `kid_games` vs `season1_*`, `where` on popup, dead `firstName`/`age`) | evidence/PROP-T12-*.json | PROPOSED | |
| PROP-N5 | Production source hygiene (no internal names in `/season1` source) and page-weight/LCP budget | evidence/PROP-N5-*.txt | PROPOSED | |
| PROP-T13 | CAPI wire capture: v26.0 accepted (`events_received:1`), no child keys, `fbc` rebuild | evidence/PROP-T13-*.json | PROPOSED | |
| PROP-N1b | Whole-tree diff equals the 19-file allowlist | evidence/PROP-N1b-names.txt | PROPOSED | |
| PROP-N6 | noindex, sitemap/robots non-impact, single pixel on `/` | evidence/PROP-N6-*.txt | PROPOSED | |
| PROP-T1b | Pixel provenance: `fbq.getState().pixels` equals the one ID on both surfaces | evidence/PROP-T1b-*.txt | PROPOSED | |
