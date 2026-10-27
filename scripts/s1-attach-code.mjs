/**
 * Attach a friend code to a paid order by hand (R6 / T10): a parent came from
 * a friend's link but no credit shows.
 *   npm run s1:attach-code -- --order <public id> --code <code> [--apply] [--live]
 * Checks (same rules as an invite at commit): the order is paid; the code is an
 * active family code whose family has a paid order (or an active partner code);
 * it is not the order's own family; and the order's email had no earlier paid
 * order. Then it sets referral_code, records the referral (pending, friend_kids =
 * the order's kid count, abuse flags as at fulfil), queues klaviyo_friend_joined,
 * and logs an s1_events row type referral.attached_by_hand. Safe to re-run.
 */
import { normalize } from "../lib/season1/codes.ts";
import { insertEvent, getReferralByOrder } from "../lib/season1/db.ts";
import { recordReferral } from "../lib/season1/fulfil.ts";
import { fail, initEnv, line, maskEmail, parseArgs, q } from "./s1-ops-lib.mjs";

const { flags, opts } = parseArgs(process.argv.slice(2));
if (!opts.order) fail("--order <public id> is required");
if (!opts.code) fail("--code <code> is required");
const code = normalize(opts.code);
if (!code) fail("that is not a valid code (8 digits with a correct check digit, or a partner name)");

const env = initEnv(flags);

const order = (
  await q(
    `select o.id, o.public_id, o.family_id, o.status, o.payer_email, o.livemode, o.paid_at, o.referral_code,
            o.pm_details->>'fingerprint' as fingerprint, f.billing_zip,
            (select count(*)::int from s1_order_items oi where oi.order_id = o.id) as kid_count
       from s1_orders o join s1_families f on f.id = o.family_id
      where o.public_id = $1`,
    [opts.order],
  )
)[0];
if (!order) fail(`no order with public id ${opts.order}`);
if (order.livemode !== env.livemode) fail(`order ${order.public_id} is livemode=${order.livemode}, this run is ${env.live ? "live" : "test"}`);
if (order.status !== "paid") fail(`order status is ${order.status}; codes attach to paid orders only`);

const existing = await getReferralByOrder(order.id);
if (existing && existing.code === code && order.referral_code === code) {
  line(`order ${order.public_id} already has code ${code} attached (referral ${existing.status}, friend_kids=${existing.friendKids}). Nothing to do.`);
  process.exit(0);
}
if (existing) fail(`order ${order.public_id} already has a referral on code ${existing.code}; not changing it`);
if (order.referral_code && order.referral_code !== code) fail(`order ${order.public_id} already carries code ${order.referral_code}; not changing it`);

const codeRow = (
  await q(
    `select c.code, c.type, c.family_id,
            exists (select 1 from s1_orders po where po.family_id = c.family_id
                      and po.status in ('paid','partially_refunded')) as has_paid
       from s1_codes c where c.code = $1 and c.livemode = $2 and c.status = 'active'`,
    [code, order.livemode],
  )
)[0];
if (!codeRow) fail(`code ${code} is not an active code in this database`);
if (codeRow.type === "vanity") fail(`code ${code} is a legacy vanity code and does not resolve`);
if (codeRow.type === "family" && !codeRow.has_paid) fail(`code ${code} belongs to a family with no paid order`);
if (codeRow.family_id === order.family_id) fail("that code belongs to the order's own family");

const earlier = await q(
  `select 1 from s1_orders o2
    where o2.payer_email = $1 and o2.livemode = $2 and o2.id <> $3
      and o2.status in ('paid','partially_refunded') and o2.paid_at < $4 limit 1`,
  [order.payer_email, order.livemode, order.id, order.paid_at],
);
if (earlier.length > 0) fail("this email had an earlier paid order, so it is not a new family for friend credit");

line(`order ${order.public_id} (${maskEmail(order.payer_email)}) kids=${order.kid_count}`);
line(`code ${code} type=${codeRow.type} -> inviter family ok`);
line(`${env.apply ? "doing" : "would"}: set referral_code, record a pending referral with friend_kids=${order.kid_count}, queue klaviyo_friend_joined, log referral.attached_by_hand`);
if (!env.apply) {
  line("dry-run: nothing written. Re-run with --apply.");
  process.exit(0);
}

await q(`update s1_orders set referral_code = $2 where id = $1 and (referral_code is null or referral_code = $2)`, [order.id, code]);
const outcome = await recordReferral(
  { id: order.id, publicId: order.public_id, familyId: order.family_id, livemode: order.livemode, referralCode: code },
  { fingerprint: order.fingerprint ?? null, zip: order.billing_zip ?? null },
);
if (outcome.result !== "recorded") fail(`referral not recorded (${outcome.result}); referral_code was set, re-check with s1:find`);
await insertEvent({
  source: "ops",
  type: "referral.attached_by_hand",
  subject: order.public_id,
  data: { code, referral_id: outcome.referralId, flags: outcome.flags },
  livemode: order.livemode,
});
line(`attached. referral=${outcome.referralId} flags=${outcome.flags.length ? outcome.flags.join(",") : "none"}`);
line("The inviter's email goes out on the next outbox run (npm run s1:outbox).");
process.exit(0);
