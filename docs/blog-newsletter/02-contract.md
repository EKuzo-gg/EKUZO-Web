# 02 Contract: blog newsletter capture (A/B) + inquiry-form attribution

Author: Relay. Inputs: 00-brief.md, scout-map.md, 01-requirements.md. Status: contract only, no implementation. Every body shown below is the target shape after T1 to T3, P9, P10 and T4 land; where a shape is unchanged from today that is stated explicitly.

All example JSON in this document was checked against the current `app/api/newsletter/route.ts` and `app/api/contact/route.ts` behavior in this checkout (2026-09-15), by running the unmodified route handlers under plain node with a mocked `global.fetch`, not by reading the source alone. See section 7 for how.

---

## 1. Client to server contract for POST /api/newsletter

```ts
type NewsletterRequestBody = {
  email: string;           // required
  firstName?: string;      // optional, unchanged from today
  utm_source?: string;     // optional, NEW, allowlist-validated
  utm_medium?: string;     // optional, NEW, allowlist-validated
  utm_campaign?: string;   // optional, NEW, allowlist-validated
};
```

Only `email` is required. Everything else, including all three new `utm_*` fields, is optional.

**Allowlists (T1, verbatim):**
- `utm_source` in `{ newsletter-signup, blog }`
- `utm_medium` in `{ popup, sticky, footer }`
- `utm_campaign` in `{ thumbs, classic }`

Anything outside these sets is dropped, not rejected. Dropping a field means the request is still accepted and processed as if that field had been omitted; the route never returns 400 for an out-of-allowlist utm value.

