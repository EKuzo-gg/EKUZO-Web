import type { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import Stripe from "stripe";
import type { ProductConfig } from "./products";
import { isValidSquadToken } from "./squad";

/**
 * Shared register-API helper — Teams convergence Seam 3 (Phase 3).
 *
 * Extracts the shared base of the three `/api/{product}/register` routes:
 * request-context derivation (IP / UA / fbc / fbp / origin / UTMs /
 * cta_source), shared metadata assembly (parent, gamer_count, timezone,
 * attribution), squad-token validation + server-side fallback minting,
 * per-gamer JSON stringify+slice, `additional_info` 500-char chunking,
 * and the actual `stripe.paymentIntents.create` call.
 *
 * Each `/api/{product}/register` route becomes a thin wrapper that:
 *   1. Runs product-specific validation (price, paymentPlan, cohort, …)
 *   2. Builds product-specific metadata + per-gamer shape
 *   3. Optionally creates a Stripe Customer first (teams)
 *   4. Calls `createRegistrationPaymentIntent(...)` with the product
 *      config + product-specific extras
 *   5. Applies any product-specific response decoration (teams adds
 *      `chargeNow`, `paymentPlan`)
 *
 * The contract for camps + e100 is **byte-identical to pre-Phase-3** (their
 * existing pages already supply a valid squad_token, so the server-mint
 * fallback is dead code for them). Teams gains a `squad_token` in every
 * non-joiner PI's metadata — the Phase 2 webhook consumes it without
 * further changes.
 *
 * See marketing/teams-redesign/05-phase3-register-api.md §2–§4 for the
 * shared-vs.-product-specific characterization that drove this shape.
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export type RegisterParent = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

/**
 * Shape every register form sends as the shared body envelope. Product-
 * specific fields (cohort, paymentPlan, totalPrice, etc.) live alongside
 * these on the body and are read by the per-route wrapper, not here.
 */
export type SharedRegisterBody = {
  parent?: RegisterParent;
  gamers?: unknown[];
  additionalInfo?: string;
  timezone?: string;
  squad_token?: unknown;
  joining_squad_token?: unknown;
  attribution?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  };
  cta_source?: string;
  fbc?: string;
  fbp?: string;
};

export type CreateRegistrationPaymentIntentParams<Gamer> = {
  request: NextRequest;
  body: SharedRegisterBody;
  productConfig: ProductConfig;
  /**
   * Validated, typed gamer list — the route runs product-specific gamer
   * validation before calling the helper and passes the result here. The
   * helper does NOT validate gamer shape (only that the array is
   * non-empty — see {@link validateSharedRegisterBody}).
   */
  gamers: Gamer[];
  /**
   * Product-specific metadata fields merged into the base metadata
   * AFTER the shared keys are written. Use this for cohort_*,
   * payment_plan, semester_label, squad_status, etc.
   */
  productMetadata: Record<string, string>;
  /**
   * Per-gamer JSON shape. The helper handles
   * `JSON.stringify(...).slice(0, 500)` and stores under `gamer_${i}`.
   */
  buildGamerMetadataShape: (gamer: Gamer) => unknown;
  /** Payment Intent amount in cents. */
  amount: number;
  /** Stripe PI `description` field. */
  description: string;
  /**
   * Extra Payment Intent params merged onto the standard ones. Used by
   * teams to set `customer` and (for installments) `setup_future_usage`.
   * Cannot override `amount`, `currency`, `metadata`, `receipt_email`,
   * `description`, or `automatic_payment_methods` — those are owned by
   * the helper.
   */
  paymentIntentParams?: Omit<
    Stripe.PaymentIntentCreateParams,
    | "amount"
    | "currency"
    | "metadata"
    | "receipt_email"
    | "description"
    | "automatic_payment_methods"
  >;
};

export type CreateRegistrationPaymentIntentResult =
  | { ok: true; clientSecret: string; paymentIntentId: string }
  | { ok: false; status: number; error: string };

