import type Stripe from "stripe";
import { OFFER, isOpen, isJerseyEligible } from "@/lib/season1/offer";
import { currentMode } from "@/lib/season1/mode";
import { quote } from "@/lib/season1/pricing";
import { validateCommit } from "@/lib/season1/validate";
import { hit } from "@/lib/season1/ratelimit";
import { getStripe, assertKeyMatchesMode } from "@/lib/season1/stripe";
import { ipBucket } from "@/lib/season1/referralFlags";
import { parseGeoHeader } from "@/lib/seasonOneGeo";
import {
  cancelOrder,
  findPendingOrderByAttempt,
  getFamilyCustomerId,
  insertKids,
  insertPendingOrder,
  issueViewToken,
  priorPaidKidCount,
  setFamilyCustomerId,
  setOrderPaymentIntent,
  upsertFamilyGuardian,
  type AttemptOrder,
} from "@/lib/season1/db";
import { cleanAttemptId, errCode, kidsSignature, keyHash, logStep, viewTokenCookie } from "@/lib/season1/rules";

/**
 * POST /api/season1/commit (frozen spec "Commit API" + RT3 to RT7, RT9, RT10,
 * RT20, ops 7 and 8). Creates or reuses one pending order and its
 * PaymentIntent. Never logs PII: step lines carry the order public id only.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** RT4 and ops 7. */
export const LIMITS = {
  ipPer10Min: 5,
  emailPerDay: 20,
  globalPerHour: 300,
} as const;

const REUSABLE_PI = new Set(["requires_payment_method", "requires_confirmation", "requires_action"]);
const MAX_BODY = 16_000;

function json(body: unknown, status = 200, headers?: HeadersInit): Response {
  const h = new Headers(headers);
  h.set("content-type", "application/json");
  h.set("cache-control", "no-store");
  return new Response(JSON.stringify(body), { status, headers: h });
}

