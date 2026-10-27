/**
 * Stale pending order sweep (O15).
 *   npm run s1:sweep [-- --apply] [--live]
 * 1. Pending orders older than 1 hour with no PaymentIntent: status canceled.
 * 2. Pending orders older than 24 hours with a PaymentIntent that is still
 *    requires_payment_method: cancel the PI, then the order (a PI already
 *    canceled in Stripe only needs the order canceled). A PI in any other
 *    state (succeeded, processing, requires_action, requires_confirmation) is
 *    left alone and reported; a PI Stripe cannot find is reported, not canceled
 *    (a wrong-account key would otherwise look like missing PIs).
 * 3. Retention (security review L8): for families that never paid (no order
 *    pending, paid, partially_refunded or refunded; every order canceled or
 *    failed) whose newest order is over 7 days old, blank the kids' first names
 *    (the column is NOT NULL, so '') and null the guardian phone and the
 *    orders' payer_phone. Ages, emails and the order rows stay for the audit
 *    trail. Runs after 1 and 2 in the same run.
 * Dry-run by default. Only orders of the run's livemode are touched.
 */
import { cancelOrder, getSql, insertEvent } from "../lib/season1/db.ts";
import { getStripe } from "../lib/season1/stripe.ts";
import { errCode } from "../lib/season1/rules.ts";
import { initEnv, line, parseArgs, q } from "./s1-ops-lib.mjs";

const { flags } = parseArgs(process.argv.slice(2));
const env = initEnv(flags);

const counts = { noPiFound: 0, noPiCanceled: 0, piFound: 0, piCanceled: 0, piSkippedState: 0, piSkippedMissing: 0 };
const RETAIN_DAYS = 7;

// 1. No PI after an hour.
const noPi = await q(
  `select id, public_id from s1_orders
    where status = 'pending' and payment_intent_id is null and livemode = $1
      and created_at < now() - interval '1 hour'
    order by created_at`,
  [env.livemode],
);
counts.noPiFound = noPi.length;
for (const o of noPi) {
  if (!env.apply) {
    line(`would cancel (no PI, over 1 h) order=${o.public_id}`);
    continue;
  }
  if (await cancelOrder(o.id)) {
    counts.noPiCanceled++;
    await insertEvent({ source: "ops", type: "sweep.canceled", subject: o.public_id, data: { why: "no_pi_1h" }, livemode: env.livemode });
    line(`canceled (no PI) order=${o.public_id}`);
  }
}

// 2. PI never paid after a day.
const withPi = await q(
  `select id, public_id, payment_intent_id from s1_orders
    where status = 'pending' and payment_intent_id is not null and livemode = $1
      and coalesce(pi_created_at, created_at) < now() - interval '24 hours'
    order by created_at`,
  [env.livemode],
);
counts.piFound = withPi.length;
if (withPi.length > 0) {
  if (!process.env.STRIPE_SECRET_KEY) {
    line("STRIPE_SECRET_KEY is not set: skipping the PaymentIntent part");
  } else {
    const stripe = getStripe();
    for (const o of withPi) {
      let pi;
      try {
        pi = await stripe.paymentIntents.retrieve(o.payment_intent_id);
      } catch (e) {
        counts.piSkippedMissing++;
        line(`skip order=${o.public_id}: Stripe lookup failed (${errCode(e)})`);
        continue;
      }
      if (pi.livemode !== env.livemode) {
        counts.piSkippedMissing++;
        line(`skip order=${o.public_id}: PaymentIntent livemode differs`);
        continue;
      }
      if (pi.status !== "requires_payment_method" && pi.status !== "canceled") {
        counts.piSkippedState++;
        line(`skip order=${o.public_id}: PaymentIntent is ${pi.status}`);
        continue;
      }
      if (!env.apply) {
        line(`would cancel PI + order (over 24 h, PI unpaid) order=${o.public_id}`);
        continue;
      }
      try {
        // Already canceled in Stripe (a retry or an earlier sweep): only the order is left.
        if (pi.status !== "canceled") await stripe.paymentIntents.cancel(pi.id, { cancellation_reason: "abandoned" });
      } catch (e) {
        counts.piSkippedState++;
        line(`skip order=${o.public_id}: could not cancel PI (${errCode(e)})`);
        continue;
      }
      if (await cancelOrder(o.id)) {
        counts.piCanceled++;
        await insertEvent({ source: "ops", type: "sweep.canceled", subject: o.public_id, data: { why: "pi_unpaid_24h" }, livemode: env.livemode });
        line(`canceled (PI unpaid) order=${o.public_id}`);
      }
    }
  }
}

// 3. Retention for never-paid families (L8). Eligible families, as a reusable clause.
const NEVER_PAID = `
  select f.id from s1_families f
   where f.livemode = $1
     and exists (select 1 from s1_orders o where o.family_id = f.id)
     and not exists (select 1 from s1_orders o where o.family_id = f.id
                      and o.status in ('pending','paid','partially_refunded','refunded'))
     and not exists (select 1 from s1_orders o where o.family_id = f.id
                      and o.created_at >= now() - make_interval(days => ${RETAIN_DAYS}))`;
const ret = (
  await q(
    `select
       (select count(*)::int from (${NEVER_PAID}) x) as families,
       (select count(*)::int from s1_kids k where k.family_id in (${NEVER_PAID}) and k.first_name <> '') as kids,
       (select count(*)::int from s1_guardians g where g.family_id in (${NEVER_PAID}) and g.phone is not null) as guardian_phones,
       (select count(*)::int from s1_orders o where o.family_id in (${NEVER_PAID}) and o.payer_phone is not null) as order_phones`,
    [env.livemode],
  )
)[0];
const retained = { kids: 0, guardianPhones: 0, orderPhones: 0 };
if (env.apply && ret.families > 0) {
  const [k, g, o] = await getSql().transaction([
    getSql().query(`update s1_kids set first_name = '', first_name_key = '' where family_id in (${NEVER_PAID}) and first_name <> '' returning id`, [env.livemode]),
    getSql().query(`update s1_guardians set phone = null where family_id in (${NEVER_PAID}) and phone is not null returning id`, [env.livemode]),
    getSql().query(`update s1_orders set payer_phone = null where family_id in (${NEVER_PAID}) and payer_phone is not null returning id`, [env.livemode]),
  ]);
  retained.kids = k.length;
  retained.guardianPhones = g.length;
  retained.orderPhones = o.length;
  await insertEvent({ source: "ops", type: "sweep.retention", subject: null, data: { families: ret.families, ...retained }, livemode: env.livemode });
}
line(
  `retention (never paid, over ${RETAIN_DAYS} d): families=${ret.families} kid_names=${ret.kids} guardian_phones=${ret.guardian_phones} order_phones=${ret.order_phones}` +
    (env.apply ? ` | blanked kid_names=${retained.kids} guardian_phones=${retained.guardianPhones} order_phones=${retained.orderPhones}` : ""),
);

line(
  `counts: no_pi found=${counts.noPiFound} canceled=${counts.noPiCanceled} | pi_unpaid found=${counts.piFound} canceled=${counts.piCanceled} skipped_state=${counts.piSkippedState} skipped_lookup=${counts.piSkippedMissing}`,
);
if (!env.apply) line("dry-run: nothing changed. Re-run with --apply.");
process.exit(0);
