import type Stripe from "stripe";
import { mintNumeric } from "./codes";
import {
  addOrderFlags,
  addReferralReasons,
  backfillPaymentIntent,
  claimOrder,
  enqueueOutbox,
  getCodeRow,
  getOrderForFulfilByPi,
  getOrderForFulfilByPublicId,
  getReferralByOrder,
  hasDuplicateKid,
  insertEvent,
  insertReferral,
  issueViewToken,
  markFulfilled,
  mintFamilyCode,
  orderKidCount,
  reactivateFamilyCode,
  referralFlagContext,
  setFamilyBillingZip,
  setOrderFulfilFields,
  setOrderKidsStatus,
  type FulfilOrder,
} from "./db";
import { computeFlags } from "./referralFlags";
import { errCode, jerseyEligible, lateConfirm, logStep, safeEqual } from "./rules";
import { getStripe, keyIsLive } from "./stripe";

/**
 * Season 01 fulfil (frozen spec "Fulfil" + RT2, RT8, RT13, RT15, RT16, RT19,
 * ops 3 and 5). Safe to call any number of times from the webhook and from
 * every welcome reload: a fulfilled order returns from the DB without a
 * Stripe call; otherwise one PaymentIntent retrieve, one conditional claim,
 * then idempotent steps and fulfilled_at. Nothing is sent inline.
 */

export type FulfilStatus =
  | "paid"
  | "partially_refunded"
  | "refunded"
  | "pending"
  | "failed"
  | "canceled"
  | "mismatch"
  | "not_season1"
  | "mode_mismatch";

export interface FulfilResult {
  orderPublicId: string | null;
  orderId: string | null;
  /** True only for the one call that moved the order out of pending. */
  claimed: boolean;
  status: FulfilStatus;
}

/** A succeeded Season 01 PI with no order row (ops 3). The webhook must 500. */
export class OrphanPaidPiError extends Error {
  readonly paymentIntentId: string;
  constructor(paymentIntentId: string) {
    super("orphan_paid_pi");
    this.name = "OrphanPaidPiError";
    this.paymentIntentId = paymentIntentId;
  }
}

const DONE_STATUSES = new Set(["paid", "partially_refunded", "refunded"]);

function result(o: FulfilOrder | null, status: FulfilStatus, claimed = false): FulfilResult {
  return { orderPublicId: o?.publicId ?? null, orderId: o?.id ?? null, claimed, status };
}

function idOf(v: string | { id: string } | null | undefined): string | null {
  if (!v) return null;
  return typeof v === "string" ? v : v.id;
}

async function retrievePi(piId: string): Promise<Stripe.PaymentIntent> {
  return getStripe().paymentIntents.retrieve(piId, { expand: ["latest_charge", "payment_method"] });
}

/** Find the order for a PI; fall back to metadata.order_id and backfill (ops 3). */
async function findOrder(pi: Stripe.PaymentIntent): Promise<FulfilOrder | null> {
  const byPi = await getOrderForFulfilByPi(pi.id);
  if (byPi) return byPi;
  const ref = pi.metadata?.order_id;
  if (!ref) return null;
  const byRef = await getOrderForFulfilByPublicId(ref);
  if (!byRef || byRef.paymentIntentId) return null; // different PI already attached: not ours
  const filled = await backfillPaymentIntent(byRef.id, pi.id, new Date(pi.created * 1000));
  logStep("fulfil.backfill_pi", ref, !!filled, filled ? null : "backfill_lost");
  return filled;
}

function pmDetails(pm: Stripe.PaymentMethod | null): Record<string, string | null> | null {
  if (!pm) return null;
  return {
    type: pm.type ?? null,
    wallet: pm.card?.wallet?.type ?? null,
    fingerprint: pm.card?.fingerprint ?? null,
    brand: pm.card?.brand ?? null,
  };
}