/**
 * Shared-base validation. Returns null when valid, or an error message
 * string. Per-route wrappers run product-specific validation BEFORE
 * calling this (so the user sees their product's specific error first
 * when relevant — e.g. "Please select a cohort" before "Parent name and
 * email are required").
 *
 * Note: each existing route worded its parent-required error slightly
 * differently ("Parent name and email are required."). Kept identical
 * for byte-parity with the pre-Phase-3 error responses.
 */
export function validateSharedRegisterBody(
  body: SharedRegisterBody
): string | null {
  if (!body.parent?.email || !body.parent?.firstName || !body.parent?.lastName) {
    return "Parent name and email are required.";
  }
  if (!body.gamers?.length) {
    return "At least one gamer registration is required.";
  }
  return null;
}

/**
 * Build the shared request-context fields. Server-side reads of headers
 * + cookies that thread through to Meta CAPI + Klaviyo + Beehiiv. See
 * `/api/camps/register/route.ts` (pre-Phase-3) for the original
 * comments — the rationale carries over verbatim.
 */
function deriveRequestContext(
  request: NextRequest,
  body: SharedRegisterBody
) {
  const xff = request.headers.get("x-forwarded-for") || "";
  const clientIp =
    (xff.split(",")[0] || "").trim() ||
    (request.headers.get("x-real-ip") || "").trim() ||
    "";
  const clientUa = (request.headers.get("user-agent") || "").slice(0, 400);

  const clientFbc = typeof body.fbc === "string" ? body.fbc.slice(0, 500) : "";
  const clientFbp = typeof body.fbp === "string" ? body.fbp.slice(0, 500) : "";

  const origin = request.cookies.get("ekuzo_origin")?.value || "unknown";

  const attr = body.attribution || {};
  const utm_source = String(attr.utm_source || "").slice(0, 200);
  const utm_medium = String(attr.utm_medium || "").slice(0, 200);
  const utm_campaign = String(attr.utm_campaign || "").slice(0, 200);
  const utm_content = String(attr.utm_content || "").slice(0, 200);
  const utm_term = String(attr.utm_term || "").slice(0, 200);

  const cta_source =
    body.cta_source === "hero" ||
    body.cta_source === "sticky" ||
    body.cta_source === "footer" ||
    body.cta_source === "header"
      ? body.cta_source
      : "";

  return {
    clientIp,
    clientUa,
    clientFbc,
    clientFbp,
    origin,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    cta_source,
  };
}

/**
 * Apply the squad-token rules:
 *   1. Valid `joining_squad_token` → set `meta.joining_squad_token`;
 *      DO NOT mint `squad_token` (joiners inherit the owner's crew).
 *   2. Else valid `squad_token` (sent by the page) → use that value.
 *   3. Else → mint a fresh 10-char nanoid server-side. (Teams reaches
 *      this branch today; camps + e100 always send a valid token from
 *      their existing pages so the mint is dead code for them.)
 *
 * Mutates `metadata` in place.
 *
 * See marketing/teams-redesign/05-phase3-register-api.md §3 for the
 * full decision rationale.
 */
function applySquadTokens(
  metadata: Record<string, string>,
  body: SharedRegisterBody
): void {
  if (isValidSquadToken(body.joining_squad_token)) {
    metadata.joining_squad_token = body.joining_squad_token;
    return;
  }
  if (isValidSquadToken(body.squad_token)) {
    metadata.squad_token = body.squad_token;
    return;
  }
  metadata.squad_token = nanoid(10);
}

/**
 * Split `additional_info` across up to three 500-char metadata keys
 * (`additional_info`, `additional_info_2`, `additional_info_3`). Stripe
 * metadata values cap at 500 chars; the input is sliced to 1500 chars
 * total so the chunker can't exceed three keys.
 *
 * Mutates `metadata` in place.
 */
