# Claude Code handoff — LLM traffic tagging Phase 1 (measure)

**Where to run:** Claude Code inside `~/Projects/ekuzo-web`. Work on the `dev` branch per repo convention.

**Why now:** Scoping captured in [`llm-traffic-tagging-scoping.md`](./llm-traffic-tagging-scoping.md). Phase 1 is instrumentation only — no marketing behavior changes. Goal is to stand up the dataset that tells us what share of acquired customers came in via ChatGPT/Perplexity/Claude vs. paid vs. organic vs. direct, so Phase 2 (Meta audience routing) can be decided on real numbers rather than industry averages.

**Paste the block below.** Everything above the fence is context for Jamie; everything inside is the prompt for Claude Code.

---

```
Add first-touch acquisition-origin tagging across the site. Capture origin at first visit via Next.js middleware, persist in a first-party cookie, thread through the existing register → PaymentIntent → webhook chain so it lands on the Klaviyo profile and the Google Sheets row.

CONTEXT.
ChatGPT/Perplexity/Claude in-chat clicks strip the Referer header, so AI-driven traffic shows up as "direct" in our analytics. We're investing in GEO (schema, citability, monthly /audit) but have no visibility into the conversion side. Phase 1 is measurement only — no Meta audience changes, no CAPI custom events. Just stand up the data pipeline.

Scoping doc lives at docs/llm-traffic-tagging-scoping.md. Read it before starting.

SCOPE.

1. middleware.ts at repo root (new file)
   - Match config: run on all routes EXCEPT /api/*, /_next/*, /favicon.ico, and static assets (use the standard Next.js matcher pattern with `missing`/`source` exclusions, e.g. matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'])
   - On request: if cookie `ekuzo_origin` already exists, call NextResponse.next() and return (first-touch preserved).
   - If no cookie: classify origin from URL search params + Referer header, set cookie on NextResponse.next() via response.cookies.set().
   - Cookie spec: name `ekuzo_origin`, 1-year maxAge (60*60*24*365), sameSite 'lax', secure true in production, path '/'.

2. Classification logic (helper in lib/originClassifier.ts or inline in middleware — your call)

   Order of precedence (first match wins):

   a) Bot exclusion. If user-agent matches /gptbot|chatgpt-user|claudebot|perplexitybot|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|linkedinbot|oai-searchbot/i → return without setting cookie. Don't pollute the dataset with crawler traffic.

   b) UTM params (highest signal):
      - utm_source=chatgpt.com OR chat.openai.com → 'ai_chatgpt'
      - utm_source=perplexity.ai → 'ai_perplexity'
      - utm_source=claude.ai OR claude.com → 'ai_claude'
      - utm_source matches /^(meta|facebook|fb|ig|instagram)$/i OR utm_medium=cpc with utm_source in that set → 'paid_meta'
      - utm_medium matches /^(cpc|paid|ppc)$/i (any other) → 'paid_other'

   c) Referer hostname (when no UTM match):
      - referer host includes 'chatgpt.com' or 'chat.openai.com' → 'ai_chatgpt'
      - referer host includes 'perplexity.ai' → 'ai_perplexity'
      - referer host includes 'claude.ai' or 'claude.com' → 'ai_claude'
      - referer host matches /(gemini|bard)\.google\.com/ → 'ai_other'
      - referer host includes 'google.com' or 'google.co.*' → 'organic_google'
      - referer host includes 'bing.com', 'duckduckgo.com', 'yahoo.com', 'ecosia.org' → 'organic_other'
      - referer host includes 'facebook.com', 'instagram.com', 't.co', 'twitter.com', 'x.com', 'linkedin.com', 'youtube.com', 'tiktok.com', 'reddit.com', 'pinterest.com' → 'social'

   d) Fallback: 'direct'

   Total categories: ai_chatgpt, ai_perplexity, ai_claude, ai_other, organic_google, organic_other, social, paid_meta, paid_other, direct.

3. app/api/camps/register/route.ts and app/api/ekuzo100/register/route.ts
   - Read cookie 'ekuzo_origin' from the request (cookies() from next/headers, or req.cookies.get).
   - If present, add to PaymentIntent metadata as `origin`.
   - If absent (shouldn't happen post-middleware, but defensive), default to 'unknown'.

4. app/api/webhooks/stripe/route.ts
   - In the payment_intent.succeeded handler, read `origin` from paymentIntent.metadata.
   - Pass to the Klaviyo profile update (existing call): add to profile properties as `acquisition_origin`. Use the existing pattern in that handler — don't restructure.
   - Pass to the Google Sheets webhook (existing call): add `origin` field to the JSON body posted to GOOGLE_SHEETS_WEBHOOK_URL. The Apps Script update on the Sheets side is manual (Jamie handles); just send the field.

5. Update docs/beehiiv-config.md (or whichever current email-platform config doc reflects live state — check docs/ for klaviyo-* files) noting the new profile property `acquisition_origin` and the allowed value set.

ACCEPTANCE CRITERIA.

- middleware.ts runs on marketing routes only (verify with the matcher pattern — no double-fires on _next, no firing on /api/*).
- First visit with no Referer, no UTM → cookie set to 'direct'.
- First visit with ?utm_source=chatgpt.com → cookie set to 'ai_chatgpt'.
- First visit with Referer https://perplexity.ai/foo → cookie set to 'ai_perplexity'.
- Subsequent visits with cookie already set → no overwrite (first-touch preserved).
- Bot user-agents → no cookie set.
- Both register API routes read the cookie and add `origin` to PaymentIntent metadata.
- Webhook reads metadata and writes to Klaviyo profile property `acquisition_origin` + sends `origin` in Google Sheets webhook body.
- Graceful degrade: missing metadata key doesn't throw; defaults to 'unknown' on the email platform side too.
- tsc --noEmit clean.
- WORKLOG.md entry at the top.

DO NOT.

- Don't fire any CAPI custom event yet — Phase 1 is measurement only, no Meta side effects.
- Don't overwrite the cookie on repeat visits. First-touch is the whole point.
- Don't change the existing register or webhook logic beyond adding the `origin` plumbing.
- Don't break the existing fbc/fbp/IP/UA/ZIP CAPI enrichment shipped this morning.

FILES TO READ FIRST.

- CLAUDE.md
- docs/llm-traffic-tagging-scoping.md (the rationale)
- app/api/webhooks/stripe/route.ts (current Klaviyo + Sheets write pattern)
- app/api/camps/register/route.ts and app/api/ekuzo100/register/route.ts (PaymentIntent metadata pattern, fresh after the fbc/fbp pass)
- docs/beehiiv-config.md and any docs/klaviyo-*.md files (to find the right config doc to update)
- Any existing middleware.ts (likely none) or next.config.mjs middleware patterns

DELIVERABLE.

- Commit to dev branch. Push. Send commit SHA.
- Confirm tsc --noEmit is clean.
- After deploy, I'll test the four representative origins (direct, ai_chatgpt via UTM, perplexity via Referer simulation, paid_meta via UTM) and verify the cookie + downstream Klaviyo property + Sheets column all populate.
```