function ok(clientSecret: string, publicId: string, amountCents: number, token: string): Response {
  return json({ clientSecret, orderId: publicId, amountCents }, 200, { "set-cookie": viewTokenCookie(token) });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * The attempt's current order. A paid (or otherwise finished) order keeps its
 * attempt id, so a later different purchase from the same page load chains to
 * `<attempt>~<public id>` (a new order, priced with the paid kids counted).
 */
async function resolveAttempt(
  email: string,
  attemptId: string,
  livemode: boolean,
): Promise<{ key: string; existing: AttemptOrder | null }> {
  let key = attemptId;
  for (let i = 0; i < 4; i++) {
    const existing = await findPendingOrderByAttempt(email, key, livemode);
    if (!existing || existing.status === "pending") return { key, existing };
    key = `${attemptId}~${existing.publicId}`;
  }
  throw new Error("attempt_chain_too_long");
}

export async function POST(req: Request): Promise<Response> {
  // Mode gates PI creation (RT10, RT17): raw host header only.
  const mode = currentMode(req.headers.get("host"));
  if (mode === "off") return json({ error: "closed" }, 409);
  const now = new Date();
  if (!isOpen(now)) return json({ error: "closed" }, 409);
  const livemode = mode === "live";

  let body: Record<string, unknown>;
  try {
    const text = await req.text();
    if (text.length > MAX_BODY) return json({ error: "invalid" }, 422);
    body = JSON.parse(text);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("not an object");
  } catch {
    return json({ field: "body", error: "invalid" }, 422);
  }

  // Honeypot: a generic 422 (a silent 200 would leave the client without a clientSecret).
  if (body.company !== undefined && body.company !== null && body.company !== "") {
    logStep("commit.honeypot", null, false, "honeypot");
    return json({ error: "invalid" }, 422);
  }

  const v = validateCommit(body);
  if (!v.ok) return json({ field: v.field, error: v.error }, 422);
  const input = v.value;

  const expected = body.expectedCents;
  if (typeof expected !== "number" || !Number.isInteger(expected) || expected < 0) {
    return json({ field: "expectedCents", error: "invalid" }, 422);
  }
  const attemptId = cleanAttemptId(body.attemptId);
  if (!attemptId) return json({ field: "attemptId", error: "invalid" }, 422);

  const ip = req.headers.get("x-nf-client-connection-ip");
  let ref: string | null = null;

  try {
    // Server-side price (RT13 counting) and RT5.
    const prior = await priorPaidKidCount(input.email, livemode);
    const q = quote({ kids: input.kids, priorPaidKids: prior });
    if (q.totalCents !== expected) {
      logStep("commit.price_changed", null, true);
      return json({ error: "price_changed", amountCents: q.totalCents }, 409);
    }

    const stripe = getStripe();
    const sig = kidsSignature(input.kids);

    // RT3: reuse the attempt's PI when nothing changed.
    let { key: attemptKey, existing } = await resolveAttempt(input.email, attemptId, livemode);
    for (let wait = 0; existing && existing.status === "pending"; wait++) {
      ref = existing.publicId;
      const same = existing.amountCents === q.totalCents && kidsSignature(existing.kids) === sig;
      if (same && existing.paymentIntentId) {
        const pi = await stripe.paymentIntents.retrieve(existing.paymentIntentId);
        if (REUSABLE_PI.has(pi.status) && pi.client_secret) {
          const token = await issueViewToken(existing.orderId);
          logStep("commit.reuse", ref, true);
          return ok(pi.client_secret, existing.publicId, existing.amountCents, token);
        }
        if (pi.status === "processing" || pi.status === "succeeded") {
          // Already paying: never mint a second charge for the same attempt.
          logStep("commit.reuse", ref, false, `pi_${pi.status}`);
          return json({ error: "try_again" }, 503);
        }
      }
      if (same && !existing.paymentIntentId && wait < 6) {
        // A concurrent request (double tap) is still creating the PI.
        await sleep(500);
        ({ key: attemptKey, existing } = await resolveAttempt(input.email, attemptId, livemode));
        continue;
      }
      // Changed (or its PI is gone): cancel the old PI (errors ignored) and the order.
      if (existing.paymentIntentId) {
        try {
          await stripe.paymentIntents.cancel(existing.paymentIntentId);
        } catch (e) {
          logStep("commit.cancel_old_pi", ref, false, errCode(e));
        }
      }
      await cancelOrder(existing.orderId);
      logStep("commit.cancel_old_order", ref, true);
      ({ key: attemptKey, existing } = await resolveAttempt(input.email, attemptId, livemode));
    }

    // RT4: limits count new PaymentIntents only. A limiter failure fails closed.
    let allowed: boolean;
    try {
      const checks = await Promise.all([
        hit(`s1pi:ip:${ipBucket(ip)}`, LIMITS.ipPer10Min, 600, livemode),
        hit(`s1pi:email:${keyHash(input.email)}`, LIMITS.emailPerDay, 86_400, livemode),
        hit(`s1pi:global:${livemode ? "live" : "test"}`, LIMITS.globalPerHour, 3600, livemode),
      ]);
      allowed = checks.every(Boolean);
    } catch (e) {
      logStep("commit.ratelimit", null, false, errCode(e));
      return json({ error: "try_again" }, 503);
    }
    if (!allowed) {
      logStep("commit.ratelimit", null, false, "rate_limited");
      return json({ error: "rate_limited" }, 429);
    }

    // Family (guardian insert-only, RT7), kids, pending order with consent (RT20).
    const fam = await upsertFamilyGuardian({
      email: input.email,
      firstName: input.parentFirstName,
      phone: input.phone,
      livemode,
      attribution: input.src ? { src: input.src } : null,
      geo: (() => {
        const g = parseGeoHeader(req.headers.get("x-nf-geo"));
        return Object.keys(g).length ? g : null;
      })(),
    });
    const kidIds = await insertKids(
      fam.familyId,
      input.kids.map((k) => ({ firstName: k.firstName, age: k.age })),
      now,
    );
    let order: { orderId: string; publicId: string };
    try {
      order = await insertPendingOrder({
        familyId: fam.familyId,
        payerEmail: input.email,
        offerId: OFFER.id,
        offerVersion: OFFER.version,
        amountCents: q.totalCents,
        consentVersion: OFFER.termsVersion,
        consentAt: now,
        consentIp: ip ? ip.slice(0, 64) : null,
        consentUa: (req.headers.get("user-agent") ?? "").slice(0, 512) || null,
        consentXff: (req.headers.get("x-forwarded-for") ?? "").slice(0, 256) || null,
        src: input.src,
        livemode,
        attemptId: attemptKey,
        payerFirstName: input.parentFirstName,
        payerPhone: input.phone,
        items: q.lines.map((l) => ({ kidId: kidIds[l.kidIndex], role: l.role, unitCents: l.unitCents })),
      });
    } catch (e) {
      if (/s1_orders_attempt_key/.test(String((e as Error)?.message ?? ""))) {
        // Lost a double-tap race: the other request owns this attempt.
        logStep("commit.order", null, false, "attempt_race");
        return json({ error: "try_again" }, 503);
      }
      throw e;
    }
    ref = order.publicId;
    logStep("commit.order", ref, true);

    // RT6: one Season 01 Customer per family, never a search or a legacy Customer.
    let customerId = await getFamilyCustomerId(fam.familyId);
    if (!customerId) {
      const c = await stripe.customers.create(
        { email: input.email, metadata: { product: "season1", family_public_id: fam.familyPublicId } },
        { idempotencyKey: `s1-cust:${fam.familyId}` },
      );
      customerId = await setFamilyCustomerId(fam.familyId, c.id);
    }
    logStep("commit.customer", ref, true);

    assertKeyMatchesMode(mode);
    const params: Stripe.PaymentIntentCreateParams = {
      amount: q.totalCents,
      currency: "usd",
      customer: customerId,
      // RT9 as amended by the lead: card only (Apple Pay and Google Pay ride on card).
      payment_method_types: ["card"],
      setup_future_usage: "off_session",
      receipt_email: input.email,
      description: "EKUZO Season 01 commitment",
      metadata: {
        product: "season1",
        order_id: order.publicId,
        offer_version: OFFER.version,
        livemode: livemode ? "true" : "false",
      },
    };
    const pi = await stripe.paymentIntents.create(params, { idempotencyKey: `s1-pi:${order.publicId}` });
    const piCreatedAt = new Date(pi.created * 1000);
    // jersey_eligible here is provisional; fulfil recomputes it (RT8).
    await setOrderPaymentIntent(order.orderId, pi.id, piCreatedAt, isJerseyEligible(pi.created));
    logStep("commit.pi", ref, true);

    const token = await issueViewToken(order.orderId);
    if (!pi.client_secret) throw new Error("no_client_secret");
    return ok(pi.client_secret, order.publicId, q.totalCents, token);
  } catch (e) {
    logStep("commit.error", ref, false, errCode(e));
    return json({ error: "server" }, 500);
  }
}