function piRefunded(pi: Stripe.PaymentIntent): boolean {
  const ch = pi.latest_charge;
  if (!ch || typeof ch === "string") return false;
  return (ch.amount_refunded ?? 0) > 0 || ch.refunded === true;
}

export interface ReferralOutcome {
  referralId: string | null;
  /** "recorded" (row exists for this order), or why none was written. */
  result: "recorded" | "no_code" | "code_inactive" | "own_family" | "no_kids";
  flags: string[];
}

/**
 * Slice 2 referral step for a paid order with referral_code. Idempotent and
 * safe to rerun: the referral is ON CONFLICT DO NOTHING on referred_order_id,
 * flag inputs are measured as of the referral's created_at, reasons are
 * deduplicated, events are unique per (type, subject) and outbox rows per
 * dedupe key. A code voided after commit stops crediting new joins (02b).
 */
export async function recordReferral(
  order: Pick<FulfilOrder, "id" | "publicId" | "familyId" | "livemode" | "referralCode">,
  joiner: { fingerprint: string | null; zip: string | null },
): Promise<ReferralOutcome> {
  if (!order.referralCode) return { referralId: null, result: "no_code", flags: [] };
  let row = await getReferralByOrder(order.id);
  if (!row) {
    const code = await getCodeRow(order.referralCode, order.livemode);
    const skip = (result: ReferralOutcome["result"]) => ({ referralId: null, result, flags: [] as string[] });
    let why: ReferralOutcome["result"] | null = null;
    if (!code || code.status !== "active") why = "code_inactive";
    else if (code.familyId === order.familyId) why = "own_family";
    const kids = why ? 0 : await orderKidCount(order.id);
    if (!why && kids < 1) why = "no_kids";
    if (why || !code) {
      await insertEvent({
        source: "fulfil",
        type: "referral.skipped",
        subject: order.publicId,
        data: { reason: why },
        livemode: order.livemode,
      });
      return skip(why ?? "code_inactive");
    }
    ({ row } = await insertReferral({
      code: order.referralCode,
      inviterFamilyId: code.familyId,
      referredOrderId: order.id,
      friendKids: kids,
      livemode: order.livemode,
    }));
  }

  const ctx = await referralFlagContext(row);
  const flags = computeFlags({
    joinerFingerprint: joiner.fingerprint,
    inviterFingerprints: ctx.inviterFingerprints,
    joinerZip: joiner.zip,
    inviterZip: ctx.inviterZip,
    codeJoinsLast24h: ctx.codeJoinsLast24h,
    inviterLiveFriendKidsAfter: ctx.inviterLiveFriendKidsAfter,
    joinerFriendKids: row.friendKids,
  });
  await addReferralReasons(row.id, flags);
  await insertEvent({
    source: "fulfil",
    type: "referral.created",
    subject: row.id,
    data: { order_ref: order.publicId, friend_kids: row.friendKids, flags },
    livemode: order.livemode,
  });
  const base = {
    referral_id: row.id,
    inviter_family_id: row.inviterFamilyId,
    order_public_id: order.publicId,
    friend_kids: row.friendKids,
    invited: true,
    livemode: order.livemode,
  };
  await enqueueOutbox("klaviyo_friend_joined", `klaviyo_friend_joined:${row.id}`, base, order.livemode);
  for (const flag of flags) {
    await insertEvent({
      source: "fulfil",
      type: "referral.flag",
      subject: `${row.id}:${flag}`,
      data: { flag, order_ref: order.publicId },
      livemode: order.livemode,
    });
    await enqueueOutbox("discord_flag", `discord_flag:${row.id}:${flag}`, { ...base, flag }, order.livemode);
  }
  return { referralId: row.id, result: "recorded", flags };
}