---

## After Claude Code finishes — manual steps Jamie owns

1. **Google Sheets schema update.** Add an `origin` column to the relevant tab(s) (ekuzo-purchases, squads, squad_members per the live schema in CLAUDE.md). Open the bound Apps Script (Extensions → Apps Script in the Sheet UI), update the `doPost` handler to read `origin` from the request body and write it to the new column. Test by curl-ing the webhook URL with a fake payload that includes `origin: 'test'`.

2. **Klaviyo property registration.** First webhook fire after deploy will create the `acquisition_origin` property on a profile and it'll show up in the Klaviyo UI automatically (Klaviyo auto-creates custom properties). No upfront setup needed, but worth confirming after the first real or test conversion that the property appears under the profile and is filterable in segment builder.

3. **Verification flow.**
   - `git pull origin dev` locally.
   - Test 1 — direct: incognito visit to `http://localhost:3001/programs/ekuzo-camps`. Check `document.cookie` in DevTools — should contain `ekuzo_origin=direct`.
   - Test 2 — AI UTM: fresh incognito to `http://localhost:3001/programs/ekuzo-camps?utm_source=chatgpt.com`. Cookie should be `ekuzo_origin=ai_chatgpt`.
   - Test 3 — first-touch preserved: with the cookie from test 2 still set, visit `http://localhost:3001/?utm_source=meta`. Cookie should still be `ai_chatgpt` (not overwritten).
   - Test 4 — full pipeline: from a fresh-cookie session with `utm_source=perplexity.ai`, complete a test purchase via Stripe CLI (`4242 4242 4242 4242`). Check Klaviyo profile has `acquisition_origin: ai_perplexity` and the Sheets row has `origin: ai_perplexity`.

4. **Merge dev → main** once verification passes.

## Read-day plan (4 weeks post-deploy)

Open a Cowork session with: "Pull the last 4 weeks of `origin` values from Sheets + Klaviyo. Break down by share of total acquisitions and conversion rate per origin. Compare against Numan's 2-8% DTC average. Recommend Phase 2 routing (Option A exclude / Option B warm-bucket) based on the data."

That session decides whether and how to proceed to Phase 2.

## Source

Scoping doc: [`llm-traffic-tagging-scoping.md`](./llm-traffic-tagging-scoping.md). Original signal: Reddit thread by Numan (Admaxxer), 2026-05-17, item 50.
