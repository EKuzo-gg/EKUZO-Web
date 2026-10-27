# Season 01 commit: slice 3 contract (side effects). FROZEN at 23:25 CT.

Requirements: I4, I5, I6, I7 (sender), A1, A2, A3, A4 and the Klaviyo contract in PM scope section 5,
plus red-team items O11 (max ages, test isolation), T12 (no `invited_by_kid`), RT4/ops (alerts).

## Sender (`lib/season1/outbox.ts`)
- `drainOutbox({orderId?, limit=20, budgetMs=4000})`: selects `pending` rows (optionally for one
  order's dedupe keys), oldest first, `FOR UPDATE SKIP LOCKED` is unavailable over HTTP, so claim each
  row with `UPDATE ... SET status='sending', attempts=attempts+1, updated_at=now() WHERE id=$1 AND
  status IN ('pending','failed') AND attempts < 5 RETURNING *`; run the kind's sender in parallel within
  the budget; on success `status='sent'`; on error `status='failed'`, `last_error` (no PII). Rows in
  `sending` older than 5 minutes return to `failed` (stuck recovery).
- Max age (O11): `meta_purchase` 6 days, `klaviyo_*` 48 h, `discord_*` 24 h, measured from row
  `created_at`; older rows become `stale` and are not sent.
- Test isolation: when the row's `livemode` is false, Klaviyo sends only when the profile email
  matches `^team\+s1test[^@]*@ekuzo\.gg$` or `^aaron\+[^@]*@ekuzo\.gg$`; otherwise `status='skipped_test'`.
  Meta always carries `test_event_code` (env `META_CAPI_TEST_EVENT_CODE`, fallback "TEST_S1") when
  livemode is false. Discord uses `S1_DISCORD_WEBHOOK_URL_TEST` when livemode is false and
  `S1_DISCORD_WEBHOOK_URL` when true; unset → `status='skipped_no_config'`.
- `scripts/s1-outbox.mjs` (npm `s1:outbox`): runs drainOutbox once for all rows; `--mark-stale-test`
  marks every existing `livemode=false` pending row older than 10 minutes `stale` (run once before the
  first real send on the test DB).
- Integration: the webhook and the welcome fulfil call `drainOutbox({orderId})` after fulfil, awaited
  with the 4 s budget, never failing the response. (Lead wires this after slice 2 lands.)

## Klaviyo (`lib/season1/senders/klaviyo.ts`)
- Revision `2025-07-15`, `POST https://a.klaviyo.com/api/events`, timeout 3.5 s, `unique_id` = the
  dedupe key's id part (order public id, referral id, refund id). Metric names and properties exactly as
  PM scope section 5, except: no `invited_by_kid` (T12; send `invited: true|false`), `share_url` uses
  `https://ekuzo.gg/crew/<code>` in live and the request origin recorded on the order in test
  (fallback `https://season1-commit--ekuzo.netlify.app`). Profile properties via the event's profile
  attributes: `season1_status`, `season1_committed_at`, `season1_kid_name`, `season1_kids_count`,
  `season1_code`, `season1_share_url`, `season1_invited`, `season1_jersey_eligible`,
  `season1_offer`; Friend Joined updates `season1_friends_joined` and `season1_credit_pending`.
  Phone from the form: `season1_text_phone` plus `season1_text_consent_at`, no SMS consent.
- Payloads are built in pure functions with unit tests (snapshot the property set; assert no kid name
  on the joiner's Friend Joined payload, no friend kid names anywhere).

## Meta (`lib/season1/senders/meta.ts`)
- Reuse `sendCapiEvent`'s shape and `sha256` from `lib/metaCapi.ts`, but call the Graph API directly
  (v26.0) so the test code is forced: event `Purchase`, `event_id` = order public id, `event_time` =
  paid_at, `action_source: "website"`, `event_source_url` = signup URL, `user_data`: hashed lowercased
  email (`em`), `external_id` hashed family public id, client IP and UA from the order's consent
  fields, `fbp`/`fbc` if stored; `custom_data`: value in dollars, currency USD, `content_name:
  "Season 01"`, `num_items` = kids count. Never kid data or phone. Timeout 2 s.

## Discord (`lib/season1/senders/discord.ts`)
- Kinds: `discord_commit`, `discord_flag:*`, `ops_alert:*`. Message: parent first name, kid first
  names and ages, city/region from geo if present, amount, src, inviter kid first name and code if
  referred, flags. Never email, phone, address or card data. Timeout 2 s. Pure formatter with tests.

## GA on welcome (A1, A2)
- Welcome paid state fires GA `purchase` once per order per browser (localStorage key
  `s1_purchase_<order public id>`), params: `transaction_id` (order public id), `value`, `currency`,
  `kids_count`, `has_code`; `page_location` without query. No names.
