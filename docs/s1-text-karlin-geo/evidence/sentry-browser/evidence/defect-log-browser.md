# Defect log: browser lane

No defects found.

| ID | Severity | Type | Repro | Status |
|---|---|---|---|---|
| (none) | | | | |

Observations that are not defects (see results.md):
- OBS-1 (info): the `{step:"games"}` post (fired after sign-up when hero is "games" and an answer was picked) carries no `tz` in branch. It is unchanged from main and was outside the stated change. Raise only if geo is wanted on that step. Repro: /season1?ad=d10 with localStorage ekuzo_s1_hero_d10=games, pick a game chip, sign up, inspect the second POST.
- OBS-2 (infra-gap, test harness only): the test server returns 404 for /images/authors/karlin-oei-avatar.jpg and the gate blocks Google Fonts, so each run logs one first-party console 404 plus font fallback. Same on main and branch.