/** The idempotent post-claim steps for a paid order, then fulfilled_at (D4). */
async function runPaidSteps(order: FulfilOrder, pi: Stripe.PaymentIntent, source: string): Promise<void> {
  const ref = order.publicId;
  const step = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    try {
      const v = await fn();
      logStep(`fulfil.${name}`, ref, true);
      return v;
    } catch (e) {
      logStep(`fulfil.${name}`, ref, false, errCode(e));
      throw e;
    }
  };

  const pm = pi.payment_method && typeof pi.payment_method !== "string" ? pi.payment_method : null;
  const paidAt = order.paidAt ?? new Date();
  const piCreatedAt = order.piCreatedAt ?? new Date(pi.created * 1000);

  await step("code", async () => {
    await reactivateFamilyCode(order.familyId);
    return mintFamilyCode(order.familyId, order.livemode, () => mintNumeric());
  });
  await step("kids", () => setOrderKidsStatus(order.id, "committed", ["pending", "canceled"]));
  await step("zip", () => setFamilyBillingZip(order.familyId, pm?.billing_details?.address?.postal_code ?? null));
  await step("fields", () =>
    setOrderFulfilFields(order.id, { jerseyEligible: jerseyEligible(piCreatedAt, paidAt), pmDetails: pmDetails(pm) }),
  );
  await step("flags", async () => {
    const flags: string[] = [];
    if (lateConfirm(paidAt)) flags.push("late_confirm");
    if (await hasDuplicateKid(order.id)) flags.push("duplicate_kid");
    await addOrderFlags(order.id, flags);
  });
  await step("referral", () =>
    recordReferral(order, {
      fingerprint: pm?.card?.fingerprint ?? null,
      zip: pm?.billing_details?.address?.postal_code ?? null,
    }),
  );
  await step("event", () =>
    insertEvent({
      source: "fulfil",
      type: "order.paid",
      subject: ref,
      data: { payment_intent: pi.id, amount_cents: pi.amount, via: source },
      livemode: order.livemode,
    }),
  );
  await step("outbox", async () => {
    const payload = { order_public_id: ref, order_id: order.id, payment_intent: pi.id, livemode: order.livemode };
    for (const kind of ["klaviyo_committed", "meta_purchase", "discord_commit"]) {
      await enqueueOutbox(kind, `${kind}:${ref}`, payload, order.livemode);
    }
  });
  await step("done", () => markFulfilled(order.id));
}

/** Steps for an order claimed as refunded (RT13): no code, no outbox. */
async function runRefundedSteps(order: FulfilOrder, pi: Stripe.PaymentIntent, source: string): Promise<void> {
  await setOrderKidsStatus(order.id, "refunded", ["pending", "canceled", "committed"]);
  await insertEvent({
    source: "fulfil",
    type: "order.refunded_before_fulfil",
    subject: order.publicId,
    data: { payment_intent: pi.id, via: source },
    livemode: order.livemode,
  });
  await markFulfilled(order.id);
  logStep("fulfil.refunded_steps", order.publicId, true);
}

