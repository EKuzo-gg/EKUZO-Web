# LLM Traffic Tagging — Scoping

**Status:** Scoping. Phase 1 implementation pending Jamie's sign-off.
**Owner:** Jamie (decision); Claude Code session to build Phase 1.
**Created:** 2026-05-17.
**Related:** [`ai-optimization-checklist.md`](./ai-optimization-checklist.md), [`/Users/jamiefitch/Projects/ekuzo-web/GEO-SCHEMA-REPORT.md`](../GEO-SCHEMA-REPORT.md), [`/Users/jamiefitch/Projects/ekuzo-camps/marketing/ads/2026-04-meta-camps-v1/brief.md`](../../ekuzo-camps/marketing/ads/2026-04-meta-camps-v1/brief.md).

---

## The problem

ChatGPT, Claude, and Perplexity drive an estimated 2-8% of sessions on most DTC sites in 2026 (aggregate across $1.2B GMV / 5K brands, per Admaxxer's published numbers). For EKUZO — a brand whose entire content strategy is GEO-optimized (schema, citability, monthly `/audit` cadence) — that share is probably higher than average, not lower.

When a user clicks a link inside an LLM, the browser navigates to ekuzo.gg with the Referer header stripped. So:

1. Meta Pixel sees them as direct / untagged traffic.
2. They don't bucket into a "from search" or branded-search-equivalent custom audience.
3. If they bounce without converting and we run Meta retargeting against site visitors, Meta serves them as cold ToF inventory rather than warm consideration inventory.
4. We pay full ToF CPMs to re-acquire a user we already won via AI search.

Downstream: Meta CAC looks worse than reality, and true incrementality from our GEO investment is invisible. We can't manage what we can't see.

---

## Detection signals

LLM-driven traffic has different fingerprints depending on source:

| Source | Detectable signal | Reliability |
|---|---|---|
| ChatGPT (browsing mode) | `utm_source=chatgpt.com` (now default on out-links); occasionally `chat.openai.com` Referer | High |
| Perplexity | `utm_source=perplexity.ai`; occasionally `perplexity.ai` Referer | High |
| Claude.ai in-chat link | Plain navigation, no Referer, no UTM | Probabilistic only |
| Google AI Overviews | Google Referer — indistinguishable from organic Google | Not separable |
| LLM crawlers (training, not user traffic) | UA matches `GPTBot`, `ChatGPT-User`, `ClaudeBot`, `PerplexityBot`, `OAI-SearchBot` | High but irrelevant — not real visitors, exclude from this work |

The cheap, high-signal layer is the UTM. The hard cases (Claude in-chat, Google AI Overviews) need behavioral inference. We can ship the easy 80% and decide later whether the hard 20% justifies the complexity.

---

## Phased implementation

### Phase 1 — Measure (cheap, ~1-2 day Claude Code session)

Stand up the measurement so we know our actual AI-traffic share before deciding what to do about it.

**Mechanism:**
- New `middleware.ts` at repo root running on all marketing routes (exclude `/api/*`, `/_next/*`, static assets).
- On first request of a session (no `ekuzo_origin` cookie yet), read `request.headers.get('referer')` + URL search params.
- Classify into one of: `ai_chatgpt`, `ai_perplexity`, `ai_claude`, `ai_other`, `organic_google`, `organic_other`, `social`, `paid_meta`, `paid_other`, `direct`.
- Set a first-party cookie `ekuzo_origin={value}` (1-year expiry, `SameSite=Lax`, `Secure`).
- Pass the value through the existing register → PaymentIntent metadata → webhook chain (mirroring how fbc/fbp will flow once that handoff ships).
- Write the value to the email-platform subscriber profile as a new custom field `origin`.
- Add an `origin` column to the Google Sheets fulfillment write.

**Output after 2-4 weeks:** dashboard view of subscribers and Purchases broken down by `origin`, which tells us:
- What share of our acquired customers came in via AI vs. paid vs. organic.
- The relative conversion rate of each origin (probably AI > paid given the intent gradient).
- Whether the Numan 2-8% range applies to us or whether GEO-heavy investment has materially shifted it.

Phase 1 changes no marketing behavior. It's instrumentation only.

### Phase 2 — Act (conditional, 2-3 day session, decide after Phase 1 data)

Two routes, mutually exclusive at first:

**Option A — Subtract AI traffic from acquisition.** Fire a CAPI custom event `AIOriginatedSession` on first visit when `origin` starts with `ai_`. Build a Meta custom audience from that event. Exclude this audience from all ToF ad sets. Keep eligible for retargeting.

**Option B — Treat AI traffic as warm.** Same custom event, but bucket into a "Warm from AI" custom audience and target with MoF retargeting ads (different creative, different offer framing).

Recommendation: start with Option A (stop paying to re-acquire). After 2-4 weeks, controlled split testing Option B against the excluded baseline.

### Phase 3 — Model separately (future, only at scale)

If AI traffic shows materially different conversion / LTV characteristics, fork value-based lookalikes by origin. Only worth doing once we have 500+ AI-attributed conversions, which on current volume is 12-18 months out.

---

## Open questions

1. **Baseline.** We don't know our number. GA4 partially captures this (it tags some ChatGPT referrals) but undercounts because Referer is stripped. Phase 1 is what tells us the real share.
2. **Privacy.** Tagging session origin is non-PII; fine under our existing privacy policy. If we move to Phase 2 (CAPI custom event including origin), a one-line addition to the privacy page is prudent.
3. **CAPI event-volume cost.** Custom events add noise to Pixel event volume. Negligible at our current scale but worth checking when we're optimizing on Purchase at ~50 events/week.
4. **Attribution model.** User comes via ChatGPT → bounces → returns via Meta paid → converts. Who gets credit? Existing UTM logic handles this poorly. Worth a separate attribution-model thread before Phase 2.
5. **Beyond Meta.** This pattern repeats on Google Ads, LinkedIn, anywhere else with retargeting. Phase 1 instrumentation captures the data; downstream the same `origin` signal could feed Google / LinkedIn equivalents.

---

## Recommendation

Ship Phase 1 next. It's cheap, costs nothing to run, and gives us the dataset to make every subsequent decision based on real numbers rather than industry averages. Defer Phase 2 routing until we have ≥4 weeks of Phase 1 data.

The highest-leverage step before anything else is standing up the measurement.

---

## Phase 1 handoff scope (when ready to build)

Open a Claude Code session with this scope:

- `middleware.ts` at repo root: read Referer + UTMs, classify, set `ekuzo_origin` cookie.
- Both register API routes (`/api/camps/register`, `/api/ekuzo100/register`): read cookie from request, pass through to PaymentIntent metadata.
- `app/api/webhooks/stripe/route.ts`: read `origin` from PaymentIntent metadata, write to email platform subscriber profile + Google Sheets row.
- Update the email-platform custom-field schema (see `docs/beehiiv-config.md` or current Klaviyo equivalent — confirm which is live).
- Update the Google Sheets schema docs and the Apps Script web app to accept the new column.

Acceptance: take a real test visit via `https://ekuzo.gg/?utm_source=chatgpt.com`, complete a test purchase, verify `origin=ai_chatgpt` lands in both the email platform profile and the Sheets row.

---

## Source

Reddit thread by Numan (Admaxxer), 2026-05-17 — *"After hitting 92% Meta CAPI match rate across $1.2B GMV / 5,000 brands"*. Specifically item 50: *"ChatGPT, Claude, and Perplexity now drive 2-8% of sessions on most DTC sites in 2026. None of it shows up in Meta's pixel because the LLMs strip the Referer header. You're paying Meta to retarget these visitors as cold traffic — re-acquiring users who came in through generative search. Tag them server-side or they never make it into your warm audiences and your CPA looks worse than it is."*
