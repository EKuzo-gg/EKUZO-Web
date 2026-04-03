import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

/**
 * POST /api/ekuzo100/register
 *
 * Receives the EKUZO100 registration payload (parent info, single gamer,
 * cohort selection, schedule preference), creates a Stripe Payment Intent
 * with all registration data as metadata, and returns the client_secret
 * for Stripe Elements on the frontend.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { parent, gamer, cohort, additionalInfo, totalPrice, timezone } =
      body;

    // ── Validate ────────────────────────────────────────────────────
    if (!parent?.email || !parent?.firstName || !parent?.lastName) {
      return NextResponse.json(
        { error: "Parent name and email are required." },
        { status: 400 }
      );
    }

    if (!gamer?.firstName || !gamer?.lastName) {
      return NextResponse.json(
        { error: "Gamer name is required." },
        { status: 400 }
      );
    }

    if (!cohort?.value) {
      return NextResponse.json(
        { error: "Please select a cohort month." },
        { status: 400 }
      );
    }

    if (!totalPrice || totalPrice !== 100) {
      return NextResponse.json(
        { error: "Invalid total price." },
        { status: 400 }
      );
    }

    // ── Build metadata ──────────────────────────────────────────────
    // Stripe metadata values must be strings ≤500 chars.
    const metadata: Record<string, string> = {
      product: "ekuzo100",
      parent_first_name: parent.firstName,
      parent_last_name: parent.lastName,
      parent_email: parent.email,
      parent_phone: parent.phone || "",
      gamer_count: "1",
      timezone: timezone || "",
      cohort_month: cohort.value || "",
      cohort_label: cohort.label || "",
      cohort_start: cohort.startDate || "",
      cohort_end: cohort.endDate || "",
    };

    // Single gamer — stored as gamer_0 for webhook compatibility
    metadata.gamer_0 = JSON.stringify({
      firstName: gamer.firstName,
      lastName: gamer.lastName,
      gamerTag: gamer.gamerTag || "",
      birthday: gamer.birthday || "",
      gender: gamer.gender || "",
      skillLevel: gamer.skillLevel || "",
      preferredGames: (gamer.preferredGames || []).join(", "),
      schedulePreference: gamer.schedulePreference || "",
    }).slice(0, 500);

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
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // cents
      currency: "usd",
      metadata,
      receipt_email: parent.email,
      description: `EKUZO100 — ${gamer.firstName} ${gamer.lastName} — ${cohort.label}`,
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
