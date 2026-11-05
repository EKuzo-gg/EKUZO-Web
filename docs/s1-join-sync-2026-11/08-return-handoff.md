# 08 Return handoff: Season 01 join sync and funnel fixes

Paste into a new ekuzo-web session: **"Load `docs/s1-join-sync-2026-11/08-return-handoff.md` and pick up from it."**

## State at writing (2026-11-05, Fable)

Git evidence captured when this file was written (`git status --porcelain` empty, then `git log --oneline -3`):

```
6c87996 docs(s1-join-sync): review guide
2f9637e docs(s1-join-sync): Sentry A final pass at 56b24b9; WORKLOG
0b6e0e8 Season 01 waitlist: claim release capped at 800 ms (SA-6); merged ledger and defect log
```

This file is committed on top of `6c87996`. Branch `build/s1-join-sync-funnel-fixes` on GitHub (`EKuzo-gg/EKUZO-Web`), rebased on `main` `a80ee01`. First step: re-run both commands and diff against the block above; on a mismatch, stop and resolve before anything else.

- Live: hotfix `8ce0e17` (honeypot `ekz_hp`, ad codes d1 to d99) since 10:16 CT.
- Not live until Jamie's go: W1 (/join serves B), W3 (one sign-up per email per 24 h), W4 (hero box on phones).

## If Jamie has said go

1. `git fetch origin main` and confirm `main` is an ancestor of the branch head (else rebase, rerun `npm test`).
2. Push the branch head to `main`. Wait for Netlify; verify `https://ekuzo.gg/season1/join` and `/season1/join/b` return equal body hashes, and `/season1?ad=d19` serves the `#hero` marker script.
3. Append a `log.md` line in `EKUZO/Marketing/ads/2026-10-season-one/` with the deploy time (confounder for the reads).
4. Run H2 from `07-review-guide.md` with `team+s1test-1105-dup@ekuzo.gg`; record it in `06-cleanup-ledger.md`.
5. Give Jamie the note for Aaron and Karlin (what changed, live time).

## Open after release

H1 and H3 (Jamie's phone checks); follow-ups listed in `07-review-guide.md` § Deferred. Close the KB handoff `system/loops/handoffs/2026-11-05-season1-join-sync-and-funnel-fixes.md` per its README once the release is verified.
