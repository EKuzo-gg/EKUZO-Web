import type Stripe from "stripe";
import { OFFER, isOpen, isJerseyEligible } from "@/lib/season1/offer";
import { currentMode } from "@/lib/season1/mode";
import { quote } from "@/lib/season1/pricing";
import { validateCommit } from "@/lib/season1/validate";
import { hit } from "@/lib/season1/ratelimit";
import { getStripe, assertKeyMatchesMode } from "@/lib/season1/stripe";
import { ipBucket } from "@/lib/season1/referralFlags";
import { inviteDecision, resolveCode, type InviteReason } from "@/lib/season1/referral";
import { REF_COOKIE_NAME, refSecret, verifyRef } from "@/lib/season1/refcookie";
import { parseGeoHeader } from "@/lib/seasonOneGeo";
import {
  addFamilyFlagsByEmail,
  cancelOrder,
  findPendingOrderByAttempt,
  foldName,
  getFamilyCustomerId,
  insertEvent,
  insertKids,
  insertPendingOrder,
  issueViewToken,
  paidKidKeys,
  priorPaidKidCount,
  setFamilyCustomerId,
  setOrderPaymentIntent,
  setPendingOrderReferralCode,
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
  /** T11: duplicate_kid answers per email per day before the generic Text Karlin. */
  duplicateKidPerDay: 3,
} as const;

const REUSABLE_PI = new Set(["requires_payment_method", "requires_confirmation", "requires_action"]);
const MAX_BODY = 16_000;

function json(body: unknown, status = 200, headers?: HeadersInit): Response {
  const h = new Headers(headers);
  h.set("content-type", "application/json");
  h.set("cache-control", "no-store");
  return new Response(JSON.stringify(body), { status, headers: h });
}

/** T7: what happened to the s1_ref invite on this commit. */
export interface InviteOutcome {
  invite: "applied" | "ignored" | "none";
  inviteReason: InviteReason | "removed" | "no_invite";
  /** The accepted code to store on the order (applied only). */
  code: string | null;
}

function ok(clientSecret: string, publicId: string, amountCents: number, token: string, inv: InviteOutcome): Response {
  return json(
    { clientSecret, orderId: publicId, amountCents, invite: inv.invite, inviteReason: inv.inviteReason },
    200,
    { "set-cookie": viewTokenCookie(token) },
  );
}

function cookieValue(req: Request, name: string): string | null {
  const raw = req.headers.get("cookie");
  if (!raw) return null;
  for (const part of raw.split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return null;
}

/**
 * Slice 2 commit invite: the signed s1_ref cookie (never the body) carries the
 * code; body inviteRemoved: true wins (T9). Re-resolved here without counting
 * against the named-render limit, then checked against the committing email.
 */
async function decideInvite(
  req: Request,
  body: Record<string, unknown>,
  email: string,
  livemode: boolean,
): Promise<InviteOutcome> {
  if (body.inviteRemoved === true) return { invite: "none", inviteReason: "removed", code: null };
  const raw = cookieValue(req, REF_COOKIE_NAME);
  if (!raw) return { invite: "none", inviteReason: "no_invite", code: null };
  let secret: string;
  try {
    secret = refSecret();
  } catch {
    logStep("commit.invite", null, false, "no_ref_secret");
    return { invite: "none", inviteReason: "no_invite", code: null };
  }
  // Unsigned or tampered values are ignored as if absent (T4).
  const code = verifyRef(raw, secret);
  if (!code) return { invite: "none", inviteReason: "no_invite", code: null };
  const r = await resolveCode(code, {
    ip: req.headers.get("x-nf-client-connection-ip"),
    userAgent: req.headers.get("user-agent"),
    livemode,
    countForLimit: false,
  });
  if (!r) return { invite: "ignored", inviteReason: "unknown", code: null };
  const d = await inviteDecision({ code: r.code, committingEmail: email, livemode });
  return d.applied
    ? { invite: "applied", inviteReason: "ok", code: r.code }
    : { invite: "ignored", inviteReason: d.reason, code: null };
}

/** Records an ignored invite (no PII: order public id, reason). */
async function recordIgnored(inv: InviteOutcome, orderPublicId: string, livemode: boolean): Promise<void> {
  if (inv.invite !== "ignored") return;
  await insertEvent({
    source: "commit",
    type: "invite.ignored",
    subject: orderPublicId,
    data: { reason: inv.inviteReason },
    livemode,
  });
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
  const ip = req.headers.get("x-nf-client-connection-ip");

  // T11: every commit call counts against the per-IP limit. Fails closed.
  try {
    if (!(await hit(`s1pi:ip:${ipBucket(ip)}`, LIMITS.ipPer10Min, 600, livemode))) {
      logStep("commit.ratelimit", null, false, "rate_limited_ip");
      return json({ error: "rate_limited" }, 429);
    }
  } catch (e) {
    logStep("commit.ratelimit", null, false, errCode(e));
    return json({ error: "try_again" }, 503);
  }

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

  let ref: string | null = null;

  // T11: every validated call counts against the per-email limit, 409s included.
  try {
    if (!(await hit(`s1pi:email:${keyHash(input.email)}`, LIMITS.emailPerDay, 86_400, livemode))) {
      logStep("commit.ratelimit", null, false, "rate_limited_email");
      return json({ error: "rate_limited" }, 429);
    }
  } catch (e) {
    logStep("commit.ratelimit", null, false, errCode(e));
    return json({ error: "try_again" }, 503);
  }

  try {
    // P6 duplicate guard before any PI (T11: after 3 hits a day, generic Text Karlin and a flag).
    const paidKeys = new Set(await paidKidKeys(input.email, livemode));
    const dup = input.kids.find((k) => paidKeys.has(foldName(k.firstName)));
    if (dup) {
      const under = await hit(`s1dup:email:${keyHash(input.email)}`, LIMITS.duplicateKidPerDay, 86_400, livemode);
      if (under) {
        logStep("commit.duplicate_kid", null, false, "duplicate_kid");
        return json({ error: "duplicate_kid", kidFirstName: dup.firstName }, 409);
      }
      await insertEvent({
        source: "commit",
        type: "flag.duplicate_kid_repeat",
        subject: keyHash(input.email),
        data: { flag: "duplicate_kid_repeat" },
        livemode,
      });
      await addFamilyFlagsByEmail(input.email, livemode, ["duplicate_kid_repeat"]);
      logStep("commit.duplicate_kid", null, false, "text_karlin");
      return json({ error: "text_karlin" }, 409);
    }

    const inv = await decideInvite(req, body, input.email, livemode);

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
          // Slice 2: the invite is re-evaluated on every call; the amount never depends on it.
          if (existing.referralCode !== inv.code) await setPendingOrderReferralCode(existing.orderId, inv.code);
          await recordIgnored(inv, existing.publicId, livemode);
          const token = await issueViewToken(existing.orderId);
          logStep("commit.reuse", ref, true);
          return ok(pi.client_secret, existing.publicId, existing.amountCents, token, inv);
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

    // RT4 / ops 7: the global ceiling counts new PaymentIntents only (IP and
    // email are counted per call above, T11). A limiter failure fails closed.
    let allowed: boolean;
    try {
      allowed = await hit(`s1pi:global:${livemode ? "live" : "test"}`, LIMITS.globalPerHour, 3600, livemode);
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
        referralCode: inv.code,
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
    await recordIgnored(inv, order.publicId, livemode);

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
    return ok(pi.client_secret, order.publicId, q.totalCents, token, inv);
  } catch (e) {
    logStep("commit.error", ref, false, errCode(e));
    return json({ error: "server" }, 500);
  }
}
