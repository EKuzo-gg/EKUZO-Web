import type Stripe from "stripe";
import { OFFER, isOpen, isJerseyEligible } from "@/lib/season1/offer";
import { currentMode } from "@/lib/season1/mode";
import { quote } from "@/lib/season1/pricing";
import { validateCommit, commitFlags } from "@/lib/season1/validate";
import { hit, hitPair } from "@/lib/season1/ratelimit";
import { getStripe, assertKeyMatchesMode } from "@/lib/season1/stripe";
import { ipBucket } from "@/lib/season1/referralFlags";
import { inviteDecision, resolveCode, type InviteReason } from "@/lib/season1/referral";
import { REF_COOKIE_NAME, refSecret, verifyRef } from "@/lib/season1/refcookie";
import { parseGeoHeader } from "@/lib/seasonOneGeo";
import {
  addFamilyFlagsByEmail,
  cancelOrder,
  commitPrecheck,
  enqueueOutbox,
  findPendingOrderByAttempt,
  foldName,
  insertCommitRecords,
  insertEvent,
  issueViewToken,
  setFamilyCustomerId,
  setOrderPaymentIntentAndToken,
  setPendingOrderReferralCode,
  type AttemptOrder,
} from "@/lib/season1/db";
import { cleanAttemptId, errCode, globalCeilingAlertKey, kidsSignature, keyHash, logStep, viewTokenCookie } from "@/lib/season1/rules";
import { SECURITY_HEADERS, isCrossSite, isJsonContentType } from "@/lib/season1/httpGuard";
import { ServerTiming, runTimed, takeColdFlag, timed } from "@/lib/season1/serverTiming";

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
  /** Security review M1: raised from 300; a trip queues one ops_alert per hour. */
  globalPerHour: 1000,
  /** T11: duplicate_kid answers per email per day before the generic Text Karlin. */
  duplicateKidPerDay: 3,
} as const;

const REUSABLE_PI = new Set(["requires_payment_method", "requires_confirmation", "requires_action"]);
const MAX_BODY = 16_000;

function json(body: unknown, status = 200, headers?: HeadersInit): Response {
  const h = new Headers(headers);
  h.set("content-type", "application/json");
  h.set("cache-control", "no-store");
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) h.set(k, v);
  return new Response(JSON.stringify(body), { status, headers: h });
}

/**
 * T7: what happened to the s1_ref invite on this commit. Only `invite` goes to
 * the client (security review M2: the reason told any caller whether an email
 * had paid or belonged to the code's family); the reason stays in s1_events.
 */
export interface InviteOutcome {
  invite: "applied" | "ignored" | "none";
  inviteReason: InviteReason | "removed" | "no_invite";
  /** The accepted code to store on the order (applied only). */
  code: string | null;
}

