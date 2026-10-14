# 02 Frozen spec: Season 01 ad heroes (Fable)

Frozen 2026-10-14. Deviations need a logged spec change in `03-decision-log.md`.

## Branches

- `preview/s1-heroes` from `origin/dev` (cade839). All work is committed here first.
- `release/s1-heroes` from `origin/main` (1e511cc, an ancestor of dev). Takes `app/season1/landing.html` and
  `app/api/season-one/route.ts` from the preview branch file-for-file, plus `docs/s1-heroes/` and
  `docs/season-one-tracking.md`. Gates: `git diff --quiet preview/s1-heroes release/s1-heroes -- app lib components`
  and `git diff --name-only origin/main release/s1-heroes` lists only those paths (plus WORKLOG.md).
- Pushes are Jamie's (this session's GitHub pushes are refused). Order: dev, dev-deploy check, then main.

## Client: `app/season1/landing.html` (Atlas)

Touch only the script. No CSS, markup or copy changes.

1. **Ad-to-hero table.** Next to `HERO_DEFS`, add:
   ```js
   // Aaron's handoff 2026-10-13 (docs/s1-heroes/aaron-handoff.md): which hero each ad opens with when the link has no ?hero=.
   // Ads not listed open page A. d10 is Aaron's B vs C test: each browser gets one of the two and keeps it.
   const AD_HERO={d1:"amount",d2:"screentime",d3:"games",d4:"shortlist",d5:"shortlist",d6:"amount",d8:"games",d9:"shortlist",d10:["amount","games"]};
   ```
2. **Resolution** replaces `const HERO=(qs.get("hero")||"").toLowerCase(), HD=HERO_DEFS[HERO];` with logic that
   sets `HERO` (hero id or `""`) and `HERO_FROM` (`url` | `ad-map` | `split` | `none`):
   - `qh = (qs.get("hero")||"").trim().toLowerCase()`.
   - If `HERO_DEFS` has own property `qh`: `HERO=qh`, from `url`.
   - Else if `qh==="none"`: `HERO=""`, from `url`.
   - Else if `adOk` (a top-level flag computed from the raw `ad` param with the same normalization as `id`:
     lowercase, leading `d0` to `d`, own property of `T`; false for a missing or invalid ad, so the d1 fallback
     never maps) and `AD_HERO` has own property `id`:
     - string value: `HERO=value`, from `ad-map`.
     - array value: read `localStorage["ekuzo_s1_hero_"+id]` in try/catch; if it is one of the array values use
       it, else pick `arr[Math.random()<.5?0:1]` and write it back in try/catch. From `split`.
   - Else `HERO=""`, from `none`.
   - `HERO` and `HERO_FROM` are top-level `let` declarations (not inside a block), declared before any use.
     The whole localStorage access (property read included) sits inside try/catch.
   - heroFrom values: explicit valid hero `url`; `hero=none` `url`; table string `ad-map`; d10 `split`; d7, ads not
     in the table, bare or invalid ad `none`.
   - `HD = HERO ? HERO_DEFS[HERO] : undefined`. Use own-property checks, never `in` (no prototype keys).
   - The `d1` fallback for a missing or invalid ad must not map (R3).
3. **Sign-up payload** (main form post): replace `...(HD?{hero:HERO,heroAnswer}:{})` with
   `hero:HD?HERO:"none", heroAnswer:HD?heroAnswer:"", heroFrom:HERO_FROM`. Nothing else in the payload changes.
4. **GA4.** `ga()` merges `hero: HERO||"none"` into every event (`Object.assign({ad:d.id,hero:HERO||"none"},p)`).
   `generate_lead` gains `hero: HERO||"none"` next to `source`. Explicit `{hero:HERO}` params already passed by
   Aaron's calls stay as they are.
5. **Clarity.** Directly after `clr("set","ad",d.id);` add `clr("set","hero",HERO||"none");`. Remove only the
   `clr("set","hero",HERO);` from Aaron's `setTimeout` (keep its `ga("hero_view",...)`), so the tag is set once,
   and fix the comment above that `setTimeout` so it stays true.
6. **Share link.** `u.searchParams.set("hero", HD?HERO:"none")` unconditionally, replacing `if(HD) ...`.
7. Pixel and CAPI code untouched. The answer text goes only into the `/api/season-one` body.

## Server: `app/api/season-one/route.ts` (Relay)

Main sign-up branch only; `step: "games"` and `step: "age"` unchanged; `sendMetaLead` unchanged.

```ts
const HEROES = new Set(["amount", "games", "screentime", "shortlist"]);
const HERO_FROM = new Set(["url", "ad-map", "split", "none"]);
// Letters, digits, spaces and the punctuation Aaron's answers use; strips markup and link characters.
const HERO_ANSWER_STRIP_RE = /[^\p{L}\p{N} ,.'’“”"!?&-]/gu;
```

For `source === "ad-landing"` only:
- `hero = HEROES.has(text(body.hero).toLowerCase()) ? that : "none"` (non-strings become `none`).
- `heroAnswer = hero === "none" ? "" : (clean(stripped string body.heroAnswer, 200) || "skipped")`
  (non-strings become empty first).
- `heroFrom = HERO_FROM.has(body.heroFrom) ? body.heroFrom : ""`.
- `profileProps.season1_hero = hero; profileProps.season1_hero_answer = heroAnswer;`
- `eventProps.hero = hero; eventProps.hero_answer = heroAnswer; eventProps.hero_from = heroFrom;`

For `source === "site-popup"`: no hero keys at all (D4). Update the header comment to describe the new fields.

## Docs (Relay)

`docs/season-one-tracking.md`: add the hero fields to the tracked-fields rows (Klaviyo profile and event) and to the
manual check list, and the GA4 `hero` param and Clarity `hero` tag. Note that `season1_hero_answer` is visitor text:
never render it unescaped in a Klaviyo template.

## Pre-flight (live systems, read 2026-10-14)

- Klaviyo flow "Season 01 - Day 0 Welcome" (W5ciCB): live, trigger Added to List XGTv2F, no profile filter, no
  trigger filter. New profile properties cannot change who gets it. Test sign-ups on the dev deploy will receive
  Karlin's Day 0 email at `team+s1test-1014-*` (bcc team@ekuzo.gg): expected, logged in the cleanup ledger.
- Klaviyo accepts new custom profile properties through the events API profile upsert (same path as
  `season1_ad`, `season1_source` today). No schema step needed.
- GA4: event params arrive without registration; reporting by `hero` needs a custom dimension (human action H1,
  Jamie's choice, not required by Aaron).
- Meta: no change. Ad names, URLs and URL parameters stay as published.

## Human-action items

- H1 (optional, Jamie): register GA4 event-scoped custom dimension `hero`.
- H2 (Jamie): push `preview/s1-heroes:dev`, check the dev deploy, then push `release/s1-heroes:main`.
- H3 (Aaron, question only): D12 is live and not in his table; it opens page A until he says otherwise.
