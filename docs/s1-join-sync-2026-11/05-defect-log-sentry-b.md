# 05 Defect log, Sentry lane B (browser QA), build 585617b

No code-bug found. Every W3, W4, J1, J2, J4 and R4.3 check passed (see evidence/sentry-b/results.md).

| id | severity | type | requirement | repro | owner |
|---|---|---|---|---|---|
| SB-1 | low | infra-gap | Sentry B setup | Port 3100 was already served by another lane's server (cwd /tmp/claude-0/atlas-build); `next start -p 3100` failed with EADDRINUSE and the first pass silently tested that build. Detected by the PID/cwd check, discarded, redone on 3110. The `.server.pid` written via `&; echo $!` also holds a subshell pid, so `kill "$(cat .server.pid)"` does not stop the baseline server (its pid file is stale; the baseline 3200 server was left running). Lanes need distinct ports and `exec`-based pid files. | Fable (loop setup) |
| SB-2 | low | infra-gap | J4, R1.3 | The QA env (S1_COMMIT_MODE=test, STRIPE_SECRET_KEY placeholder, no DATABASE_URL) resolves mode "off", so /season1/join and /join/b render the closed state with no sign-up CTA. The open state was tested on a second server (3101, same build) with env overrides to a fake sk_test_ key and a DATABASE_URL whose host carries the Neon test marker; nothing connects to it. Open-state tests need that override or a real test branch. | Fable (qa.env) |
| SB-3 | info | accepted-risk | Console | Pre-existing 404s on `/images/new torn paper/torn-paper-*-top-*@2x.png` (3 on the join pages, 1 on /blog), identical on baseline 147897a. Not caused by this change. | Aaron |
| SB-4 | info | accepted-risk | R4.2 | Interactive heroes remain high CLS before and after: d2 0.386, d4 0.177, d19&hero=games 0.161 (375 px, lab, throttled). Within the R4.2 allowance (+0.02) but not under 0.1. Candidate follow-up if ads route to those pages. | Atlas (follow-up) |
| SB-5 | info | accepted-risk | R3.x / lane scope | Popup and landing were tested with `/api/season-one` stubbed, so server classification (new/retry/repeat) is not exercised here; the client behaviour on each response is. Tags never load on localhost (s1qa gate), so Pixel/GA/Clarity calls were observed through recorder stubs, not real tags. | Sentry A / H2 |