**Fallback behavior:**
- Missing or invalid `utm_source` falls back to today's hardcoded value, `"newsletter-signup"`, which is always sent to Beehiiv.
- Missing or invalid `utm_medium` is simply omitted from the Beehiiv body (today's route never sends this key at all, so "omitted" is the only fallback that preserves N3).
- Missing or invalid `utm_campaign` is likewise omitted.
- Each of the three fields is evaluated independently. A request can have one valid field, one missing field and one invalid field at the same time; each gets its own fallback per the rules above.

**Response shape (unchanged):**
| Status | Body | When |
|---|---|---|
| 200 | `{ success: true }` | Beehiiv create-subscription succeeded |
| 400 | `{ error: "Email is required" }` | `email` missing (the only validation error; invalid utm values never produce a 400) |
| 500 | `{ error: "Server configuration error" }` | `BEEHIIV_API_KEY` or `BEEHIIV_PUBLICATION_ID` unset |
| 500 | `{ error: "Failed to subscribe. Please try again." }` | Beehiiv create-subscription returned non-ok |
| 500 | `{ error: "Internal server error" }` | Any thrown exception |

**FooterNewsletter and the homepage NewsletterPopup do not change.** `components/ui/FooterNewsletter.tsx` sends `{ email }` and `components/ui/NewsletterPopup.tsx` sends `{ email, firstName }`; neither is touched by this work and neither will ever include a `utm_*` key. Both fall straight into the "no utm fields" fallback path in section 2, case (a), which is defined to be byte-identical to today's outbound Beehiiv body. This is what N3 checks.

---

## 2. Server to Beehiiv contract for create-subscription

**Exact body sent today**, confirmed by running the current route with a mocked fetch and a plain `{ email }` payload:

```json
{
  "email": "a@b.com",
  "utm_source": "newsletter-signup",
  "referring_site": "https://ekuzo.gg",
  "custom_fields": []
}
```

`custom_fields` becomes `[{ "name": "first_name", "value": "<firstName>" }]` when `firstName` is present, otherwise `[]`. `utm_medium`, `utm_campaign`, `send_welcome_email` and `automation_ids` are never sent by this route today.

**After the change, per case:**

**(a) No utm fields** (FooterNewsletter, the homepage popup, or any blog call that happens to omit all three): body is unchanged from today, exactly the block above. This is the case N3 pins.

**(b) Blog popup, thumbs.** Client sends `{ email, firstName?, utm_source: "blog", utm_medium: "popup", utm_campaign: "thumbs" }`, all three valid:

```json
{
  "email": "reader@example.com",
  "utm_source": "blog",
  "utm_medium": "popup",
  "utm_campaign": "thumbs",
  "referring_site": "https://ekuzo.gg",
  "custom_fields": []
}
```

**(c) Blog sticky bar, classic.** Client sends `{ email, utm_source: "blog", utm_medium: "sticky", utm_campaign: "classic" }`:

```json
{
  "email": "reader@example.com",
  "utm_source": "blog",
  "utm_medium": "sticky",
  "utm_campaign": "classic",
  "referring_site": "https://ekuzo.gg",
  "custom_fields": []
}
```

**(d) Invalid values.** Two sub-cases worth testing explicitly:

- All three invalid, e.g. `{ utm_source: "spammy-source", utm_medium: "email-blast", utm_campaign: "unknown-variant" }`. All three fall back per section 1, so the outbound body reduces to exactly case (a)'s shape: `utm_source: "newsletter-signup"`, no `utm_medium`, no `utm_campaign`. This is a useful invariant: fully-invalid input is indistinguishable at the Beehiiv boundary from no-utm-fields input.
- Mixed, e.g. `{ utm_source: "blog", utm_medium: "popup", utm_campaign: "SOMETHING_ELSE" }`. `utm_source` and `utm_medium` are valid and pass through; `utm_campaign` is dropped and omitted:

```json
{
  "email": "reader@example.com",
  "utm_source": "blog",
  "utm_medium": "popup",
  "referring_site": "https://ekuzo.gg",
  "custom_fields": []
}
```

This mixed case also matters for tagging, see section 3's edge case.

**`referring_site`: keep the hardcoded value.** Recommendation: leave `referring_site: "https://ekuzo.gg"` hardcoded for `/api/newsletter`, do not switch it to the calling page's URL. Reasons:
1. Neither P3 nor P7's request body (the sticky bar and popup payload shapes the requirements define) includes a `pageUrl` field at all, unlike `/api/contact`, which already carries `pageUrl` from the client today. Passing the page URL here would mean adding a new client field that no requirement asks for, which is scope creep past T1's exact allowlist.
2. Page-level attribution is not lost, it is just carried by a different field: `utm_medium` (`popup` vs `sticky`) and `utm_campaign` (`thumbs` vs `classic`) already tell Beehiiv which surface and which variant produced the signup, which is the attribution granularity the brief actually asks for (00-brief.md line 12).
3. If Jamie later wants per-post `referring_site` values, that is a follow-up change to P3/P7's body shape, not something to smuggle into this contract.

---

## 3. Tagging contract (T2, T3)

**Endpoint (unchanged):** `POST https://api.beehiiv.com/v2/publications/{publicationId}/subscriptions/{subscriptionId}/tags`, body `{ "tags": [...] }`. Fired only after the create-subscription call returns a subscriber id.

**Tags per case:**
| Resolved `utm_source` | Resolved `utm_campaign` | Tags sent |
|---|---|---|
| not `"blog"` (falls back to `newsletter-signup`, i.e. every non-blog caller) | any | `["source-newsletter"]`, exactly as today |
| `"blog"`, campaign valid (`thumbs` or `classic`) | `thumbs` or `classic` | `["source-blog", "variant-thumbs"]` or `["source-blog", "variant-classic"]` |
| `"blog"`, campaign missing or invalid | none | `["source-blog"]` only, no `variant-*` tag |

Blog-sourced signups never get `source-newsletter` at all (T2: "in addition to nothing else"). This is a strict either/or on `source-newsletter` vs `source-blog`, never both.

The third row is an edge case not explicitly enumerated in 01-requirements.md's table: it covers a blog-sourced signup whose `utm_campaign` was missing or got dropped by the allowlist (section 2's mixed example). It follows directly from T2's rule that a blog signup never gets `source-newsletter`, combined with T2's "variant-`<campaign>`" wording, which has nothing to template when there is no valid campaign. Flagging this for Story/Auditor sign-off in section 9.

**Non-blocking semantics, preserved exactly.** Today's code initiates the tag `fetch()` call and attaches `.catch(err => console.error(...))` to it, but never `await`s that promise before the enclosing function reaches `return NextResponse.json({ success: true })`. Because `fetch()` dispatches the network request synchronously on the call and only *resolves* later, the response is already built and returned before the tag call's outcome (success, failure, or thrown error) is known. A tag failure therefore cannot reach the response path; there is no `try` around the response that a rejected tag promise could trip.

