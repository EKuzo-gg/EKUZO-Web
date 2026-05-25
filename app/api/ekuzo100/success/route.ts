import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

/**
 * GET /api/ekuzo100/success?payment_intent=pi_xxx
 *
 * Fetches the Payment Intent details so the success page can display a
 * booking summary (parent + gamers + cohort + total) and surface the
 * "Bring your friends" squad share link.
 *
 * Mirrors /api/camps/success — only the cohort shape and the squad link
 * path differ (e100 uses cohort_label as the schedule string; squad
 * link points at /programs/ekuzo100/register).
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
    const gamers = [];

    for (let i = 0; i < gamerCount; i++) {
      try {
        const gamerData = JSON.parse(meta[`gamer_${i}`] || "{}");
        gamers.push({
          name: `${gamerData.firstName || ""} ${gamerData.lastName || ""}`.trim(),
        });
      } catch {
        // Skip malformed gamer data
      }
    }

    // Squad-share link — every e100 purchase mints a working link
    // (universal-token rule lifted from camps 2026-05-22). Solo buyer
    // shares the squad_token they minted at register time; a joiner
    // shares the same crew link via joining_squad_token. Same builder
    // the Stripe webhook uses for the Klaviyo squad_link field, so the
    // success-page link matches the link in the confirmation email.
    const squadToken = meta.squad_token || meta.joining_squad_token || "";
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://ekuzo.gg").replace(/\/$/, "");
    const squadLink = squadToken
      ? `${siteUrl}/programs/ekuzo100/register?squad=${squadToken}`
      : "";

    return NextResponse.json({
      parentName: `${meta.parent_first_name || ""} ${meta.parent_last_name || ""}`.trim(),
      parentEmail: meta.parent_email || "",
      gamers,
      cohortLabel: meta.cohort_label || "",
      totalPaid: `$${(paymentIntent.amount / 100).toFixed(2)}`,
      paymentIntentId: paymentIntent.id,
      squadToken,
      squadLink,
    });
  } catch (err: any) {
    console.error("Error fetching e100 payment intent:", err);
    return NextResponse.json(
      { error: "Failed to retrieve payment details." },
      { status: 500 }
    );
  }
}
