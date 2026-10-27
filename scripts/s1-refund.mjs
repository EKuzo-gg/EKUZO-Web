/**
 * Refund a Season 01 order, whole or one kid (ops 4 / O4).
 *   npm run s1:refund -- --order <public id> [--kid <first name>] [--kid-id <uuid>]
 *                        [--amount <cents>] [--reason requested_by_customer] [--jersey-shipped]
 *                        [--apply] [--live]
 * Dry-run by default. With --apply it creates the Stripe refund on the order's
 * PaymentIntent with metadata s1_order (and s1_kid_id for a kid refund) and the
 * idempotency key s1-refund:<order>:<kid or all>. The webhook records the
 * refund (marks the kid refunded, decrements friend_kids, voids on full).
 * Stripe keeps idempotency keys for 24 h: re-running the same command inside a
 * day returns the same refund instead of a second one. Changing --amount for the
 * same order and kid inside that day is rejected by Stripe (same key, new params).
 */
import { foldName } from "../lib/season1/db.ts";
import { getStripe } from "../lib/season1/stripe.ts";
import { errCode } from "../lib/season1/rules.ts";
import {
  fail, hasJerseyShippedColumn, initEnv, jerseyRefundAdviceCents, line, maskEmail, money, parseArgs, q,
} from "./s1-ops-lib.mjs";

const { flags, opts } = parseArgs(process.argv.slice(2), ["jersey-shipped"]);
const REASONS = ["requested_by_customer", "duplicate", "fraudulent"];

const orderRef = opts.order;
if (!orderRef) fail("--order <public id> is required");
const reason = opts.reason ?? "requested_by_customer";
if (!REASONS.includes(reason)) fail(`--reason must be one of ${REASONS.join(", ")}`);
let amountOverride = null;
if (opts.amount !== undefined) {
  if (!/^\d+$/.test(opts.amount) || Number(opts.amount) < 1) fail("--amount must be a whole number of cents, 1 or more");
  amountOverride = Number(opts.amount);
}
if (opts["kid-id"] && !/^[0-9a-f-]{36}$/i.test(opts["kid-id"])) fail("--kid-id must be a uuid");

const env = initEnv(flags, { needStripe: true });

const jerseyCol = await hasJerseyShippedColumn();
const orders = await q(
  `select o.id, o.public_id, o.status, o.amount_cents, o.payment_intent_id, o.livemode, o.payer_email,
          o.paid_at, o.flags${jerseyCol ? ", o.jersey_shipped_at" : ""}
     from s1_orders o where o.public_id = $1`,
  [orderRef],
);
const order = orders[0];
if (!order) fail(`no order with public id ${orderRef}`);
if (order.livemode !== env.livemode) fail(`order ${order.public_id} is livemode=${order.livemode}, this run is ${env.live ? "live" : "test"}`);
if (!["paid", "partially_refunded"].includes(order.status)) fail(`order status is ${order.status}; only paid or partially_refunded orders can be refunded`);
if (!order.payment_intent_id) fail("order has no PaymentIntent");

const items = await q(
  `select k.id, k.first_name, k.first_name_key, k.status, oi.unit_cents, oi.role
     from s1_order_items oi join s1_kids k on k.id = oi.kid_id
    where oi.order_id = $1 order by oi.created_at, k.created_at`,
  [order.id],
);

// What Stripe says is still refundable on the charge.
const stripe = getStripe();
let pi;
try {
  pi = await stripe.paymentIntents.retrieve(order.payment_intent_id, { expand: ["latest_charge"] });
} catch (e) {
  fail(`Stripe could not find this order's PaymentIntent (${errCode(e)}). Is the key from the right account and mode?`);
}
const charge = typeof pi.latest_charge === "object" ? pi.latest_charge : null;
if (!charge) fail("PaymentIntent has no charge to refund");
if (pi.livemode !== env.livemode) fail("PaymentIntent livemode does not match this run");
const remaining = charge.amount - (charge.amount_refunded ?? 0);

let kid = null;
if (opts.kid || opts["kid-id"]) {
  const matches = items.filter((i) =>
    opts["kid-id"] ? i.id === opts["kid-id"].toLowerCase() : i.first_name_key === foldName(opts.kid),
  );
  if (matches.length === 0) fail(`no kid on order ${order.public_id} matches that name`);
  if (matches.length > 1) fail("more than one kid on this order has that first name; pass --kid-id <uuid> (see s1:find)");
  kid = matches[0];
  if (kid.status === "refunded") fail(`${kid.first_name} is already marked refunded on this order`);
}

const base = kid ? kid.unit_cents : remaining;
const amount = amountOverride ?? base;
const key = `s1-refund:${order.public_id}:${kid ? kid.id : "all"}`;

line(`order ${order.public_id} status=${order.status} paid=${money(order.amount_cents)} already refunded=${money(charge.amount_refunded ?? 0)} refundable=${money(remaining)}`);
line(`guardian ${maskEmail(order.payer_email)}`);
line(`scope: ${kid ? `one kid (${kid.first_name}, ${kid.role}, unit ${money(kid.unit_cents)})` : "whole order (everything still refundable)"}`);
line(`refund amount: ${money(amount)}${amountOverride !== null ? " (override)" : ""}   reason=${reason}`);
line(`metadata: s1_order=${order.public_id}${kid ? ` s1_kid_id=${kid.id}` : ""}`);
line(`idempotency key: ${key}`);

if (amount > remaining) fail(`amount ${money(amount)} is more than the ${money(remaining)} still refundable on the charge`);
if (!kid && amountOverride !== null && amount < remaining) {
  line("note: a partial amount without --kid is recorded as refund_unattributed by the webhook (no kid is marked refunded).");
}
if (kid && amountOverride !== null && amount !== kid.unit_cents) {
  line(`note: --amount differs from ${kid.first_name}'s unit price ${money(kid.unit_cents)}.`);
}

// Advice only: the jersey refund rule.
const shipped = flags.has("jersey-shipped") || (jerseyCol && order.jersey_shipped_at);
if (shipped) {
  const unit = kid ? kid.unit_cents : (items[0]?.unit_cents ?? 0);
  line(
    `advice: jersey shipped. Refund rule: ${money(jerseyRefundAdviceCents(unit))} of ${money(unit)} and the jersey is theirs to keep, or the full ${money(unit)} if they send it back. Use --amount ${jerseyRefundAdviceCents(unit)} for the first. (Check sibling prices with Karlin: the rule text names $65 of $100.)`,
  );
} else if (!jerseyCol) {
  line("advice: no jersey_shipped_at column yet; if the free jersey has shipped, pass --jersey-shipped to see the $65 rule amount.");
}

if (!env.apply) {
  line("dry-run: nothing sent to Stripe. Re-run with --apply to create the refund.");
  process.exit(0);
}

try {
  const refund = await stripe.refunds.create(
    {
      payment_intent: order.payment_intent_id,
      amount,
      reason,
      metadata: { s1_order: order.public_id, ...(kid ? { s1_kid_id: kid.id } : {}) },
    },
    { idempotencyKey: key },
  );
  line(`refund created: id=${refund.id} status=${refund.status} amount=${money(refund.amount)}`);
  line("The webhook records it (charge.refunded). Check with s1:find --order " + order.public_id);
} catch (e) {
  fail(`Stripe refused the refund (${errCode(e)})`);
}
process.exit(0);