**Should the tag call be awaited before returning? Recommend keeping it un-awaited, exactly as today.** Two reasons: it trivially satisfies T3 without extra bookkeeping (nothing can fail after the response is already sent), and it keeps the response latency as low as it is today, since the client does not wait on a second round trip to Beehiiv's tags endpoint just to see `{ success: true }`.

**How Sentry can still test an un-awaited call with a mocked fetch.** The call to `fetch(url, opts)` happens synchronously, before the route function returns; only its *resolution* happens later. A mock that records the call arguments on invocation, not on settle, captures the tag call correctly even though the route never awaits it:

```ts
const calls: { url: string; body: string }[] = [];
global.fetch = async (url, opts) => {
  calls.push({ url: String(url), body: opts?.body as string }); // recorded synchronously
  if (String(url).includes("/tags")) return { ok: true, json: async () => ({}) };
  return { ok: true, json: async () => ({ data: { id: "sub_123" } }) };
};

const res = await POST(req);
// calls[1] is already populated here, no extra tick needed,
// because the push happened when fetch() was called, not when it resolved.
```

This was verified directly against the unmodified route in this checkout: after `await POST(req)` resolves, the tags call is already present in `calls` with its body intact. No `setTimeout`/microtask flush is needed as long as the mock records on invocation.

---

## 4. Client to server contract for POST /api/contact

```ts
type ContactRequestBody = {
  name: string;             // required
  organization?: string;
  contactMethod: "email" | "text"; // required
  email?: string;            // required when contactMethod === "email"
  phone?: string;            // required when contactMethod === "text"
  message?: string;
  pageUrl?: string;
  heardAbout?: string;       // NEW, optional, one of the 8 canonical slugs below
};
```

**The eight canonical slugs**, and the option label each maps to. The `<select>`'s option `value` attributes should be the slugs themselves, so the client already sends the slug and no label-to-slug translation is needed on the server:

| Select option label (Story/P9 wording) | `heardAbout` slug |
|---|---|
| X (Twitter) | `x` |
| Instagram | `instagram` |
| TikTok or YouTube | `tiktok-youtube` |
| Google search | `google` |
| ChatGPT or another AI | `ai` |
| A friend or another parent | `friend` |
| My kid's school | `school` |
| Other | `other` |

**Validation: unknown values are dropped, not rejected.** If `heardAbout` is absent, an empty string (the default "Choose one" option), or any string outside the eight slugs above, the server treats it as absent: it is left out of the Resend email line and no `heard-<slug>` tag is applied, but the request still succeeds with `{ success: true }`. This matches T1's "dropped, not rejected" pattern, applied consistently across both routes.

**Downstream effect 1: Resend email.** Add a line to the existing HTML body, only when `heardAbout` resolves to one of the eight slugs: `<p><strong>How they heard about us:</strong> ${label}</p>`, using the display label from the table above (not the raw slug). The route should keep a `HEARD_ABOUT_LABELS: Record<string, string>` map mirroring that table so the email always shows human text; when the value does not resolve, the line is omitted entirely, never rendered blank or as `undefined`.

**Downstream effect 2: Beehiiv tag `heard-<slug>`.** Applied via the existing tag call pattern for `/api/contact`, which already runs `await fetch(.../tags, { body: JSON.stringify({ tags: [...] }) })` inside a try/catch immediately after a successful create-subscription. Add the new tag to the *same* array and the *same* call rather than firing a second request:

```json
{ "tags": ["source-contact-form", "heard-x"] }
```

This is non-blocking in the same sense the existing contact-form Beehiiv block already is: the whole block is wrapped in try/catch, so a failure here (including a failure to apply the tag) never fails the contact submission, even though, unlike `/api/newsletter`'s fire-and-forget pattern, this call is `await`ed before the code moves on to the Resend step. That existing await-then-catch shape is unchanged; only the tags array gains one more string when `heardAbout` is present and valid.

**No new `custom_fields` key.** `heardAbout` must never be added to the `custom_fields` array sent on create-subscription. It only ever reaches Beehiiv through the tag call, and only ever reaches Karlin through the Resend email body. This is what P10's "Grep: no new key in `custom_fields`" acceptance criterion checks, and it is consistent with the "no new Beehiiv custom fields" rule in `docs/beehiiv-config.md` and the repo's `CLAUDE.md`.

