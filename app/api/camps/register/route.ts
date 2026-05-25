import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { isValidSquadToken } from "@/lib/squad";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

/**
 * Shape of each gamer as posted by the camps register form. Kept local
 * to this route because it's the client-form shape (has `selectedSlot`,
 * `preferredGames` as array) — distinct from the metadata-reconstructed
 * shape in the Stripe webhook. All fields optional: we defensively
 * coerce in the body.
 */
type ClientGamer = {
  firstName?: string;
  lastName?: string;
  gamerTag?: string;
  weekLabel?: string;
  weekDates?: string;
  selectedSlot?: string;
  slotHours?: string;
  price?: number;
  birthday?: string;
  gender?: string;
  skillLevel?: string;
  tshirtSize?: string;
  preferredGames?: string[];
};

/**
 * POST /api/camps/register
 *
 * Receives the full registration payload (parent info, gamers array with
 * week/slot selections), creates a Stripe Payment Intent with all
 * registration data as metadata, and returns the client_secret for
 * Stripe Elements on the frontend.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      parent,
      gamers,
      additionalInfo,
      totalPrice,
      timezone,
      squadStatus,
      squad_token,
      joining_squad_token,
      attribution,
      cta_source,
      fbc,
      fbp,
    } = body;

    // ── Validate ────────────────────────────────────────────────────
    if (!parent?.email || !parent?.firstName || !parent?.lastName) {
      return NextResponse.json(
        { error: "Parent name and email are required." },
        { status: 400 }
      );
    }

    if (!gamers?.length) {
      return NextResponse.json(
        { error: "At least one gamer registration is required." },
        { status: 400 }
      );
    }

    if (!totalPrice || totalPrice <= 0) {
      return NextResponse.json(
        { error: "Invalid total price." },
        { status: 400 }
      );
    }

    // ── Flatten gamer data into metadata ────────────────────────────
    // Stripe metadata values must be strings ≤500 chars.
    // We store each gamer's info as a JSON string keyed by index.
    // squad_status: "building" | "looking" (family-level vibe check)
    // Coerced to a safe string; unknown/missing values become "".
    const squadStatusSafe =
      squadStatus === "building" || squadStatus === "looking" ? squadStatus : "";

    // Client IP + User Agent — captured on this server-side route (which
    // IS called from the user's browser) and threaded through PI metadata
    // so the Stripe webhook can attach them to the Meta Conversions API
    // payload. The webhook itself is a server-to-server call from Stripe;
    // its request.headers are Stripe's, not the visitor's. Per Meta,
    // adding ip + ua + zip to user_data lifts match quality ~50%.
    //
    // x-forwarded-for is a comma-separated chain (client, proxy1, proxy2…);
    // the left-most entry is the real client. Netlify forwards client IPs
    // here. x-real-ip is a Netlify-set fallback for the same value.
    const xff = req.headers.get("x-forwarded-for") || "";
    const clientIp =
      (xff.split(",")[0] || "").trim() ||
      (req.headers.get("x-real-ip") || "").trim() ||
      "";
    const clientUa = (req.headers.get("user-agent") || "").slice(0, 400);

    // Meta Pixel _fbc / _fbp — captured client-side by the register page
    // from document.cookie and posted here. Forwarded verbatim into PI
    // metadata (plaintext, no hash per Meta spec) so the Stripe webhook
    // can attach them to the CAPI Purchase user_data. Coerced to string +
    // capped well under Stripe's 500-char/value limit.
    const clientFbc =
      typeof fbc === "string" ? fbc.slice(0, 500) : "";
    const clientFbp =
      typeof fbp === "string" ? fbp.slice(0, 500) : "";

    // First-touch acquisition origin — set by middleware.ts on the
    // visitor's first page view, persisted in the ekuzo_origin cookie.
    // Threaded through PI metadata so the webhook can write it to the
    // Klaviyo profile + Google Sheets. Defaults to "unknown" if the
    // cookie is somehow absent (shouldn't happen post-middleware).
    const origin = req.cookies.get("ekuzo_origin")?.value || "unknown";

    // Attribution — first-touch UTMs captured client-side and posted
    // through here. Empty strings are fine; the webhook treats absence as
    // "organic" when deriving acquisition_source.
    const attr = attribution || {};
    const utmSourceMarketing = String(attr.utm_source || "").slice(0, 200);
    const utmMedium = String(attr.utm_medium || "").slice(0, 200);
    const utmCampaign = String(attr.utm_campaign || "").slice(0, 200);
    const utmContent = String(attr.utm_content || "").slice(0, 200);
    const utmTerm = String(attr.utm_term || "").slice(0, 200);

    const metadata: Record<string, string> = {
      product: "camps",
      // Environment isolation: webhook skips events whose environment doesn't
      // match the current deploy context. Prevents dev payments from being
      // processed by the production webhook (and vice versa).
      environment: process.env.CONTEXT || "development",
      parent_first_name: parent.firstName,
      parent_last_name: parent.lastName,
      parent_email: parent.email,
      parent_phone: parent.phone || "",
      gamer_count: String(gamers.length),
      timezone: timezone || "",
      squad_status: squadStatusSafe,
    };

    // Add only non-empty attribution + CAPI fields. Stripe metadata has a
    // 50-key cap; skipping empties leaves headroom for additional_info
    // chunks and per-gamer JSON blobs.
    if (clientIp) metadata.client_ip_address = clientIp;
    if (clientUa) metadata.client_user_agent = clientUa;
    if (clientFbc) metadata.fbc = clientFbc;
    if (clientFbp) metadata.fbp = clientFbp;
    metadata.origin = origin;
    if (utmSourceMarketing) metadata.utm_source = utmSourceMarketing;
    if (utmMedium) metadata.utm_medium = utmMedium;
    if (utmCampaign) metadata.utm_campaign = utmCampaign;
    if (utmContent) metadata.utm_content = utmContent;
    if (utmTerm) metadata.utm_term = utmTerm;

    // CTA placement that produced this registration. Allow-listed against
    // the three landing-page surfaces (hero / sticky / footer); anything
    // else is dropped so noise in the query string doesn't land in Stripe.
    if (
      cta_source === "hero" ||
      cta_source === "sticky" ||
      cta_source === "footer" ||
      cta_source === "header"
    ) {
      metadata.cta_source = cta_source;
    }

    // Squad link tokens (camps only) — 10-char nanoids, validated against
    // a strict charset/length allow-list before they land in Stripe
    // metadata so arbitrary client input can't be smuggled downstream.
    if (isValidSquadToken(squad_token)) {
      metadata.squad_token = squad_token;
    }
    if (isValidSquadToken(joining_squad_token)) {
      metadata.joining_squad_token = joining_squad_token;
    }

    // Split additional_info across multiple metadata keys if >500 chars
    // Stripe metadata values max 500 chars each, max 50 keys total
    const info = (additionalInfo || "").slice(0, 1500); // cap at 1500 total
    if (info) {
      const chunks = info.match(/.{1,500}/g) || [];
      chunks.forEach((chunk: string, i: number) => {
        metadata[i === 0 ? "additional_info" : `additional_info_${i + 1}`] = chunk;
      });
    }

    gamers.forEach((gamer: ClientGamer, i: number) => {
      metadata[`gamer_${i}`] = JSON.stringify({
        firstName: gamer.firstName,
        lastName: gamer.lastName,
        gamerTag: gamer.gamerTag,
        weekLabel: gamer.weekLabel,
        weekDates: gamer.weekDates,
        slot: gamer.selectedSlot,
        slotHours: gamer.slotHours,
        price: gamer.price,
        birthday: gamer.birthday,
        gender: gamer.gender || "",
        skillLevel: gamer.skillLevel,
        tshirtSize: gamer.tshirtSize,
        preferredGames: gamer.preferredGames?.join(", "),
      }).slice(0, 500);
    });

    // ── Create Payment Intent ──────────────────────────────────────
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // cents
      currency: "usd",
      metadata,
      receipt_email: parent.email,
      description: `EKUZO Camp — ${gamers.length} gamer${gamers.length > 1 ? "s" : ""}`,
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error("Error creating payment intent:", err);
    const message =
      err instanceof Error ? err.message : "Failed to create payment intent.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
