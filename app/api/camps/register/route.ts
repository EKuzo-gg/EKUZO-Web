import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

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
    const { parent, gamers, additionalInfo, totalPrice, timezone, squadStatus } = body;

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

    const metadata: Record<string, string> = {
      product: "camps",
      parent_first_name: parent.firstName,
      parent_last_name: parent.lastName,
      parent_email: parent.email,
      parent_phone: parent.phone || "",
      gamer_count: String(gamers.length),
      timezone: timezone || "",
      squad_status: squadStatusSafe,
    };

    // Split additional_info across multiple metadata keys if >500 chars
    // Stripe metadata values max 500 chars each, max 50 keys total
    const info = (additionalInfo || "").slice(0, 1500); // cap at 1500 total
    if (info) {
      const chunks = info.match(/.{1,500}/g) || [];
      chunks.forEach((chunk: string, i: number) => {
        metadata[i === 0 ? "additional_info" : `additional_info_${i + 1}`] = chunk;
      });
    }

    gamers.forEach((gamer: any, i: number) => {
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
  } catch (err: any) {
    console.error("Error creating payment intent:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create payment intent." },
      { status: 500 }
    );
  }
}
