# Sentry results, fast-track Part B, build 0c02cf3 and dev c4eabbe, 2026-11-10

Branch `lane/ft-sentry-b` at 0c02cf3, served on 3100 with marker 0c02cf3; main 3bf6c58 on 3101 from `/home/claude/wt-main`. Dev `https://dev--ekuzo.netlify.app` served marker c4eabbe (a merge of origin/dev into the slice; `git diff 0c02cf3 c4eabbe -- app lib middleware.ts next.config.mjs netlify.toml package.json` is only the new `app/season1/landing-v2.html`). Defects: 8, none blocker or high (`defects.md`).

| # | Check | Verdict |
|---|---|---|
| 1 | Tests and types | Pass |
| 2 | Diff scope | Pass |
| 3 | Pixel parity | Pass with notes (SG-4 to SG-7; SG-7 unexplained, sub-visual) |
| 4 | Beacons and journeys | Pass |
| 5 | Stability | CLS pass; "no new source" not met (SG-1) |
| 6 | Console sweep | Pass |
| 7 | Copy check | Two items go stale on dates, one disagreement across pages (SG-2, SG-3) |
| 8 | Dev | Pass |

## 1. Tests and types: pass

`logs/01-npm-test.txt`: 618 tests, 617 pass, 0 fail, 1 skipped; field-vitals suite 5 of 5 (Atlas's totals in `evidence/atlas/part-b.md`). `logs/01-tsc.txt`: `tsc --noEmit` exit 0, no output. Build `logs/build.txt`: exit 0.

## 2. Diff scope: pass

`logs/02-landing.diff` (3bf6c58 to 0c02cf3, `app/season1/landing.html`): 41 added and 26 removed lines. Added-only lines are 15: the 8 CSS rules (`.ready`, `.ready span`, `.ready-note`, `.lock`, `.conf .lock h3`, `.conf .lock p`, `.lock .lock-j`, `.lock-btn`), the two ready links with notes, the lock card, and Part A's four lines (comment, `window.S1.joinHref`, the href setter, the click listener). The 26 replaced pairs read against Atlas's port table: header mini button 1, top h2, p and button 3, FAQ 2, bottom h2, p and button 3, sticky 1, confirmation kick 1, Text Karlin h3 1, hero buttons 8 (d6, d9, d11, d13, d14, d19, d20, d21: `Save their spot →` to `Get the details →`, `logs/02-grep.txt`), `CTA` default 1, the two `.ih-list` templates 2, the two `listLine` lines 2, the skip heading 1. Nothing else. `git diff --name-only 3bf6c58 0c02cf3 -- app lib middleware.ts scripts package.json` (`logs/02-names.txt`): 17 files, the Part A set plus `landingCopy.test.ts`, no `scripts` or `package.json` change.
Greps on the landing (`logs/02-grep.txt`): `base64,` 0, `fbevents.js` 0, `gtag/js` 0, `netlify\.app` 0 (the LIVE regex at line 1478 is `ekuzo\.gg$|^localhost$`); `{{TAGS}}` 1, `{{BUILD}}` 1, `s1-fonts` 2, `HERO_IMG` 3, `d19` 7, `d21` 7. `data-s1-pre` is not a literal in the file or on main; `dataset.s1Pre` appears twice on both (SG-8).

## 3. Pixel parity: pass with notes

Script `s-pixel-b.mjs`, summaries `logs/03-pixel-plain-summary.txt` and `logs/03-pixel-mask-summary.txt`, JSON `pixel/pixel-b.json` (plain) and `pixel-mask2/pixel-b.json` (masked), `pixel-control/pixel-b.json` (main against main), diff images in `diffs/`. 11 URLs (`/season1`, d18, d19, d2, d4, d6, d9, d11, d13, d14, d21) at 412x915 DPR 2.625 and 1440x900 DPR 1 = 22 pairs; fonts ready plus 1.5 s, images aborted on both builds, animation frozen, `Math.random` 0.25, analytics stubbed by host regex, offenders none. Each page is cut into its `#lp` sections (own x range, so the 1440 two-column layout is compared column by column) and compared section against section, with a 1 px tolerant mask (a pixel counts when no pixel within 1 px of it in the other image is within 16 per channel), then boxed.
Two passes: **plain** (as shipped) and **masked** (`.ready`, `.ready-note`, `.lock` hidden on the branch only, so positions line up). Control: main against main on 3101 for d11, d19, noad, d14 at both viewports is md5-equal in every section, every FAQ answer and the sticky bar (`pixel-control/pixel-b.json`), so the method is deterministic.
- Top form block, bottom form block: the only sections that differ on every page where they exist; all boxes inside them (masked pass: copy, button label and, on d19, d11, d21, a wrapped heading, `join-end` +30.6 px).
- FAQ answers: with every `details` open, the two answers that changed (index 0 and 1) are the only ones that differ (`answersChanged` [0,1] on all 22). After copying main's two answers into the branch page, all five `details` are md5-equal at 412 on all 11 ads and at 1440 on 8 of 11; not equal at 1440 on noad, d18, d14 (SG-7).
- Sticky bar: label `Save their spot` on main, `Send me the details` on the branch (script sets `CTA`, F8), the only difference.
- Confirmation (d18 and d19, both viewports): every box lies inside `#conf`; the `.lock` card is present on the branch and absent on main (`pixel/*-conf-*.png`, `diffs/mask-d19-412-conf.png`, `diffs/plain-d19-412-conf.png`).
- Hero CTA labels: changed on d6, d9, d11, d13, d14 (brief) and d19, d21 (F7, SG-5), both viewports; the box is the button (`diffs/mask-d19-412.png`). d4, d2, d18, noad unchanged (`ctaText` in the JSON).
- Page above the top form, md5 of the crop: equal at 412 on d18, d2 and noad; d19 differs by the hero label only (SG-5). At 1440 it differs on d18, d19, noad by the header mini button (SG-4) and is equal on d2.
- Sections elsewhere: masked pass, equal except `footer` residue of one text row (96 to 332 px) where a form block above changed height by a fractional amount (SG-6), and AA-level residue at 1440 on noad and one d18 run (SG-7). Plain pass: sections below the two form blocks re-rasterise at a fractional device offset (SG-6), content identical (the d19 bridge copy read side by side, one device px lower; the masked pass has the same sections equal).

## 4. Beacons and journeys: pass

Script `s-journey.mjs` (Class Q, `?s1qa=1`, localhost only, fb-android UA, analytics stubbed by host regex, POST `/api/season-one` recorded then fulfilled, per-document snapshots saved on `pagehide`), raw `journey.json`, summary `logs/04-journey-summary.txt`. Offender check: none (stubbed hosts www.googletagmanager.com, connect.facebook.net, www.clarity.ms).
- Hrefs on d18 and d19 with utms: top, bottom and confirm are `/season1/join?src=ad&ad=<ad>&utm_source=meta&utm_medium=paid_social&utm_campaign=s1&utm_content=<ad>-a`. All three are `A` elements with `href` set and `tabIndex` 0.
- Taps (real navigation, not held): top link tap gives one `s1_join_click {ad, hero:"none", location:"top"}` and one Clarity `join_click` in the landing document (`hero` is an extra key Part A adds); second tap after back gives one more; lock button tap gives one `{location:"confirm"}` and one Clarity `join_click`. Per-document counts in `logs/04-journey-summary.txt` (J2). Nothing fires on load or scroll (0 before the first tap).
- Submit: `generate_lead` 1 and Meta `Lead` 1, the Lead `eventID` equals the POST body's `eventId` (d18 c8d4d884-aadf-4167-8ae6-ff21a76c6a1d, d19 bbbef77f-b95e-428e-b3fe-141556bf1c45); POST body equals main's after scrubbing the uuid and the port (both ads).
- Equality with main: `dataLayer` equal apart from `s1_join_click` (main `config, form_start, generate_lead`; params equal), `fbq.queue` equal (`set autoConfig, init, track PageView, track Lead`), `clarity.q` equal apart from `join_click` (`set ad, set hero, set utm_content, event signup, set signed_up`).
- Join page after the tap (same tab and a Ctrl-click second tab, top and bottom links): URL `/season1/join?src=ad&ad=<ad>&utm_*`; `season1_join_view {variant:"b", ad:"<ad>", src:"ad"}`; the address bar keeps `ad` (GA `page_location` carries `ad=`). Keyboard: both form links take focus, Tab from the top email input reaches `A[data-join=top]` next, Enter navigates to the join page (`J3`).
- Console on the journey pages: the branch's 3 errors are the torn-paper 404s of the join page (local `next start` artifact, see 6).

## 5. Stability: CLS pass, "no new source" not met

`npm run vitals -- --target local:3100 --ads d18,d19,d2,noad --profile fb-android-412 --runs 5 --label ft-b-tier1 --expectMarker 0c02cf3 --requireReady` and `--profile ig-android-412 --runs 3 --label ft-b-tier1-ig`; tables `docs/s1-cls-field-2026-11/evidence/vitals/ft-b-tier1/table.md` and `ft-b-tier1-ig/table.md`, logs `logs/05-vitals-fb.txt`, `logs/05-vitals-ig.txt`. Baseline `evidence/vitals/ft-a-tier1/table.md` (marker 8550976, 3 runs). Marker 0c02cf3, s1Ready 1, form usable 5 of 5 (fb) on every cell, page errors 0, POSTs 0, analytics 0, leaks 0. I ran the two local console sweeps and the dev console sweep while the local vitals were running (2 cores); the vitals numbers are unchanged in kind.

| Ad (fb-android-412, N=5) | CLS win med, ft-a to ft-b | max ft-b | LCP med ms, ft-a to ft-b | LCP max ft-b | first paint ms | FCP ms |
|---|---|---|---|---|---|---|
| d2 | 0.0004 to 0.0004 | 0.0004 | 1896 to 1948 | 1968 | 704 to 664 | 812 to 788 |
| d18 | 0.0035 to 0.0038 | 0.0038 | 1476 to 1520 | 1764 | 728 to 732 | 800 to 804 |
| d19 | 0.0015 to 0.0018 | 0.0018 | 1936 to 2068 | 2068 | 752 to 504 | 804 to 836 |
| noad | 0.0003 to 0.0005 | 0.0005 | 2240 to 2252 | 2276 | 756 to 708 | 816 to 832 |

ig-android-412 (N=3): CLS med d2 0.0004, d18 0.0038, d19 0.0018 (max 0.0020), noad 0.0005; LCP med 1884, 1532, 1968, 2240. All 32 runs under 0.1 (windowed). LCP medians move +12 to +132 ms against ft-a (d2 +52, d18 +44, d19 +132, noad +12; d19 is the widest; its run spread in ft-a was 1936 to 1984, here every run is 2040 to 2068); first paint is within +-250 ms (d19 504 against 752 is the first-paint median, FCP 836 against 804). Top sources unchanged (`h1#ih-q`, `h3 + div.row`, `form + p`, `button #text + span #text`).
**New source (SG-1):** the ready link and note are in the shift source list. fb: d18 5 of 5 runs (`span #text` inside `a.ready`, rect unchanged), d19 5 of 5 (`a.ready` and `p.ready-note` move 6 px up in the same shift as `form` and `p`), noad 5 of 5 (`span #text`), d2 0 of 5; ig 9 of 12 (`logs/05-ready-sources.txt`, `logs/05-ready-sources-ig.txt`). The lock card is not in any source list (it is hidden until the confirmation). Windowed values stay between 0.0001 and 0.0038.
**S4:** shifts naming `button.mini-cta`, `svg.mark`, `#sticky`, `.faq` or `footer`: ft-b 134 (70 with recent input, 64 without), ft-a 95 (49 with input); without input the largest is 0.00004 (ft-a 0.00007), none above 0.01 (`logs/05-s4-header.txt`). The largest with input is 0.0606 in both (toolbar collapse and restore).

## 6. Console sweep: pass

`s-console.mjs` on 3100 (`console-local.json`, `logs/06-console-local.txt`): `/season1?ad=d1` to `d21`, `/season1`, `/season1/join`, `/join/b`, `/join/jersey?ad=d21`, `/season1/thanks`: `pageerror` 0, `requestfailed` 0 on all 26; `console.error` 0 on the 22 landing variants. The join pages show 3 errors each and thanks 2, all 404 of `/images/new torn paper/torn-paper-{black,white,grey}-top-1@2x.png` (the local `next start` artifact the brief names). Offenders none. Ours: 0.

## 7. Copy check (report only)

`logs/07-copy-check.md`. Agrees with offer.ts and the join pages: `$100`, "covers January", "mid January 2027", "Dec 31" (lock-in). Goes stale: the lock card's "First 100 families get a free jersey." has no date and the offer ends Nov 30 23:59 PT (Day 4 email and join sticker say "until Nov 30"); "Dec 31" and "Sign-ups are open now" lapse after Dec 31 23:59 PT (SG-2). Disagrees with other pages: terms.html s4, crew and early-access (SG-3).

## 8. Dev: pass

Files in `dev/`. Marker: `/season1`, `?ad=d18`, `?ad=d19` all `c4eabbe`. Headers (`dev/or7-headers.txt`): `/season1` `cache-control: s-maxage=31536000`, `age: 889`, `cache-status: "Netlify Edge"; hit`; `?ad=d18` same, `"Netlify Durable"; hit`, no `etag`, no `x-nextjs-cache`.
- D1: the dev body of `/season1` (139,650 bytes) is `app/season1/landing.html` at c4eabbe (134,535 bytes) with two fills and nothing else: `{{BUILD}}` became `c4eabbe` (7 bytes) and `{{TAGS}}` became the 5,125-byte static tags script, equal byte for byte to the tags fill on 3100 (`dev/dev-season1.html`, `dev/source-landing.html`, `dev/local-3100.html`). The three URLs (`/season1`, d18, d19) are byte-identical.
- N6 (`dev/n6/`, nine paths: `/season1`, d18, d19, `?s1qa=1`, `/season1/join`, `/season1/thanks`, `/programs/ekuzo-camps`, `/ekuzo-camps`, `/camps`) against ekuzo.gg with `curl -sI` only: status, `location`, `cache-control`, `content-type` identical. Two differences: `strict-transport-security` is `max-age=31536000; includeSubDomains; preload` on dev and `max-age=31536000` on ekuzo.gg on every path (a domain-level Netlify setting, not in the repo), and `/season1/join` carries `x-robots-tag: noindex` on dev only (host-gated by design in `app/season1/join/route.ts`, same as the earlier slice's N6).
- Console (`s-console-dev.mjs`, `console-dev.json`, `logs/08-console-dev.txt`): 22 variants, HTTP 200, marker c4eabbe, `s1Ready` 1 on all; console errors 0, pageerror 0, requestfailed 0, analytics attempts 0, POSTs 0. (A first attempt hit a 30 s `goto` timeout on d2 while the local vitals were running; the rerun with a 60 s timeout is clean on all 22.)
- Vitals (`npm run vitals -- --target https://dev--ekuzo.netlify.app --ads d18,d19,d2,noad --profile fb-android-412 --runs 3 --label ft-b-dev --expectMarker c4eabbe --requireReady --noForm`, table `docs/s1-cls-field-2026-11/evidence/vitals/ft-b-dev/table.md`, `logs/08-vitals-dev.txt`), against `evidence/vitals/live-after/table.md` (ekuzo.gg after the earlier slice; it has no noad row):

| Ad | CLS win med, live-after to dev | LCP med ms | LCP max ms | first paint ms | FCP ms |
|---|---|---|---|---|---|
| d2 | 0.0004 to 0.0004 | 1352 to 1368 | 1380 to 2064 | 1060 to 1116 | 1156 to 1212 |
| d18 | 0.0035 to 0.0038 | 1728 to 1488 | 1868 to 2656 | 1132 to 996 | 1332 to 1240 |
| d19 | 0.0001 to 0.0002 | 1420 to 1368 | 1500 to 1444 | 1132 to 1088 | 1308 to 1224 |
| noad | not in live-after (dev 0.0004) | dev 2336 | dev 2352 | dev 1024 | dev 1248 |

CLS unchanged within 0.0003 (d18 and d19 same worst-window sources as the local run; the d19 top source on dev reads `button #text + span #text`, live-after `button #text`). LCP medians are within noise, except that d2 and d18 have one slower run each (d2 max 2064, d18 max 2656 against 1380 and 1868). The ready link appears in the shift sources on dev in 9 of 12 runs (`logs/08-ready-sources-dev.txt`, SG-1). Marker c4eabbe, s1Ready 1, errors 0, POSTs 0, analytics 0, leaks 0 on every cell. No form was submitted, `?s1qa=1` was never loaded in a browser on dev.

## Servers

Both stopped by PID (3100 from this worktree, 3101 from `/home/claude/wt-main`). `logs/servers-stopped.txt`: `fuser 3100/tcp` and `fuser 3101/tcp` exit 1 with no PIDs; `curl` to both returns 000.
