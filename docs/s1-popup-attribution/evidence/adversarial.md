# Adversarial tests (Sentry, build :3002 only)

Browser cases: Playwright, fresh context each, Klaviyo/Meta intercepted server-side. Route cases: direct POSTs to /api/season-one on the build, with the Klaviyo event read from the intercepted call. Detail per case is in `raw-adversarial-browser.json` and `raw-adversarial-route.json`.

## Browser cases

| ID | Case | Result | Key evidence |
|---|---|---|---|
| ADV-1a | storage throws: landing page, form and sign-up still work (confirmation shown, Klaviyo event with attribution_from url, GA generate_lead and Clarity signup fire) | PASS | {"status":200,"doneVisible":true,"event":{"source":"ad-landing","ad":"d5","utm_source":"meta","utm_medium":"paid_social","utm_campaign":"season1","utm_content":"d5-a-showup","utm_term":"Instagram_Feed","utm_id":"120251332838180600","site":"ig","attribution_fro |
| ADV-1b | storage throws: popup on / still opens and signs up, attribution none (nothing readable) | PASS | {"status":200,"ev":{"source":"site-popup","ad":"","utm_source":"","utm_medium":"","utm_campaign":"","utm_content":"","utm_term":"","utm_id":"","site":"","attribution_from":"none"},"console":[],"pageerrors":[{"msg":"blocked","stack":"Uncaught SecurityError: blo |
| ADV-2:malformed {bad | both keys hold {bad: popup works, resolves to none | PASS | {"ev":{"source":"site-popup","ad":"","utm_source":"","utm_medium":"","utm_campaign":"","utm_content":"","utm_term":"","utm_id":"","site":"","attribution_from":"none"},"console":[],"pageerrors":[],"ownPageerrors":[]} |
| ADV-2:JSON array | both keys hold [1,2]: popup works, resolves to none | PASS | {"ev":{"source":"site-popup","ad":"","utm_source":"","utm_medium":"","utm_campaign":"","utm_content":"","utm_term":"","utm_id":"","site":"","attribution_from":"none"},"console":[],"pageerrors":[],"ownPageerrors":[]} |
| ADV-2:JSON string | both keys hold "x": popup works, resolves to none | PASS | {"ev":{"source":"site-popup","ad":"","utm_source":"","utm_medium":"","utm_campaign":"","utm_content":"","utm_term":"","utm_id":"","site":"","attribution_from":"none"},"console":[],"pageerrors":[],"ownPageerrors":[]} |
| ADV-2:JSON null | both keys hold null: popup works, resolves to none | PASS | {"ev":{"source":"site-popup","ad":"","utm_source":"","utm_medium":"","utm_campaign":"","utm_content":"","utm_term":"","utm_id":"","site":"","attribution_from":"none"},"console":[],"pageerrors":[],"ownPageerrors":[]} |
| ADV-2:number | both keys hold 42: popup works, resolves to none | PASS | {"ev":{"source":"site-popup","ad":"","utm_source":"","utm_medium":"","utm_campaign":"","utm_content":"","utm_term":"","utm_id":"","site":"","attribution_from":"none"},"console":[],"pageerrors":[],"ownPageerrors":[]} |
| ADV-2:object with non-string values | both keys hold {"at":1791738913556,"utm_source":5,"utm_medium":{"a":1},"utm: popup works, resolves to none | PASS | {"ev":{"source":"site-popup","ad":"","utm_source":"","utm_medium":"","utm_campaign":"","utm_content":"","utm_term":"","utm_id":"","site":"","attribution_from":"none"},"console":[],"pageerrors":[],"ownPageerrors":[]} |
| ADV-2:at as string | return-visit key only holds {"at":"1791738913556","utm_source":"meta","ad":"d5"}: popup works, resolves to none | PASS | {"ev":{"source":"site-popup","ad":"","utm_source":"","utm_medium":"","utm_campaign":"","utm_content":"","utm_term":"","utm_id":"","site":"","attribution_from":"none"},"console":[],"pageerrors":[],"ownPageerrors":[]} |
| ADV-2:at null | return-visit key only holds {"at":null,"utm_source":"meta","ad":"d5"}: popup works, resolves to none | PASS | {"ev":{"source":"site-popup","ad":"","utm_source":"","utm_medium":"","utm_campaign":"","utm_content":"","utm_term":"","utm_id":"","site":"","attribution_from":"none"},"console":[],"pageerrors":[],"ownPageerrors":[]} |
| ADV-2:at NaN-like (1e999) | return-visit key only holds {"at":1e999,"utm_source":"meta","ad":"d5"}: popup works, resolves to none | PASS | {"ev":{"source":"site-popup","ad":"","utm_source":"","utm_medium":"","utm_campaign":"","utm_content":"","utm_term":"","utm_id":"","site":"","attribution_from":"none"},"console":[],"pageerrors":[],"ownPageerrors":[]} |
| ADV-2b | session record with valid utm_source plus non-string others: strings kept, non-strings become empty, from session | PASS | {"source":"site-popup","ad":"d5","utm_source":"meta","utm_medium":"","utm_campaign":"","utm_content":"d5-a-showup","utm_term":"","utm_id":"","site":"","attribution_from":"session"} |
| ADV-3 | landing d5 then d7 in the same tab, then /: d7 wins (D1) | PASS | {"storageAfterD7":{"session":"{\"utm_source\":\"meta\",\"utm_medium\":\"paid_social\",\"utm_campaign\":\"season1\",\"utm_content\":\"d7-a-showup\",\"utm_term\":\"Instagram_Feed\",\"utm_id\":\"120251332838180600\",\"site\":\"ig\",\"ad\":\"d7\"}","local":"{\"at\ |
| ADV-4 | organic utm page first, then /season1 d5, then /: d5 wins (D1) | PASS | {"stOrganicSession":"{\"utm_source\":\"newsletter\",\"utm_medium\":\"email\",\"utm_campaign\":\"\",\"utm_content\":\"\",\"utm_term\":\"\"}","stLandingSession":"{\"utm_source\":\"meta\",\"utm_medium\":\"paid_social\",\"utm_campaign\":\"season1\",\"utm_content\" |
| ADV-5 | after landing, popup on /?utm_source=newsletter: URL wins, from url, ad empty, other keys empty | PASS | {"source":"site-popup","ad":"","utm_source":"newsletter","utm_medium":"","utm_campaign":"","utm_content":"","utm_term":"","utm_id":"","site":"","attribution_from":"url"} |
| ADV-6:/season1?ad=d5 | landing /season1?ad=d5 writes nothing; popup on / resolves to none | PASS | {"st":{"session":null,"local":null},"ev":{"source":"site-popup","ad":"","utm_source":"","utm_medium":"","utm_campaign":"","utm_content":"","utm_term":"","utm_id":"","site":"","attribution_from":"none"}} |
| ADV-6:/season1?ad=d5&utm_id=123&site=ig | landing /season1?ad=d5&utm_id=123&site=ig writes nothing; popup on / resolves to none | PASS | {"st":{"session":null,"local":null},"ev":{"source":"site-popup","ad":"","utm_source":"","utm_medium":"","utm_campaign":"","utm_content":"","utm_term":"","utm_id":"","site":"","attribution_from":"none"}} |
| ADV-6:/season1 | landing /season1 writes nothing; popup on / resolves to none | PASS | {"st":{"session":null,"local":null},"ev":{"source":"site-popup","ad":"","utm_source":"","utm_medium":"","utm_campaign":"","utm_content":"","utm_term":"","utm_id":"","site":"","attribution_from":"none"}} |
| ADV-7 | ?ad=bogus with full utms: stored ad empty, utms stored; d05 -> d5 (full table in detail) | PASS | table below |
| ADV-8 | 1000-char values capped at 200 in both stores (route then applies its own caps) | PASS | {"sessionLens":{"utm_source":200,"utm_medium":200,"utm_campaign":200,"utm_content":200,"utm_term":200,"utm_id":200,"site":200,"ad":2},"popupRequestLens":{"utm_source":200,"utm_medium":200,"utm_campaign":200,"utm_content":200,"utm_term":200,"utm_id":200,"site": |
| T1 | stored records after landing sign-up + game chip: only ad keys + at; no email, no chip text | PASS | {"keys":"ad,at,site,utm_campaign,utm_content,utm_id,utm_medium,utm_source,utm_term","dump":{"local":{"ekuzo_s1_attribution":"{\"at\":1791739060179,\"utm_source\":\"meta\",\"utm_medium\":\"paid_social\",\"utm_campaign\":\"season1\",\"utm_content\":\"d5-a-showup |

### ADV-7: stored `ad` for each `?ad=` value (landing, with utm_source=meta)

| URL ad value | Stored ad | utm_source stored |
|---|---|---|
| "d5" | "d5" | meta |
| "D5" | "d5" | meta |
| "d05" | "d5" | meta |
| "d12" | "d12" | meta |
| "d13" | "" | meta |
| "d0" | "" | meta |
| "d" | "" | meta |
| "d5x" | "" | meta |
| "%20d5" | "" | meta |
| "" | "" | meta |
| "bogus" | "" | meta |
| "d010" | "d10" | meta |
| "d012" | "d12" | meta |
| "d1" | "d1" | meta |
| "d01" | "d1" | meta |
| "d00" | "" | meta |

### ad normalizer parity (landing inline vs lib vs route)

| Value | Landing (stored) | lib normalizeAdId (via resolveSeasonOneAttribution) | Route normalizeAd |
|---|---|---|---|
| "d5" | "d5" | "d5" | "d5" |
| "D5" | "d5" | "d5" | "d5" |
| "d05" | "d5" | "d5" | "d5" |
| "d12" | "d12" | "d12" | "d12" |
| "d13" | "" | "" | "" |
| "d0" | "" | "" | "" |
| "d" | "" | "" | "" |
| "d5x" | "" | "" | "" |
| " d5" | "" | "d5" | "d5" | **differs**
| "" | "" | "" | "" |
| "d010" | "d10" | "" | "" | **differs**
| "d012" | "d12" | "" | "" | **differs**
| "d01" | "d1" | "d1" | "d1" |

The three rows that differ (`" d5"`, `d010`, `d012`) are inputs no ad URL generates. The landing's inline rule (`toLowerCase().replace(/^d0/,"d")`, no trim) is what the page itself uses to pick its theme, so a stored `d10` for `d010` matches what the visitor saw; lib and route reject it. Logged as D-003 (minor). The auditor's test-design item 8 asked for a parity test; none exists.

## Route cases (build)

| ID | Case | Result | Detail |
|---|---|---|---|
| RT-1 | forged attributionFrom=session with empty attribution -> none | PASS | {"status":200,"from":"none"} |
| RT-2 | attributionFrom=evil with utms -> none (utms still stored) | PASS | {"from":"none","utm_source":"meta"} |
| RT-3:array | attribution as array -> 200, empty values, none | PASS | {"status":200,"from":"none"} |
| RT-3:string | attribution as string -> 200, empty values, none | PASS | {"status":200,"from":"none"} |
| RT-3:number | attribution as number -> 200, empty values, none | PASS | {"status":200,"from":"none"} |
| RT-3:null | attribution as null -> 200, empty values, none | PASS | {"status":200,"from":"none"} |
| RT-3:array of objects | attribution as array of objects -> 200, empty values, none | PASS | {"status":200,"from":"none"} |
| RT-4:url | valid label url with utms passes through | PASS | {"from":"url"} |
| RT-4:session | valid label session with utms passes through | PASS | {"from":"session"} |
| RT-4:return-visit | valid label return-visit with utms passes through | PASS | {"from":"return-visit"} |
| RT-5 | popup with utms but no attributionFrom -> none | PASS | {"from":"none"} |
| RT-5b | attributionFrom as array -> none | PASS | {"from":"none"} |
| RT-6 | ad-landing with utms ignores client label -> url | PASS | {"from":"url"} |
| RT-7 | ad-landing with no utms (client claims session) -> none | PASS | {"from":"none"} |
| RT-8 | ad-landing with only site -> url (any of the seven) | PASS | {"from":"url"} |
| RT-9 | unknown source falls back to site-popup and keeps the label | PASS | {"source":"site-popup","from":"session"} |
| RT-10 | popup ad=d5-a-showup (old utm_content fallback value) is rejected by the route allowlist -> ad empty, rest intact | PASS | {"ad":"","from":"session"} |
| RT-11 | games step ignores attribution/attributionFrom (event props have no attribution_from) | PASS | {"status":200,"last":"{\"kid_games\":\"Minecraft\"}"} |
| RT-12 | route ad normalizer table (informational) | PASS | {"\"d5\"":"d5","\"D5\"":"d5","\"d05\"":"d5","\"d12\"":"d12","\"d13\"":"","\"d0\"":"","\"d\"":"","\"d5x\"":"","\" d5\"":"d5","\"\"":"","\"d010\"":"","\"d012\"":"","\"d01\"":"d1"} |

## F3 extras (build)

- Non-LIVE host (http://127.0.0.1:3002, not matched by the page's LIVE regex): storage is still written (session and local records filled), the form shows the confirmation, no API call (`apiPosts: 0`), no Klaviyo/Meta call, no GA `generate_lead` (0). F3 "no LIVE gate on the storage write" confirmed.
- `/season1?utm_source=meta&utm_medium=paid_social` with no `ad` param: the page falls back to its d1 theme ("EKUZO · We've all said it") but the stored `ad` is empty, as F1 requires.

## Notes

- ADV-1: with `Storage.prototype.getItem/setItem` forced to throw, our code is clean: the landing form works, the sign-up succeeds (Klaviyo event `attribution_from: url`, GA `generate_lead` once, Clarity `signup` once) and the popup on `/` signs up with `none`. The only page error is `Uncaught SecurityError` thrown by third-party **clarity.js** (stack in scripts.clarity.ms), identical on the baseline (:3001); it is not from our origin.
- ADV-2: cases where only the return-visit key holds an invalid `at` (string, null, 1e999 parsed as Infinity) resolve to `none`. (In my first run I seeded the session key too with a valid-looking record, which correctly resolved to `session`; that was a test-design error, not a defect.)
- ADV-8: values are capped at 200 chars in both stores and in the popup request; the route then applies its own caps (120, utm_content 160, utm_id 40, site 20), so what reaches Klaviyo is shorter than what the stores hold. Not a defect, but the stores' 200 is not the effective limit.