function applyAdditionalInfo(
  metadata: Record<string, string>,
  additionalInfo: string | undefined
): void {
  const info = (additionalInfo || "").slice(0, 1500);
  if (!info) return;
  const chunks = info.match(/.{1,500}/g) || [];
  chunks.forEach((chunk, i) => {
    metadata[i === 0 ? "additional_info" : `additional_info_${i + 1}`] = chunk;
  });
}

/**
 * Create the registration Payment Intent. Returns a discriminated-union
 * result; per-route wrappers translate `{ ok: false, status, error }`
 * into a `NextResponse.json(...)` directly.
 */
export async function createRegistrationPaymentIntent<Gamer>(
  params: CreateRegistrationPaymentIntentParams<Gamer>
): Promise<CreateRegistrationPaymentIntentResult> {
  try {
    const {
      request,
      body,
      productConfig,
      gamers,
      productMetadata,
      buildGamerMetadataShape,
      amount,
      description,
      paymentIntentParams,
    } = params;

    const baseValidation = validateSharedRegisterBody({ ...body, gamers });
    if (baseValidation) {
      return { ok: false, status: 400, error: baseValidation };
    }

    const parent = body.parent!;
    const ctx = deriveRequestContext(request, body);

    const metadata: Record<string, string> = {
      product: productConfig.id,
      // Environment isolation: webhook skips events whose environment
      // doesn't match the current deploy context. Prevents dev payments
      // from being processed by the production webhook.
      environment: process.env.CONTEXT || "development",
      parent_first_name: parent.firstName,
      parent_last_name: parent.lastName,
      parent_email: parent.email,
      parent_phone: parent.phone || "",
      gamer_count: String(gamers.length),
      timezone: body.timezone || "",
    };

    // Add only non-empty attribution + CAPI fields. Stripe metadata has
    // a 50-key cap; skipping empties leaves headroom for additional_info
    // chunks, per-gamer blobs, and product-specific extras.
    if (ctx.clientIp) metadata.client_ip_address = ctx.clientIp;
    if (ctx.clientUa) metadata.client_user_agent = ctx.clientUa;
    if (ctx.clientFbc) metadata.fbc = ctx.clientFbc;
    if (ctx.clientFbp) metadata.fbp = ctx.clientFbp;
    metadata.origin = ctx.origin;
    if (ctx.utm_source) metadata.utm_source = ctx.utm_source;
    if (ctx.utm_medium) metadata.utm_medium = ctx.utm_medium;
    if (ctx.utm_campaign) metadata.utm_campaign = ctx.utm_campaign;
    if (ctx.utm_content) metadata.utm_content = ctx.utm_content;
    if (ctx.utm_term) metadata.utm_term = ctx.utm_term;
    if (ctx.cta_source) metadata.cta_source = ctx.cta_source;

    applySquadTokens(metadata, body);

    // Product-specific extras are written AFTER the shared base. Same
    // semantic as the pre-Phase-3 per-route inline writes.
    Object.assign(metadata, productMetadata);

    applyAdditionalInfo(metadata, body.additionalInfo);

    gamers.forEach((gamer, i) => {
      metadata[`gamer_${i}`] = JSON.stringify(
        buildGamerMetadataShape(gamer)
      ).slice(0, 500);
    });

    const piParams: Stripe.PaymentIntentCreateParams = {
      ...paymentIntentParams,
      amount,
      currency: "usd",
      metadata,
      receipt_email: parent.email,
      description,
      automatic_payment_methods: { enabled: true },
    };

    const paymentIntent = await stripe.paymentIntents.create(piParams);

    return {
      ok: true,
      clientSecret: paymentIntent.client_secret || "",
      paymentIntentId: paymentIntent.id,
    };
  } catch (err) {
    console.error("Error creating payment intent:", err);
    const message =
      err instanceof Error ? err.message : "Failed to create payment intent.";
    return { ok: false, status: 500, error: message };
  }
}
