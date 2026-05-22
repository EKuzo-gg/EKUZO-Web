import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

/**
 * GET /api/camps/success?payment_intent=pi_xxx
 *
 * Fetches the Payment Intent details so the success page can
 * display a booking summary with gamer names, weeks, slots, and total.
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
          weekLabel: gamerData.weekLabel || "",
          weekDates: gamerData.weekDates || "",
          slot: gamerData.slot || "",
          slotHours: gamerData.slotHours || "",
          price: gamerData.price || 0,
        });
      } catch {
        // Skip malformed gamer data
      }
    }

    // Squad-share link — "build your squad" is universal: every camps
    // purchase gets a shareable link. A normal buyer shares the
    // squad_token they minted at register time; a joiner (registered via
    // someone else's ?squad=TOKEN, so no squad_token of their own) shares
    // that same crew link via joining_squad_token, keeping the squad one
    // group. Either way the success page surfaces a working link.
    //
    // Host comes from NEXT_PUBLIC_SITE_URL (with ekuzo.gg fallback) so
    // dev / branch previews share their own link host. Same builder the
    // Stripe webhook uses for the Klaviyo squad_link field, so the link
    // on the success page matches the link in the confirmation email.
    const squadToken = meta.squad_token || meta.joining_squad_token || "";
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://ekuzo.gg").replace(/\/$/, "");
    const squadLink = squadToken
      ? `${siteUrl}/programs/ekuzo-camps/register?squad=${squadToken}`
      : "";

    return NextResponse.json({
      parentName: `${meta.parent_first_name || ""} ${meta.parent_last_name || ""}`.trim(),
      parentEmail: meta.parent_email || "",
      gamers,
      totalPaid: `$${(paymentIntent.amount / 100).toFixed(2)}`,
      paymentIntentId: paymentIntent.id,
      squadToken,
      squadLink,
    });
  } catch (err: any) {
    console.error("Error fetching payment intent:", err);
    return NextResponse.json(
      { error: "Failed to retrieve payment details." },
      { status: 500 }
    );
  }
}
