# Atlas-1 self-test (front end, round 2)

## Files changed
- `app/season1/landing.html` (1,347,273 to about 127 KB)
- new: `public/images/season1/landing/{boys-girls-club,laughing,team-walk,hands-in,coach-and-mom,couch,jersey-back,green-team,kid-couch,mc-blocks}.webp` (10 files, 904 KB, decoded straight from the data URIs, byte-identical)

## Spec items
- S1 item 1: all 10 base64 `IMG` entries are now `/images/season1/landing/<key>.webp`. Jersey path entries untouched. No other code depended on data URIs: `bg.src` (hero background copy) just reads the URL; no canvas, email export or `data-bg` swap reads the bytes (`data-bg` is only an attribute on art imgs). All 13 image URLs (10 new plus the 3 jersey) return 200 on the build. Browser runs on d2, d4, d11, d19 saw 0 responses with status >= 400.
- S1 item 2: after moving the images, CLS was still above 0.1 (d2 0.376, d4 0.178, d1 0.32, d3 0.17, d19&hero=games 0.174), so the reserve was applied: small script adds `pre-ih` to `#lp` for a valid `?hero=` or any `AD_HERO` ad; phone-only CSS `.lp.pre-ih:not(.has-ihero) > #hero{min-height:80svh}`. The form is not hidden. No fitHero or font-wait change. Deviation from Scout: d10 (array entry) also gets `pre-ih` (both its heroes are interactive and end at 80svh), so the split did not need to move into the small script.
- S2 item 5: a 429 on the main sign-up shows the server's `error` text in the form error line, re-enables the button, no retry, no analytics; falls back to a generic line if the body has no error text.
- S2 item 6: `quiet===true` is handled like `repeat===true` (no fbq Lead, no gtag generate_lead, no Clarity signup; confirmation and `ekuzo_s1_joined` as usual).
- Step POSTs: the landing sends only `games` and `text-karlin` (there is no `age` step on the landing). Both now carry `eventId` (the sign-up's) and the email (`em` / `savedEmail`, the one the id was made for). The sign-up itself already sent it.
- Stubbed-browser check (flow.mjs against the build with `/api/season-one` faked): 429 shows the server text, button back to "Save their spot", no confirmation, no events; quiet gives confirmation with no Lead events; normal sign-up fires Lead, generate_lead, signup, and the games POST has eventId and email.

## CLS at 375 (median of 3, cold, CPU 4x, 1.6 Mbps, analytics blocked, 0 requests leaked)
| URL | before (round 1 / Scout) | images moved only | final (images + reserve) |
|---|---|---|---|
| d2 | 0.386 | 0.376 (runs 0.054, 0.376, 0.376) | 0.054 |
| d4 | 0.177 | 0.178 | 0.002 |
| d1 | 0.3215 | 0.3215 | 0 |
| d3 | 0.169 | 0.170 | 0.0003 |
| d19&hero=games | 0.161 | 0.174 | 0.0003 |
| d11 | 0.001 | 0.001 | 0.001 |
| d19 | 0.001 | 0.001 | 0.001 |
| d16 | 0.0015 | 0.0015 | 0.0015 |
| d10 (extra) | about 0.3 | 0.322 | 0.015 |
Raw: `cls-after.json`, `cls-before-imgfiles-only.json` in this folder. All under 0.1. d2 stays 0.054 (display font arrives after the hero markup; the 125/97 px bridge flicker). Not fixed here (would need the fitHero font wait Scout prototyped, a hide of the hero until fonts load, which R2-D10 rejected for the form but is a smaller option for the hero only).

## Other checks
- Screenshots (settled, 375): `docs/s1-round2-2026-11/screenshots/atlas1-{d2,d4,d19,d11}-375.png`.
- `npm test`: 573 tests, 572 pass, 1 skipped, 0 fail (`npm-test.txt`).
- `npx tsc --noEmit -p .`: 3 errors, all in stale generated `.next/types/app/api/season1/*` route type checks (CARD_TESTING_FAILURES, WARM_EVERY_MS etc.), none in files I touched (`tsc.txt`).
- Test build note: the first `next build` of my copy failed type check because Atlas-2's `seo` option on the join routes was mid-edit; the copy only has `typescript.ignoreBuildErrors` set in its own next.config.mjs (not the worktree).

## Open issues
- Settled pixel identity was checked by construction (same bytes, same markup) and by viewing 4 screenshots, not by a full pixel diff of d1 to d21 at 375 and 1440; a Critic should run that diff against the pre-change build.
- d2 at 0.054 (above, under the 0.1 bar).
- The 1 s to 7 s early-state page now shows an empty reserved dark box with the form below it on interactive-hero pages (same as page A today).
- Images are now separate requests; no cache headers added (outside my files).
