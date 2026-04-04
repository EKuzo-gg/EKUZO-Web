import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

/**
 * POST /api/teams/register
 *
 * Receives the EKUZOTeams registration payload (parent info, gamers array,
 * payment plan selection), creates a Stripe Payment Intent, and returns
 * the client_secret for Stripe Elements on the frontend.
 *
 * Two payment plans:
 *   - "upfront": $576 one-time Payment Intent (10% off $640)
 *   - "installment": $160 Payment Intent now + card saved to Customer.
 *     The Stripe webhook creates a Subscription (trial until Oct 1, then
 *     3 × $160/mo auto-charges Oct/Nov/Dec, cancel Jan 1).
 *
 * Semester: Fall 2026, beginning week of Aug 31.
 */

const UPFRONT_PRICE = 576; // 10% off $640
const INSTALLMENT_FIRST_PAYMENT = 160;
const INSTALLMENT_TOTAL = 640;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { parent, gamers, paymentPlan, additionalInfo, timezone } = body;

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

    if (!paymentPlan || !["upfront", "installment"].includes(paymentPlan)) {
      return NextResponse.json(
        { error: "Please select a payment plan." },
        { status: 400 }
      );
    }

    const chargeNow =
      paymentPlan === "upfront"
        ? UPFRONT_PRICE * gamers.length
        : INSTALLMENT_FIRST_PAYMENT * gamers.length;

    // ── Build metadata ──────────────────────────────────────────────
    const metadata: Record<string, string> = {
      product: "teams",
      payment_plan: paymentPlan,
      semester: "fall-2026",
      semester_label: "Fall 2026 — Week of Aug 31",
      parent_first_name: parent.firstName,
      parent_last_name: parent.lastName,
      parent_email: parent.email,
      parent_phone: parent.phone || "",
      gamer_count: String(gamers.length),
      timezone: timezone || "",
      charge_now: String(chargeNow),
      total_per_gamer:
        paymentPlan === "upfront"
          ? String(UPFRONT_PRICE)
          : String(INSTALLMENT_TOTAL),
    };

    // Split additional_info across metadata keys (500 char limit each)
    const info = (additionalInfo || "").slice(0, 1500);
    if (info) {
      const chunks = info.match(/.{1,500}/g) || [];
      chunks.forEach((chunk: string, i: number) => {
        metadata[i === 0 ? "additional_info" : `additional_info_${i + 1}`] =
          chunk;
      });
    }

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
        timePreference: gamer.timePreference || "",
        firstSemester: gamer.firstSemester || "",
        preferredGames: (gamer.preferredGames || []).join(", "),
      }).slice(0, 500);
    });

    // ── Create Stripe Customer (needed for installments to save card,
    //    created for upfront too for consistency) ────────────────────
    const customer = await stripe.customers.create({
      email: parent.email,
      name: `${parent.firstName} ${parent.lastName}`,
      phone: parent.phone || undefined,
      metadata: {
        product: "teams",
        payment_plan: paymentPlan,
      },
    });

    metadata.stripe_customer_id = customer.id;

    // ── Create Payment Intent ──────────────────────────────────────
    const piParams: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(chargeNow * 100), // cents
      currency: "usd",
      customer: customer.id,
      metadata,
      receipt_email: parent.email,
      description:
        paymentPlan === "upfront"
          ? `EKUZOTeams Fall 2026 — ${gamers.length} gamer${gamers.length > 1 ? "s" : ""} (paid in full)`
          : `EKUZOTeams Fall 2026 — ${gamers.length} gamer${gamers.length > 1 ? "s" : ""} (1st of 4 payments)`,
      automatic_payment_methods: { enabled: true },
    };

    // For installments, save the card for future charges
    if (paymentPlan === "installment") {
      piParams.setup_future_usage = "off_session";
    }

    const paymentIntent = await stripe.paymentIntents.create(piParams);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      chargeNow,
      paymentPlan,
    });
  } catch (err: any) {
    console.error("Error creating Teams payment intent:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create payment intent." },
      { status: 500 }
    );
  }
}
