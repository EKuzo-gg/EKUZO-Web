# F9 form_start evidence (Sentry)

Page: `/season1?ad=d5&utm...`, fresh context per row, Chromium 141 (headless). `form_start` counted two ways: gtag calls in `dataLayer` (page level) and GA4 collect beacons intercepted and decoded (query `en=` plus batched POST body lines). After each scenario the page waits 2.5 s, then fires visibilitychange/pagehide to flush the GA4 batch, then waits 2 s. Values show the `where` of every form_start seen, so `[]` = zero, `["top","bottom"]` = one per form.

| # | Scenario | Baseline :3001 | Build :3002 | Expected build | Verdict |
|---|---|---|---|---|---|
| 1 | simulated autofill (script value + synthetic input/change) | DL ["top","bottom"] / GA4 beacon ["top","bottom"] | DL [] / GA4 beacon [] | base>0, build 0 | PASS |
| 2a | trusted input, locator.fill() both fields | DL ["top","bottom"] / GA4 beacon ["top","bottom"] | DL [] / GA4 beacon [] | base>0, build 0 | PASS |
| 2b | trusted input, CDP Input.insertText after programmatic focus | DL ["top","bottom"] / GA4 beacon ["top","bottom"] | DL [] / GA4 beacon [] | base>0, build 0 | PASS |
| 3 | page load, tap hero CTA (programmatic focus of top field) | DL [] / GA4 beacon [] | DL [] / GA4 beacon [] | build 0 | PASS |
| 4a | real tap on top field (touch context) | DL ["top"] / GA4 beacon ["top"] | DL ["top"] / GA4 beacon ["top"] | build 1 top | PASS |
| 4b | real mouse click on top field | DL ["top"] / GA4 beacon ["top"] | DL ["top"] / GA4 beacon ["top"] | build 1 top | PASS |
| 5 | keyboard.type into top field (after programmatic focus) | DL ["top"] / GA4 beacon ["top"] | DL ["top"] / GA4 beacon ["top"] | build 1 top | PASS |
| 6 | trusted paste (Ctrl+V) into bottom field after programmatic focus | DL ["bottom"] / GA4 beacon ["bottom"] | DL ["bottom"] / GA4 beacon ["bottom"] | build 1 bottom | PASS |
| 7 | type in both fields (click+type each) | DL ["top","bottom"] / GA4 beacon ["top","bottom"] | DL ["top","bottom"] / GA4 beacon ["top","bottom"] | build 1 top + 1 bottom | PASS |
| 8 | keyboard Tab focus into top field, no key press inside it | DL ["top"] / GA4 beacon ["top"] | DL [] / GA4 beacon [] | build 0 | PASS |
| 9 | CDP Autofill.trigger with saved address (real autofill attempt) | DL ["top"] / GA4 beacon ["top"] | DL [] / GA4 beacon [] | n/a | not feasible (see below) |

## Reading the table

- Rows 1, 2a, 2b (autofill-like value changes and trusted input without a key press): baseline fires once per form (an over-count of 2 per visitor who autofills both fields, or 1 for one field); the build fires 0.
- Row 3 (tap the hero CTA, programmatic focus of the top field after the scroll): baseline already fired 0 here thanks to its `progFocus` guard; the build also fires 0. The baseline over-count therefore comes from the `input` listener (autofill) and from the `focus` listener on any non-CTA programmatic or tab focus, not from the CTA path.
- Rows 4a/4b (real tap with a touch context, real click) and 5 (typing): both versions fire exactly once for the top form. Row 6 (trusted Ctrl+V paste into the bottom field): once, `bottom`. Row 7: exactly one per form (`top` and `bottom`), not two.
- Row 8 (keyboard Tab into the field, no key press inside it): baseline fires on focus, build fires 0 until the visitor presses a key or pastes. This is a deliberate narrowing of F9 (tab-focus alone is not counted); keyboard-only visitors who then type are counted on their first key.
- Row 9: real browser autofill. Chrome's CDP `Autofill.setAddresses` accepted a saved address, but `Autofill.trigger` returned "Invalid parameters" on this Chromium (141) for an isolated email field with every parameter shape tried (with and without frameId, address-only), so Chrome's own autofill could not be driven in headless mode. The "baseline fires" in that row comes from the harness's programmatic `focus()` call, not from autofill, and is not evidence. Row 1/2 are the proxies for autofill (a script-set value with synthetic input/change events, and trusted insertText input events without keys). **Real in-app-browser autofill (Instagram/Facebook webview) is not tested here and needs a device check.**

## Verdict

**F9 PASS** for rows 1 to 8 (build fires 0 on 1, 2a, 2b, 3, 8 and once per form on 4a, 4b, 5, 6, 7). Page-level and network-level counts agree in every row. Raw: `raw-f9-form-start.json`.

## Link to the GA4 symptom

GA4 showed `form_start` for 92 of 136 users, about twice each. Rows 1, 2a and 2b reproduce exactly that on the baseline: an autofill-like value change fires `form_start` for the top form and for the bottom form, two events per visitor, with no tap or key press. That matches the "about twice each" pattern and is the most likely source of the over-count. It is a reproduction by proxy, not by a real in-app browser.
