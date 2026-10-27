import type Stripe from "stripe";
import { getStripe, keyIsLive } from "@/lib/season1/stripe";
import { fulfil, OrphanPaidPiError } from "@/lib/season1/fulfil";
import {
  addOrderFlags,
  getEventProcessed,
  getOrderForFulfilByPi,
  incrementFailure,
  insertEvent,
  markEventProcessed,
  setOrderKidsStatus,
  setOrderStatus,
  voidOnFullRefund,
} from "@/lib/season1/db";
import { errCode, isFullRefund, logStep } from "@/lib/season1/rules";

/**
 * POST /api/season1/stripe-webhook (frozen spec "Webhook" + RT1, RT4, RT10,
 * RT13, RT18, ops 3 and 4). Mode never gates this route: it always records
 * and fulfils, and skips (200, nothing written) only events from the other
 * Stripe mode. Event rows hold ids and amounts only, never billing details.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const CARD_TESTING_FAILURES = 3;

const HANDLED = new Set([
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "charge.refunded",
  "refund.failed",
  "charge.dispute.created",
  "charge.dispute.closed",
]);

function reply(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function idOf(v: string | { id: string } | null | undefined): string | null {
  if (!v) return null;
  return typeof v === "string" ? v : v.id;
}

/** The Season 01 PaymentIntent behind an event, or null when it is not ours (RT18). */
async function season1Pi(event: Stripe.Event): Promise<{ piId: string; data: Record<string, unknown>; full?: boolean } | null> {
  const stripe = getStripe();
  const obj = event.data.object as unknown as Record<string, unknown>;
  switch (event.type) {
    case "payment_intent.succeeded":
    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent;
      if (pi.metadata?.product !== "season1") return null;
      return {
        piId: pi.id,
        data: {
          status: pi.status,
          amount: pi.amount,
          order_ref: pi.metadata?.order_id ?? null,
          decline_code: pi.last_payment_error?.decline_code ?? pi.last_payment_error?.code ?? null,
        },
      };
    }
    case "charge.refunded": {
      // Ops 4: read the charge fresh; full means amount_refunded === amount.
      const charge = await stripe.charges.retrieve(String(obj.id), { expand: ["payment_intent"] });
      const pi = charge.payment_intent && typeof charge.payment_intent !== "string" ? charge.payment_intent : null;
      if (!pi || pi.metadata?.product !== "season1") return null;
      return {
        piId: pi.id,
        full: isFullRefund(charge),
        data: { charge: charge.id, amount: charge.amount, amount_refunded: charge.amount_refunded, order_ref: pi.metadata?.order_id ?? null },
      };
    }
    case "refund.failed":
    case "charge.dispute.created":
    case "charge.dispute.closed": {
      let piId = idOf(obj.payment_intent as string | { id: string } | null);
      if (!piId && obj.charge) {
        const ch = await stripe.charges.retrieve(String(idOf(obj.charge as string | { id: string })));
        piId = idOf(ch.payment_intent);
      }
      if (!piId) return null;
      const pi = await stripe.paymentIntents.retrieve(piId);
      if (pi.metadata?.product !== "season1") return null;
      return {
        piId,
        data: {
          object: obj.id ?? null,
          status: obj.status ?? null,
          amount: obj.amount ?? null,
          reason: obj.reason ?? null,
          order_ref: pi.metadata?.order_id ?? null,
        },
      };
    }
    default:
      return null;
  }
}