**N5 (unchanged case):** when `heardAbout` is absent, both the Resend HTML and the Beehiiv payload must be byte-identical to today's output. Since the new line and the new tag are both added conditionally, this falls out of the implementation directly rather than needing a separate branch.

---

## 5. lib/newsletterAb.ts interface (T4)

**Storage keys (verbatim from T4):**
```ts
export const VARIANT_KEY = "ekuzo_nl_variant";
export const DISMISSED_AT_KEY = "ekuzo_nl_blog_dismissed_at";
export const SUBSCRIBED_AT_KEY = "ekuzo_nl_blog_subscribed_at";
```

**Named windows:**
```ts
/** Re-ask window for a dismissed popup: 30 days, in milliseconds. */
export const DISMISS_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

/** Suppression window after a successful subscribe: 365 days, in milliseconds. */
export const SUBSCRIBED_WINDOW_MS = 365 * 24 * 60 * 60 * 1000;
```

**Injectable storage interface**, so the module runs in plain node with no DOM:
```ts
export interface AbStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
```
Production callers pass `window.localStorage`; tests pass a plain in-memory object (`{ getItem, setItem }` backed by a `Map` or a plain object) with no browser APIs involved. Every function below wraps its own `storage.getItem`/`storage.setItem` calls in try/catch internally, not just at the call site, because a caller may hand it real `localStorage` directly and any access to it can throw (private browsing, quota exceeded, storage disabled).

**Function signatures:**

```ts
/**
 * Returns the reader's assigned popup and sticky-bar copy variant for this
 * browser, assigning and persisting a new one on first call.
 *
 * - If a valid variant ("thumbs" or "classic") is already stored under
 *   VARIANT_KEY, that value wins and is returned as-is. The variant, once
 *   validly assigned, is never reassigned.
 * - Otherwise assigns randomly: random() < 0.5 ? "thumbs" : "classic", then
 *   attempts to persist it via storage.setItem before returning it.
 * - If storage.getItem or storage.setItem throws (storage unavailable),
 *   the error is caught and the function returns "thumbs" WITHOUT
 *   attempting to store anything. (Spec-change 2026-09-16, decision D-05: fallback is the preferred arm, thumbs; the original draft said classic.)
 *
 * @param storage - injectable storage (window.localStorage in production)
 * @param random - injectable RNG, () => number in [0, 1); defaults to
 *   Math.random so tests can pass a fixed-sequence stub for deterministic
 *   assertions
 * @returns "thumbs" | "classic"
 */
export function getOrAssignVariant(
  storage: AbStorage,
  random?: () => number
): "thumbs" | "classic";
```

```ts
/**
 * True when the blog popup should currently be shown to this reader.
 *
 * - false when a dismissal timestamp is stored under DISMISSED_AT_KEY and
 *   now - dismissedAt < DISMISS_WINDOW_MS (30 days).
 * - false when a subscribe timestamp is stored under SUBSCRIBED_AT_KEY and
 *   now - subscribedAt < SUBSCRIBED_WINDOW_MS (365 days).
 * - true otherwise, including when storage access throws (storage
 *   unavailable defaults to SHOWING the popup, per T4).
 *
 * The dismiss check and the subscribe check are independent; either one
 * being "within its window" is sufficient on its own to suppress the popup.
 *
 * @param storage - injectable storage
 * @param now - injectable current time in ms since epoch; defaults to
 *   Date.now() so tests can pass a fixed value
 */
export function shouldShowPopup(storage: AbStorage, now?: number): boolean;
```

```ts
/**
 * Records a dismissal (close button, Escape, or backdrop click) at `now`,
 * so shouldShowPopup returns false for the next DISMISS_WINDOW_MS.
 * Storage errors are caught and ignored (best-effort, never throws).
 */
export function recordDismiss(storage: AbStorage, now?: number): void;
```

```ts
/**
 * Records a successful subscribe at `now`, so shouldShowPopup returns
 * false for the next SUBSCRIBED_WINDOW_MS. Storage errors are caught and
 * ignored (best-effort, never throws).
 */
export function recordSuccess(storage: AbStorage, now?: number): void;
```

