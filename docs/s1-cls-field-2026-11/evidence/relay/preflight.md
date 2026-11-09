# Relay pre-flight (2026-11-09, probes at 16:31 to 16:32 UTC, GET/HEAD only)

## 1. Public probes

| Check | ekuzo.gg (production) | dev--ekuzo.netlify.app (dev) |
|---|---|---|
| `curl -sI /season1` status | 200 | 200 |
| `cache-control` | `s-maxage=31536000` | `s-maxage=31536000` |
| `age` | 337524 s (3.9 days) | 251171 s (2.9 days) |
| `cache-status` | Netlify Durable hit, Next.js hit, Netlify Edge fwd=miss, stored | same shape (Durable hit, ttl 31284830) |
| `x-nextjs-date` | Fri 06 Nov 2026 18:47:05 GMT | Mon 09 Nov 2026 16:06:05 GMT |
| `content-length` header | absent (HTTP/2, no header returned) | absent |
| Body bytes (`curl -s | wc -c`, uncompressed) | 132,578 | 1,345,821 |
| `name="s1-build"` marker | none | none |
| Which page does it serve? | the small page (main's `landing.html` 127,471 B plus tag fill) | the 1.35 MB page (dev's old `landing.html`, 1,340,714 B in Scout's count) |
| Publishable key on `/season1/join/signup` | `pk_live_` prefix, config `"mode":"live"` | `pk_test_` prefix, config `"mode":"test"` |

Reading: dev still serves the 1.35 MB page, so a dev deploy of the integration branch will change dev from 1.35 MB to about 130 KB; the first Sentry B read of dev is the "before" for the heavy page only if taken before the push. The `x-nextjs-date` on dev (09 Nov 16:06 GMT) is newer than its `age` suggests, which is the same age/date disagreement the ops lens noted on production (O-7): never use `age` to judge freshness, use the marker.

## 2. Legacy webhook guard (O-16)

On `lane/relay` (same code as the build tip):

```
app/api/webhooks/stripe/route.ts:6:import { shouldSkipLegacy } from "@/lib/season1/legacyGuard";
app/api/webhooks/stripe/route.ts:57:    // Season 01 PaymentIntents have their own webhook; anything without a
app/api/webhooks/stripe/route.ts:58:    // parent_email (e.g. Teams installment invoices) cannot be fulfilled here.
app/api/webhooks/stripe/route.ts:59:    if (shouldSkipLegacy(paymentIntent)) {
app/api/webhooks/stripe/route.ts:60:      return NextResponse.json({ received: true, skipped: "not_registration" });
```

`lib/season1/legacyGuard.ts` skips `metadata.product === "season1"`, unknown products and any PI without `parent_email`; covered by `lib/season1/__tests__/legacyGuard.test.ts`. The merge rehearsal showed `app/` identical to the build tip, so the guard arrives on dev with the push (the dev test webhook `we_1TMYx4…` points at this legacy route). Money lens M-14 still applies: the route skips signature checks when `STRIPE_WEBHOOK_SECRET` is unset (line 44 to 48); the guard does not touch that.

## 3. Stripe webhook checklist for Jamie (money lens 4.1, 4.4, 4.5; HA4)

Stripe Dashboard, listed in both live mode and test mode. Nothing here can be read from the container.

- [ ] Live mode has `https://ekuzo.gg/api/season1/stripe-webhook` with at least `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, `refund.failed`, `charge.dispute.created`, `charge.dispute.closed`; its signing secret equals Production `S1_STRIPE_WEBHOOK_SECRET`.
- [ ] Live mode also has the legacy camps endpoint `https://ekuzo.gg/api/webhooks/stripe` with `STRIPE_WEBHOOK_SECRET`.
- [ ] Test mode: note every endpoint and where it points. A test payment on dev is fulfilled only if a test endpoint points at `https://dev--ekuzo.netlify.app/api/season1/stripe-webhook` with that context's secret. Test endpoints that point at ekuzo.gg are harmless (mode mismatch returns 200 and skips).
- [ ] Settings, Payment method domains (live): `ekuzo.gg` registered and enabled (`www` 301s to the apex); Apple Pay, Google Pay and Link enabled. For the wallet check (HA6), register `dev--ekuzo.netlify.app` too.
- [ ] Settings, Customer emails: "Successful payments" is on in live.
- [ ] Link funding sources: card only or bank too (M-12).
- [ ] Read-only data pulls (money 4.7): `card_testing_suspect` order count in live (how often M-1 bit), and outbox rows with `attempts >= 5` or status `stale`/`skipped_no_config` (M-2).

## 4. Only Jamie can read

| Item | Why it matters | Where |
|---|---|---|
| Netlify env, branch-deploy / dev context: `META_CAPI_USE_TEST_CODE`, `META_CAPI_TEST_EVENT_CODE`, `KLAVIYO_PRIVATE_API_KEY` present, `META_CAPI_ACCESS_TOKEN` present, `DATABASE_URL` host (Neon test `ep-lively-boat-b4fak1h6`), `STRIPE_SECRET_KEY` starts `sk_test_` | Any dev waitlist sign-up writes to live Klaviyo list `XGTv2F` and could send a live Meta Lead (O-2, M-4). Commit 1e603a7 on the build branch mentions a Netlify env readout ("no CAPI test code in any context"); if that readout is accurate, dev sign-ups are NOT safe. Until confirmed, zero dev sign-ups (D11). | Netlify > Site configuration > Environment variables, scope the dev/branch contexts |
| Production env: `S1_DRAIN_SECRET`, `S1_DISCORD_WEBHOOK_URL`, `KLAVIYO_PRIVATE_API_KEY`, `META_CAPI_ACCESS_TOKEN`, `META_PIXEL_ID`; `s1-drain` scheduled function recent runs status 200 | Receipts and Meta Purchase depend on them (money 4.3) | Netlify |
| Clarity project masking mode (Balanced or Strict) | U-5, HA3: masking of email and typed fields | Clarity > Settings > Masking |

## 5. Guard hook (P4a)

Installed on `lane/relay`: `scripts/guard-pattern-kill.sh` (executable, copied unchanged from the KB) and `.claude/settings.json`. `.claude/settings.local.json` was left alone. `.gitignore` ignores `.claude/*`, so one line `!.claude/settings.json` was added beside the existing `!.claude/commands/` exception, otherwise the file could not be committed.

```
$ grep -n "guard-pattern-kill" .claude/settings.json
6:        "hooks": [{ "type": "command", "command": "bash scripts/guard-pattern-kill.sh" }]
```
(the matcher is `"Bash"` on `PreToolUse`)

Smoke test: `{"tool_input":{"command":"pkill -f next"}}` piped to the script exits 2 with the block message; `kill 123` exits 0.