function ok(clientSecret: string, publicId: string, amountCents: number, token: string, inv: InviteOutcome): Response {
  return json(
    { clientSecret, orderId: publicId, amountCents, invite: inv.invite },
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
  /** The first key's lookup when already read (commitPrecheck); undefined reads it. */
  first?: AttemptOrder | null,
): Promise<{ key: string; existing: AttemptOrder | null }> {
  let key = attemptId;
  for (let i = 0; i < 4; i++) {
    const existing = i === 0 && first !== undefined ? first : await findPendingOrderByAttempt(email, key, livemode);
    if (!existing || existing.status === "pending") return { key, existing };
    key = `${attemptId}~${existing.publicId}`;
  }
  throw new Error("attempt_chain_too_long");
}

/**
 * Canary 10-29: a parent waited about 5 s on "Saving". Every response carries
 * Server-Timing (db, the first db round trip, stripe, total; counts only, no
 * PII) so the wait can be split between a Neon wake, Stripe and a cold start.
 */
export async function POST(req: Request): Promise<Response> {
  const st = new ServerTiming(takeColdFlag());
  const res = await runTimed(st, () => handle(req));
  res.headers.set("server-timing", st.header());
  return res;
}

async function handle(req: Request): Promise<Response> {
  // L1: no cross-site posts; the body must be declared JSON (a cross-site
  // text/plain form post would otherwise skip the CORS preflight).
  if (isCrossSite(req)) {
    logStep("commit.origin", null, false, "cross_site");
    return json({ error: "forbidden" }, 403);
  }
  if (!isJsonContentType(req)) return json({ error: "unsupported_media_type" }, 415);

  // Mode gates PI creation (RT10, RT17): raw host header only.
  const mode = currentMode(req.headers.get("host"));
  if (mode === "off") return json({ error: "closed" }, 409);
  const now = new Date();
  if (!isOpen(now)) return json({ error: "closed" }, 409);
  const livemode = mode === "live";
  const ip = req.headers.get("x-nf-client-connection-ip");

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

  // T11 as amended (Sentry final D5): every call that passes validation counts
  // against the per-IP limit (IPv6 bucketed at /48, security review M1) and the
  // per-email limit, 409s included; 422s count against neither. Fails closed.
  // Speed pass 10-29: both in one round trip; the email counts only when the IP passed, as before.
  try {
    const [ipOk, emailOk] = await hitPair(
      { key: `s1pi:ip:${ipBucket(ip, 48)}`, limit: LIMITS.ipPer10Min, windowSeconds: 600 },
      { key: `s1pi:email:${keyHash(input.email)}`, limit: LIMITS.emailPerDay, windowSeconds: 86_400 },
      livemode,
    );
    if (!ipOk) {
      logStep("commit.ratelimit", null, false, "rate_limited_ip");
      return json({ error: "rate_limited" }, 429);
    }
    if (emailOk !== true) {
      logStep("commit.ratelimit", null, false, "rate_limited_email");
      return json({ error: "rate_limited" }, 429);
    }
  } catch (e) {
    logStep("commit.ratelimit", null, false, errCode(e));
    return json({ error: "try_again" }, 503);
  }

  try {
    // Speed pass 10-29: paid kids, prior count, the attempt's order and the family in one read.
    const pre = await commitPrecheck(input.email, attemptId, livemode);
    // P6 duplicate guard before any PI (T11: after 3 hits a day, generic Text Karlin and a flag).
    const paidKeys = new Set(pre.paidKeys);
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
    const prior = pre.prior;
    const q = quote({ kids: input.kids, priorPaidKids: prior });
    if (q.totalCents !== expected) {
      logStep("commit.price_changed", null, true);
      return json({ error: "price_changed", amountCents: q.totalCents }, 409);
    }

    const stripe = getStripe();
    const sig = kidsSignature(input.kids);

    // RT3: reuse the attempt's PI when nothing changed.
    let { key: attemptKey, existing } = await resolveAttempt(input.email, attemptId, livemode, pre.attempt);
    for (let wait = 0; existing && existing.status === "pending"; wait++) {
      ref = existing.publicId;
      const same = existing.amountCents === q.totalCents && kidsSignature(existing.kids) === sig;
      if (same && existing.paymentIntentId) {
        const piId = existing.paymentIntentId;
        const pi = await timed("stripe", () => stripe.paymentIntents.retrieve(piId));
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
      const oldPiId = existing.paymentIntentId;
      if (oldPiId) {
        try {
          await timed("stripe", () => stripe.paymentIntents.cancel(oldPiId));
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
      // M1: someone should see a tripped ceiling. One row per clock hour (the
      // dedupe key absorbs repeats); a failed enqueue never changes the 429.
      try {
        const key = globalCeilingAlertKey(now);
        await enqueueOutbox("ops_alert", key, { kind: "global_ceiling", hour: key.split(":").pop(), livemode }, livemode);
      } catch (e) {
        logStep("commit.ceiling_alert", null, false, errCode(e));
      }
      return json({ error: "rate_limited" }, 429);
    }

    // Family (guardian insert-only, RT7), kids, pending order with consent (RT20).
    // Speed pass 10-29: one transaction (one round trip); the family comes from the precheck.
    let fam: Awaited<ReturnType<typeof insertCommitRecords>>["fam"];
    let order: { orderId: string; publicId: string };
    try {
      const rec = await insertCommitRecords({
        family: pre.family,
        email: input.email,
        firstName: input.parentFirstName,
        phone: input.phone,
        livemode,
        attribution: input.src ? { src: input.src } : null,
        geo: (() => {
          const g = parseGeoHeader(req.headers.get("x-nf-geo"));
          return Object.keys(g).length ? g : null;
        })(),
        kids: input.kids.map((k) => ({ firstName: k.firstName, age: k.age })),
        now,
        order: {
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
          flags: commitFlags(input.kids),
          attemptId: attemptKey,
          payerFirstName: input.parentFirstName,
          payerPhone: input.phone,
        },
        lines: q.lines.map((l) => ({ kidIndex: l.kidIndex, role: l.role, unitCents: l.unitCents })),
      });
      fam = rec.fam;
      order = rec.order;
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
    let customerId = fam.customerId;
    if (!customerId) {
      const c = await timed("stripe", () =>
        stripe.customers.create(
          { email: input.email, metadata: { product: "season1", family_public_id: fam.familyPublicId } },
          { idempotencyKey: `s1-cust:${fam.familyId}` },
        ),
      );
      customerId = await setFamilyCustomerId(fam.familyId, c.id);
    }
    logStep("commit.customer", ref, true);

    assertKeyMatchesMode(mode);
    const params: Stripe.PaymentIntentCreateParams = {
      amount: q.totalCents,
      currency: "usd",
      customer: customerId,
      // RT9 as amended by the lead: card (Apple Pay and Google Pay ride on card), plus Link,
      // which only the wallet row offers (Jamie 10-29: Link as a secondary wallet button; the
      // card form keeps Link off).
      payment_method_types: ["card", "link"],
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
    const pi = await timed("stripe", () => stripe.paymentIntents.create(params, { idempotencyKey: `s1-pi:${order.publicId}` }));
    const piCreatedAt = new Date(pi.created * 1000);
    // jersey_eligible here is provisional; fulfil recomputes it (RT8).
    // Speed pass 10-29: payment intent and view token in one statement.
    const token = await setOrderPaymentIntentAndToken(order.orderId, pi.id, piCreatedAt, isJerseyEligible(pi.created));
    logStep("commit.pi", ref, true);

    if (!pi.client_secret) throw new Error("no_client_secret");
    return ok(pi.client_secret, order.publicId, q.totalCents, token, inv);
  } catch (e) {
    logStep("commit.error", ref, false, errCode(e));
    return json({ error: "server" }, 500);
  }
}
