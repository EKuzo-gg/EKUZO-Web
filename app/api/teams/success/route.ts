import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

/**
 * GET /api/teams/success?payment_intent=pi_xxx
 *
 * Fetches the Payment Intent details so the success page can display a
 * booking summary (parent + gamers + semester + payment plan + total)
 * and surface the "Bring your crew" squad share link.
 *
 * Mirrors /api/{camps,ekuzo100}/success — only the cohort shape and the
 * squad-link path differ. Teams' cohort shape is single-value (Fall 2026
 * semester); the squad link points at /programs/ekuzo-teams/register.
 *
 * Phase 5d (Teams convergence Seam 4 success-page squad panel). Phase 3's
 * server-side `squad_token` fallback guarantees every non-joiner teams
 * PI has a working token in metadata, so this endpoint returns a populated
 * squadLink for every successful teams payment.
 */
export async function GET(req: NextRequest) {
  const paymentIntentId = req.nextUrl.searchParams.get("payment_intent");

  if (!paymentIntentId) {
    return NextResponse.json(
      { error: "Missing payment_intent parameter." },
      { status: 400 }
    );
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: "Payment has not succeeded." },
        { status: 400 }
      );
    }

    const meta = paymentIntent.metadata;
    const gamerCount = parseInt(meta.gamer_count || "0", 10);
    const gamers: { name: string }[] = [];

    for (let i = 0; i < gamerCount; i++) {
      try {
        const gamerData = JSON.parse(meta[`gamer_${i}`] || "{}");
        gamers.push({
          name: `${gamerData.firstName || ""} ${gamerData.lastName || ""}`.trim(),
        });
      } catch {
        // Skip malformed gamer data — webhook still has the canonical row.
      }
    }

    // Squad-share link — every teams purchase mints a working link via
    // Phase 3's server-side helper fallback (the new register page also
    // mints client-side; both paths produce a valid token). Joiners
    // share the inherited token via joining_squad_token. Builder matches
    // the Stripe webhook's Klaviyo squad_link field exactly.
    const squadToken = meta.squad_token || meta.joining_squad_token || "";
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://ekuzo.gg").replace(/\/$/, "");
    const squadLink = squadToken
      ? `${siteUrl}/programs/ekuzo-teams/register?squad=${squadToken}`
      : "";

    return NextResponse.json({
      parentName: `${meta.parent_first_name || ""} ${meta.parent_last_name || ""}`.trim(),
      parentEmail: meta.parent_email || "",
      gamers,
      semesterLabel: meta.semester_label || "Fall 2026",
      paymentPlan: meta.payment_plan || "upfront",
      totalPaid: `$${(paymentIntent.amount / 100).toFixed(2)}`,
      paymentIntentId: paymentIntent.id,
      squadToken,
      squadLink,
    });
  } catch (err) {
    console.error("Error fetching teams payment intent:", err);
    return NextResponse.json(
      { error: "Failed to retrieve payment details." },
      { status: 500 }
    );
  }
}