```ts
/**
 * True only for a real blog post page: pathnames matching
 * /^\/blog\/[^/]+\/?$/ that do NOT start with "/blog/author/".
 * False for "/blog" (the index, no trailing segment to match) and for
 * any "/blog/author/*" page. The regex alone already excludes multi-
 * segment paths like "/blog/author/jamie-fitch" (the "/" inside fails
 * [^/]+), but the explicit "/blog/author/" prefix check is kept as a
 * second, independent guard per T4's exact wording.
 */
export function isBlogPostPath(pathname: string): boolean;
```

---

## 6. Analytics: trackNewsletterSignup

**Recommend yes, add it.** Reasons: the Beehiiv tags (`source-blog`, `variant-thumbs`/`variant-classic`) give server-side, Beehiiv-report-only visibility into which arm converted; there is currently no client-side GA event that lets the team see sticky-vs-popup and thumbs-vs-classic conversion in the same GA4 property where every other funnel step (`register_click`, `generate_lead`, `ai_referral`) already lives, without pulling a separate Beehiiv report. The marginal cost of one more GA-only helper, mirroring `trackRegisterClick`'s exact shape, is small and keeps the pattern consistent.

**Signature**, placed directly after `trackRegisterClick` in `lib/analytics.ts`, GA-only by design (same rationale as `trackRegisterClick`: Beehiiv's own tag-based reporting already covers the "did this convert" question; a GA4 event covers "where on the funnel did it convert," and mirroring that into Pixel would not add targeting value):

```ts
export function trackNewsletterSignup(params: {
  source: "sticky" | "popup" | "footer";
  variant?: "thumbs" | "classic";
}) {
  ga4("newsletter_signup", {
    source: params.source,
    variant: params.variant,
  });
}
```

Fire it only after the `/api/newsletter` response resolves with `{ success: true }`, the same point where `ContactModal.tsx` fires `trackLead` today, not on submit. This is a recommendation for Atlas to implement; the contract here exists so the event name and parameter shape do not get reinvented differently in the sticky bar and the popup.

---

## 7. Test plan for the routes

**Approach.** Both route handlers are plain async functions exported from their `route.ts` files: `export async function POST(req: NextRequest)`. They only ever call `req.json()` on the incoming request and `NextResponse.json(...)` on the way out, so they can be exercised directly in node:

1. Set the three dummy env vars (below) before importing the route module.
2. Stub `global.fetch` with a function that inspects the URL to distinguish the create-subscription call from the tags call, records every call's URL and body synchronously (see section 3's note on testing an un-awaited call), and returns a canned `{ ok, json }` shape.
3. `const mod = await import("<path>/route.ts")`, then `const res = await mod.POST(req)`.
4. `req` can be a **plain WHATWG `Request`** (`new Request(url, { method: "POST", headers, body })`), not a `NextRequest`. Verified directly against both unmodified routes in this checkout: since neither handler calls anything beyond `req.json()`, a plain `Request` works exactly the same as a `NextRequest` at runtime; the `NextRequest` type in the function signature is a compile-time-only distinction once `.ts` is stripped.
5. Assert on `res.status`, `await res.json()`, and the recorded `calls` array's URLs and bodies.

**Cases, mapped to requirement IDs:**

| Case | Requirement | What to assert |
|---|---|---|
| POST with `{ email }` only | T1(a), N3 | Beehiiv body matches section 2 case (a) exactly |
| POST with `{ email, utm_source: "blog", utm_medium: "popup", utm_campaign: "thumbs" }` | T1(b) | Beehiiv body matches section 2 case (b) |
| POST with `{ email, utm_source: "blog", utm_medium: "sticky", utm_campaign: "classic" }` | T1(c) | Beehiiv body matches section 2 case (c) |
| POST with all three utm fields invalid | T1(d) | Beehiiv body reduces to case (a)'s exact shape |
| POST with a mixed valid/invalid combination (e.g. valid source+medium, invalid campaign) | T1(d) | `utm_campaign` key absent, other two present |
| Non-blog case, tag call body | T2 | `{ tags: ["source-newsletter"] }` |
| Blog case with valid campaign, tag call body | T2 | `{ tags: ["source-blog", "variant-thumbs"] }` or `variant-classic` |
| Blog case with missing/invalid campaign, tag call body | T2 (edge case, section 3) | `{ tags: ["source-blog"] }`, no `variant-*` |
| Tag endpoint mocked to return a 500 | T3 | Route still resolves `res.status === 200` and `{ success: true }` |
| `/api/contact` POST without `heardAbout` | N5, P10 | Resend HTML and Beehiiv payload byte-identical to today's |
| `/api/contact` POST with `heardAbout: "x"` | P10 | Resend HTML contains the "How they heard about us: X (Twitter)" line; tag call body contains `heard-x`; `custom_fields` unchanged (no new key) |
| `/api/contact` POST with an unrecognized `heardAbout` value | P10 (validation) | Behaves exactly like the no-`heardAbout` case: dropped, not rejected |

