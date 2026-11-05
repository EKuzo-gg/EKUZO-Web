# Sentry B (browser QA) results, build 585617b

Servers: after = built copy at /tmp/claude-0/sentry-b-build on port 3110 (not 3100, see defect SB-1) and 3101 (same build, env override only to reach the open state, see SB-2); before = /home/claude/ekuzo-baseline (147897a) on 3200. Analytics guard: guard.md; blocked analytics requests in every functional run: 0 (nothing tries to load tags on localhost; the stubs recorded the calls). Scripts: *.mjs in this folder. An earlier pass accidentally ran on port 3100, which belongs to another lane's build (atlas-build); all of it was discarded and redone on 3110.

## 1. Console / browser truth (c1-console.json)
16 page/viewport pairs, after vs before: identical in every case. Errors seen are all pre-existing and equal on 3200: 3 local 404s for `/images/new torn paper/torn-paper-{black,white,grey}-top-1@2x.png` on /season1/join, /join/b, /join/jersey (jersey also has an unused-preload warning for s1-crew-mobile.webp), and one 404 for torn-paper-red-top-2@2x.png on /blog. Landing d18, d19, d21, d2: 0 errors at both widths. No new error from the build.

## 2. W3 landing (c2-landing.json), 17 of 17 pass
- Triple tap burst, Enter+click, real dblclick: 1 POST each (R3.8).
- Network abort then success, same email: same eventId on both POSTs, exactly one fbq Lead with eventID equal to the posted eventId, none before the retry, one generate_lead, one clarity signup, flag "1" (M1, M3, R3.6, R3.9).
- Different email after a failure: new eventId, own Lead with the new id (R3.7, M2). Second email after a success: second Lead with a different eventID. Same email in other case/with spaces: same eventId, still one Lead.
- `{ok:true,repeat:true}`: confirmation shown, zero fbq Lead, zero generate_lead, zero clarity signup; flag "1".
- setItem throwing: confirmation still shows, Lead fires.
- Touch scroll gesture (CDP, touch) starting on the email field, page scrolled 318 px: no form_start; control real tap: one form_start. Load alone: no form_start, no Lead (M5).

## 3. W3 popup and J2 (c3-popup.json), 11 of 11 pass
Popup mode is on in this env (NEXT_PUBLIC_SEASON_ONE_MODE=1; trigger delay 2.5 s, opened at 2.88 s after load). Repeat in popup: no fbq/gtag/clarity lead call, flag set, done state. Control new sign-up: Lead and generate_lead with the posted eventId. Popup burst of 3 taps: 1 POST; retry keeps eventId, one Lead; different email gets a new id and its own Lead. `?join=season-one` opens in 118 ms. J2: landing sign-up (new and repeat) then /blog: no dialog in 5 s, flag "1"; control with the flag cleared opens the popup.

## 4. J1 and J4 (c4-journeys.json), all pass
J1 (Instagram UA, 375, d19 with utm_source=meta, utm_content=d19-qa): main POST ad "d19" and the UTMs; Text Karlin POST `{step:"text-karlin", ad:"d19"}`; done state shows. Screenshot: screenshots/sentry-j1-375-confirmation-inapp.png. J4 on 3101: address bar keeps src=email and all UTMs; 4 of 4 sign-up CTA hrefs are `/season1/join/signup?src=email`; signup loads 200 and has `ekz_hp`; a non-whitelisted src is dropped. Note: UTMs are in the address bar, not in the CTA href (by design via URL_ALLOW; carrying them past the click was not asserted).

## 5. W4 CLS (cls-before-375.json, cls-after-375.json, cls-before-1440.json, cls-after-1440.json)
375 px, 7 runs each, medians (identical across all 7 runs, deterministic):

| URL | before (147897a) | after |
|---|---|---|
| d11 | 0.7867 | 0.0013 |
| d16 | 0.8349 | 0.0007 |
| d17 | 0.8541 | 0.0001 |
| d18 | 0.854 | 0 |
| d19 | 0.7867 | 0.0013 |
| d20 | 0.7867 | 0.0013 |
| d21 | 0.7867 | 0.0013 |
| ?ad=d1&hero=none | 0.8541 | 0.0001 |
| no ad | 0.8541 | 0.0001 |
| d2 (interactive) | 0.386 | 0.386 |
| d4 (interactive) | 0.1769 | 0.1769 |
| d19&hero=games (interactive) | 0.161 | 0.161 |

R4.2 met: every page A hero is far under 0.1 and interactive heroes are unchanged (delta 0.00). Observation: d2 (0.386), d4 (0.177) and d19&hero=games (0.161) are themselves over 0.1 before and after. That is pre-existing and allowed by R4.2 ("no worse than +0.02") but they remain poor CLS pages (SB-4). 1440x900, 5 runs: d19 0.0189 before and after, d2 0.0986 before and after: desktop unchanged.

## 6. Visual parity (parity.json; images screenshots/sentry-landing-*-{before,after}.png)
d18, d19, d21, d2 at 375 and 1440, settled 6 s, both above-the-fold and full page (16 pairs), animations disabled: differing pixel share 0.0000 % in every pair (same dimensions, 0 pixels over a 30-level channel-sum threshold); the before-vs-before noise floor is also 0. Spot-viewed d19 375: hero, headline and form render correctly.