async function handle(event: Stripe.Event, piId: string, full: boolean | undefined): Promise<void> {
  switch (event.type) {
    case "payment_intent.succeeded": {
      const r = await fulfil(piId, "webhook");
      logStep("webhook.fulfil", r.orderPublicId, true, r.status === "paid" ? null : r.status);
      return;
    }
    case "payment_intent.payment_failed": {
      const o = await incrementFailure(piId);
      if (!o) return;
      logStep("webhook.payment_failed", o.publicId, true, `count_${o.failureCount}`);
      if (o.failureCount >= CARD_TESTING_FAILURES && o.status === "pending") {
        try {
          await getStripe().paymentIntents.cancel(piId);
        } catch (e) {
          // Already canceled or succeeded in between: the flag still applies.
          logStep("webhook.cancel_pi", o.publicId, false, errCode(e));
        }
        await addOrderFlags(o.orderId, ["card_testing_suspect"]);
        logStep("webhook.card_testing", o.publicId, true);
      }
      return;
    }
    case "charge.refunded": {
      let o = await getOrderForFulfilByPi(piId);
      if (o && o.status === "pending") {
        // Refund raced ahead of fulfil: fulfil claims it as refunded (RT13).
        try {
          await fulfil(piId, "webhook");
        } catch (e) {
          if (!(e instanceof OrphanPaidPiError)) throw e;
        }
        o = await getOrderForFulfilByPi(piId);
      }
      if (!o) {
        logStep("webhook.refund", null, false, "no_order");
        return;
      }
      if (full) {
        await setOrderStatus(o.id, "refunded", ["paid", "partially_refunded", "refunded"]);
        await setOrderKidsStatus(o.id, "refunded", ["pending", "committed", "canceled"]);
        // Slice 2: the order's referral voids; the family's last paid order voids its code
        // (existing referrals on that code keep their status).
        const v = await voidOnFullRefund(o.id, o.familyId);
        if (v.referralVoided || v.codeVoided) {
          await insertEvent({
            source: "webhook",
            type: "refund.referral_effects",
            subject: o.publicId,
            data: { referral_voided: v.referralVoided, code_voided: v.codeVoided },
            livemode: o.livemode,
          });
        }
        logStep("webhook.refund_referral", o.publicId, true, v.codeVoided ? "code_void" : null);
      } else {
        await setOrderStatus(o.id, "partially_refunded", ["paid"]);
      }
      logStep("webhook.refund", o.publicId, true, full ? "full" : "partial");
      return;
    }
    case "charge.dispute.created":
    case "refund.failed": {
      const o = await getOrderForFulfilByPi(piId);
      if (o) {
        await addOrderFlags(o.id, [event.type === "refund.failed" ? "refund_failed" : "dispute"]);
        logStep(`webhook.${event.type}`, o.publicId, true);
      }
      return;
    }
    default:
      return; // charge.dispute.closed: the event row is the record
  }
}

export async function POST(req: Request): Promise<Response> {
  const secret = process.env.S1_STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    logStep("webhook.config", null, false, "no_secret");
    return reply({ error: "not_configured" }, 500);
  }
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  let event: Stripe.Event;
  try {
    if (!sig) throw new Error("no signature");
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch {
    logStep("webhook.signature", null, false, "bad_signature");
    return reply({ error: "bad_signature" }, 400);
  }

  // RT10: the other Stripe mode is skipped with nothing written.
  if (event.livemode !== keyIsLive()) return reply({ received: true, skipped: "mode_mismatch" });
  if (!HANDLED.has(event.type)) return reply({ received: true, skipped: "unhandled" });

  try {
    const ours = await season1Pi(event);
    if (!ours) return reply({ received: true, skipped: "not_season1" });

    await insertEvent({
      source: "webhook",
      type: event.type,
      subject: ours.piId,
      stripeEventId: event.id,
      data: ours.data,
      livemode: event.livemode,
    });
    if (await getEventProcessed(event.id)) return reply({ received: true, duplicate: true });

    await handle(event, ours.piId, ours.full);
    await markEventProcessed(event.id);
    return reply({ received: true });
  } catch (e) {
    // processed_at stays null, so Stripe's retry runs the handler again (RT1, ops 3).
    logStep("webhook.error", null, false, e instanceof OrphanPaidPiError ? "orphan_paid_pi" : errCode(e));
    return reply({ error: "retry" }, 500);
  }
}