**Env vars the tests must set**, as dummies, before importing either route module:
```ts
process.env.BEEHIIV_API_KEY = "dummy-key";
process.env.BEEHIIV_PUBLICATION_ID = "pub_dummy";
process.env.RESEND_API_KEY = "dummy-resend-key"; // needed for /api/contact's Resend branch to run at all
```
Without `RESEND_API_KEY` set, `/api/contact`'s Resend block is skipped entirely (the route only calls Resend `if (RESEND_API_KEY)`), which would make the P10 Resend-line assertion untestable.

**Whether `next/server`'s `NextResponse` works under plain node, checked directly in this checkout:**

- `node_modules/next/package.json` reports version `16.2.1`. Node in this checkout is `v22.22.2`.
- `NextResponse` and `NextRequest` work correctly under plain node with zero Next.js runtime running: `NextResponse.json({ success: true })` returns a working `Response`-like object (`status`, `.json()`) and `new NextRequest(url, init).json()` parses the body correctly, both verified by direct execution.
- **`require("next/server")` (CommonJS) works with no shim.** Node's legacy CJS resolver probes `next/server.js` automatically for a bare `require("next/server")`.
- **A bare ESM `import ... from "next/server"` (no extension) does NOT work under plain node, and needs a tiny shim.** `next`'s own `package.json` has no `"exports"` map (`null`), so Node's ESM resolver, unlike its CJS resolver, will not add the missing `.js` extension on its own; `import("next/server")` fails with `ERR_MODULE_NOT_FOUND` ("Did you mean to import 'next/server.js'?"), while `import("next/server.js")` (explicit extension) succeeds. Since both `app/api/newsletter/route.ts` and `app/api/contact/route.ts` are written as `import { NextRequest, NextResponse } from "next/server";` (no extension, ESM), importing the real, unmodified route file via a dynamic `import()` hits this exact failure.
- **The shim, verified working end to end:** a ~6-line custom ESM resolution hook, registered via node's built-in `node:module` `register()` (no third-party loader needed), that rewrites the bare specifier `"next/server"` to `"next/server.js"`:
  ```ts
  // shim-next-server.mjs
  export async function resolve(specifier, context, nextResolve) {
    if (specifier === "next/server") {
      return nextResolve("next/server.js", context);
    }
    return nextResolve(specifier, context);
  }
  ```
  ```ts
  import { register } from "node:module";
  register("./shim-next-server.mjs", import.meta.url);
  // ...now `await import("./app/api/newsletter/route.ts")` and its internal
  // `import ... from "next/server"` both resolve correctly.
  ```
  This was run against the real, unmodified `app/api/newsletter/route.ts` in this checkout with a mocked `global.fetch`: the module imported cleanly, `POST(new Request(...))` returned `status 200` and `{ success: true }`, and the mocked fetch recorded the exact create-subscription body shown in section 2 case (a). No other change to the route files is needed; the shim lives entirely in the test harness.

---

## 8. Pre-flight questions for Fable to answer against the live Beehiiv API

All live calls must use a disposable identity (`newsletter-test+<timestamp>@ekuzo.gg` or similar) per I2, and any resulting subscriber id must be logged in `06-cleanup-ledger.md`. Beehiiv's public API docs live at `https://developers.beehiiv.com/` (confirmed domain); exact endpoint path slugs below are cited from memory and marked uncertain where I cannot verify the precise path without live access, which this contract-only phase does not have.

