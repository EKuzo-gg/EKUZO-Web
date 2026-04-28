import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

/**
 * POST /api/ekuzo100/register
 *
 * Receives the EKUZO100 registration payload (parent info, gamers array,
 * cohort selection, schedule preference), creates a Stripe Payment Intent
 * with all registration data as metadata, and returns the client_secret
 * for Stripe Elements on the frontend.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      parent,
      gamers,
      cohort,
      additionalInfo,
      totalPrice,
      timezone,
      attribution,
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
        { error: "At least one gamer is required." },
        { status: 400 }
      );
    }

    if (!cohort?.value) {
      return NextResponse.json(
        { error: "Please select a cohort month." },
        { status: 400 }
      );
    }

    const expectedPrice = 100 * gamers.length;
    if (!totalPrice || totalPrice !== expectedPrice) {
      return NextResponse.json(
        { error: "Invalid total price." },
        { status: 400 }
      );
    }

    // Client IP + UA + UTM attribution — see /api/camps/register for the
    // rationale. Same pipeline (PI metadata → webhook → CAPI / Sheets /
    // Klaviyo / Beehiiv).
    const xff = req.headers.get("x-forwarded-for") || "";
    const clientIp =
      (xff.split(",")[0] || "").trim() ||
      (req.headers.get("x-real-ip") || "").trim() ||
      "";
    const clientUa = (req.headers.get("user-agent") || "").slice(0, 500);

    const attr = attribution || {};
    const utmSourceMarketing = String(attr.utm_source || "").slice(0, 200);
    const utmMedium = String(attr.utm_medium || "").slice(0, 200);
    const utmCampaign = String(attr.utm_campaign || "").slice(0, 200);
    const utmContent = String(attr.utm_content || "").slice(0, 200);
    const utmTerm = String(attr.utm_term || "").slice(0, 200);

    // ── Build metadata ──────────────────────────────────────────────
    // Stripe metadata values must be strings ≤500 chars.
    const metadata: Record<string, string> = {
      product: "ekuzo100",
      // Environment isolation: see camps/register/route.ts for details.
      environment: process.env.CONTEXT || "development",
      parent_first_name: parent.firstName,
      parent_last_name: parent.lastName,
      parent_email: parent.email,
      parent_phone: parent.phone || "",
      gamer_count: String(gamers.length),
      timezone: timezone || "",
      cohort_month: cohort.value || "",
      cohort_label: cohort.label || "",
      cohort_start: cohort.startDate || "",
      cohort_end: cohort.endDate || "",
    };

    if (clientIp) metadata.client_ip_address = clientIp;
    if (clientUa) metadata.client_user_agent = clientUa;
    if (utmSourceMarketing) metadata.utm_source = utmSourceMarketing;
    if (utmMedium) metadata.utm_medium = utmMedium;
    if (utmCampaign) metadata.utm_campaign = utmCampaign;
    if (utmContent) metadata.utm_content = utmContent;
    if (utmTerm) metadata.utm_term = utmTerm;

    // Per-gamer data
    gamers.forEach((gamer: any, i: number) => {
      metadata[`gamer_${i}`] = JSON.stringify({
        firstName: gamer.firstName,
        lastName: gamer.lastName,
        gamerTag: gamer.gamerTag || "",
        birthday: gamer.birthday || "",
        gender: gamer.gender || "",
        skillLevel: gamer.skillLevel || "",
        tshirtSize: gamer.tshirtSize || "",
        preferredGames: (gamer.preferredGames || []).join(", "),
        schedulePreference: gamer.schedulePreference || "",
      }).slice(0, 500);
    });

    // Split additional_info across multiple metadata keys if >500 chars
    const info = (additionalInfo || "").slice(0, 1500);
    if (info) {
      const chunks = info.match(/.{1,500}/g) || [];
      chunks.forEach((chunk: string, i: number) => {
        metadata[i === 0 ? "additional_info" : `additional_info_${i + 1}`] =
          chunk;
      });
    }

    // ── Create Payment Intent ──────────────────────────────────────
    const gamerNames = gamers.map((g: any) => `${g.firstName} ${g.lastName}`).join(", ");
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // cents
      currency: "usd",
      metadata,
      receipt_email: parent.email,
      description: `EKUZO100 — ${gamerNames} — ${cohort.label}`,
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err: any) {
    console.error("Error creating EKUZO100 payment intent:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create payment intent." },
      { status: 500 }
    );
  }
}