async function fulfilWithPi(pi: Stripe.PaymentIntent, source: "webhook" | "welcome"): Promise<FulfilResult> {
  if (pi.metadata?.product !== "season1") return result(null, "not_season1");
  // RT10: a PI from the other Stripe mode is never written.
  if (pi.livemode !== keyIsLive()) return result(null, "mode_mismatch");

  if (pi.status !== "succeeded") {
    const o = await getOrderForFulfilByPi(pi.id);
    if (pi.status === "canceled") return result(o, "canceled");
    return result(o, "pending"); // processing, requires_* (RT9)
  }

  const order = await findOrder(pi);
  if (!order) {
    // Ops 3: money moved and no order row matches. Record, alert, and fail so
    // the webhook returns 500 and Stripe retries.
    await insertEvent({
      source: "fulfil",
      type: "orphan_paid_pi",
      subject: pi.id,
      data: { order_ref: pi.metadata?.order_id ?? null, amount_cents: pi.amount, via: source },
      livemode: pi.livemode,
    });
    await enqueueOutbox("ops_alert", `ops_alert:${pi.id}`, { kind: "orphan_paid_pi", payment_intent: pi.id, livemode: pi.livemode }, pi.livemode);
    logStep("fulfil.orphan", pi.metadata?.order_id ?? null, false, "orphan_paid_pi");
    throw new OrphanPaidPiError(pi.id);
  }

  // RT16: everything must agree, or nothing is claimed.
  const mismatch =
    pi.amount !== order.amountCents ||
    pi.currency !== "usd" ||
    pi.metadata?.order_id !== order.publicId ||
    pi.livemode !== order.livemode;
  if (mismatch) {
    await insertEvent({
      source: "fulfil",
      type: "pi_mismatch",
      subject: order.publicId,
      data: { payment_intent: pi.id, pi_amount: pi.amount, order_amount: order.amountCents, currency: pi.currency },
      livemode: order.livemode,
    });
    await addOrderFlags(order.id, ["pi_mismatch"]);
    logStep("fulfil.check", order.publicId, false, "pi_mismatch");
    return result(order, "mismatch");
  }

  let claimed = false;
  if (order.status === "pending" || order.status === "canceled") {
    const target = piRefunded(pi) ? "refunded" : "paid";
    claimed = await claimOrder(order.id, pi.id, idOf(pi.payment_method), target);
    logStep("fulfil.claim", order.publicId, true, claimed ? null : "not_claimed");
  }

  const now = (await getOrderForFulfilByPi(pi.id)) ?? order;
  if (!now.fulfilledAt) {
    if (now.status === "paid" || now.status === "partially_refunded") await runPaidSteps(now, pi, source);
    else if (now.status === "refunded") await runRefundedSteps(now, pi, source);
  }
  const status = DONE_STATUSES.has(now.status) ? (now.status as FulfilStatus) : "pending";
  return result(now, status, claimed);
}

/**
 * fulfil(paymentIntentId, source). Cheap when already done: a fulfilled order
 * returns from one DB read.
 */
export async function fulfil(paymentIntentId: string, source: "webhook" | "welcome"): Promise<FulfilResult> {
  const known = await getOrderForFulfilByPi(paymentIntentId);
  if (known && known.fulfilledAt && DONE_STATUSES.has(known.status)) {
    return result(known, known.status as FulfilStatus);
  }
  return fulfilWithPi(await retrievePi(paymentIntentId), source);
}

export interface ReturnResult {
  orderId: string | null;
  orderPublicId: string | null;
  viewToken: string | null;
  status: FulfilStatus | "unverified";
}

/**
 * Welcome return (RT12): the client secret from Stripe's redirect proves
 * ownership. Verifies it (constant time) and season1 metadata, fulfils, and
 * issues a fresh view token for the order (this replaces any earlier token).
 */
export async function fulfilFromReturn(paymentIntentId: string, clientSecret: string): Promise<ReturnResult> {
  const none: ReturnResult = { orderId: null, orderPublicId: null, viewToken: null, status: "unverified" };
  if (!/^pi_[A-Za-z0-9]+$/.test(paymentIntentId) || typeof clientSecret !== "string" || !clientSecret) return none;
  const pi = await retrievePi(paymentIntentId);
  if (!pi.client_secret || !safeEqual(pi.client_secret, clientSecret)) return none;
  if (pi.metadata?.product !== "season1") return { ...none, status: "not_season1" };

  let r: FulfilResult;
  try {
    r = await fulfilWithPi(pi, "welcome");
  } catch (e) {
    if (!(e instanceof OrphanPaidPiError)) throw e;
    return { ...none, status: "pending" };
  }
  const order = r.orderId ? r : result(await getOrderForFulfilByPi(pi.id), r.status);
  if (!order.orderId) return { ...none, status: r.status };
  // The secret proves ownership even when the order is pending or flagged.
  const viewToken = await issueViewToken(order.orderId);
  return { orderId: order.orderId, orderPublicId: order.orderPublicId, viewToken, status: r.status };
}