| # | Call | Purpose | Docs |
|---|---|---|---|
| 1 | `POST /v2/publications/{publicationId}/subscriptions` with `utm_source: "blog"`, `utm_medium: "popup"`, `utm_campaign: "thumbs"` on the disposable test address | Confirm create-subscription accepts `utm_medium` and `utm_campaign` (does not error, does not silently coerce them) | `https://developers.beehiiv.com/` (uncertain exact path, likely under an "api-reference/subscriptions" section) |
| 2 | `GET /v2/publications/{publicationId}/subscriptions/{subscriptionId}` on the subscriber created in call 1 | Confirm whether a subscription GET echoes back `utm_source`/`utm_medium`/`utm_campaign`, so we know these fields are actually stored and readable via the API, not merely accepted and discarded | Same docs domain; uncertain exact path |
| 3 | `POST /v2/publications/{publicationId}/subscriptions/{subscriptionId}/tags` with `{ "tags": ["source-blog", "variant-thumbs"] }` on the same disposable subscriber | Confirm the tag endpoint path and response shape still match `docs/beehiiv-config.md`'s documented behavior (POST-only, no removal), since that doc's own claim was last verified live on 2026-05-05 | Same docs domain; uncertain exact path |
| 4 | `GET /v2/publications/{publicationId}/automations` | List existing automations live, confirm they still match the two IDs documented in `docs/beehiiv-config.md` (camps `aut_4db31c63-807e-40fa-9184-f75ff2fcfdcc`, e100 `aut_3dd66d4e-4dbd-410d-8fd5-e2fdacac8556`) and confirm no automation already triggers on `utm_source = blog` or on tag `source-blog`, which would double-send once I3's new automation is created | Same docs domain; uncertain exact path |
| 5 | No API call: open the Beehiiv automation email editor's merge-tag picker (or its template docs) for the merge tag that renders an unsubscribe link | Confirm the exact merge tag name (commonly `{{unsubscribe_url}}` in Beehiiv, but not verified against this publication) so I3's welcome email can use the right token for the "thumbs down" link | Uncertain: this is a UI/editor lookup, not a REST call; if Beehiiv exposes a template-preview or merge-tag-list API endpoint, note its path here once found |

Row 5 is the least certain item in this table and should be resolved first, since I3's welcome email draft cannot be finalized without the correct unsubscribe merge tag name.

---

## 9. Human-action items foreseen for the frozen spec

- Create the Beehiiv automation "Blog welcome (thumbs)" with trigger tag `source-blog` (or a segment on `utm_source = blog`) once pre-flight row 4 confirms no conflicting automation exists (I3).
- Confirm the exact unsubscribe merge tag from pre-flight row 5 before Story finalizes the welcome email's thumbs-down link (I3).
- Sign off on the tagging edge case in section 3: a blog signup with a missing or invalid `utm_campaign` gets only `source-blog`, no `variant-*` tag, and (by T2's rule) still no `source-newsletter`. This is a real, if narrow, gap where a segment built on `variant-thumbs` or `variant-classic` will silently miss these subscribers; Story/Auditor should confirm this is acceptable rather than, say, defaulting such a signup's variant tag to `variant-classic`.
- Sign off on the storage-unavailable fallback in T4: a reader whose browser storage throws always gets shown "classic" and is never randomized into "thumbs," even though thumbs is the brief's stated preferred variant (00-brief.md line 9). This affects a small population (private-mode or storage-disabled browsers) but is a real, permanent skew worth Jamie's explicit sign-off rather than an implementation detail nobody decided on purpose.
- Decide whether `NEXT_PUBLIC_NEWSLETTER_POPUP_ENABLED` stays off; per 01-requirements.md section G it does unless Jamie says otherwise, and this contract does not change that flag's meaning (T5).
- Add a real test runner (vitest, per 01-requirements.md section G) in a later PR; this run's unit tests execute directly under node per section 7 and their output goes into the ledger, not into a `package.json` `test` script.
- Confirm Playwright is actually available on Jamie's machine before Sentry's Playwright-based acceptance criteria (P1 to P8, T7) run there; Scout's map notes Playwright is present but `extraneous` (not declared in `package.json`) in this cloud checkout specifically.
- Confirm the eight `heardAbout` option labels in section 4 against Story's final copy deck (`02-copy-deck.md`, C1/C2) before Atlas builds the `<select>`; 00-brief.md's original D5 wording listed six options while 01-requirements.md's P9 expanded to eight, and this contract used the eight-slug list P9 and this task both specify, but the exact visible label text is Story's to freeze, not Relay's.
