import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Product → Stripe Price ID mapping.
 *
 * To configure:
 *   1. Create Products in your Stripe Dashboard (or via CLI)
 *   2. Copy the Price IDs (price_xxx) into your .env.local
 *
 * EKUZO Teams installments:
 *   Stripe supports payment schedules via Subscriptions with a fixed billing
 *   cycle count. Set up a "4 × monthly" Subscription Price in Stripe and use
 *   that Price ID for STRIPE_PRICE_TEAMS_INSTALLMENTS.
 *   Pass mode: "subscription" from the client for the installment option.
 */
const PRICES: Record<string, string | undefined> = {
  teams:               process.env.STRIPE_PRICE_TEAMS,
  "teams-installments": process.env.STRIPE_PRICE_TEAMS_INSTALLMENTS,
  camps:               process.env.STRIPE_PRICE_CAMPS,
  ekuzo100:            process.env.STRIPE_PRICE_EKUZO100,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product, mode = "payment" } = body as {
      product: string;
      mode?: "payment" | "subscription";
    };

    const priceId = PRICES[product];
    if (!priceId) {
      return NextResponse.json(
        { error: `Unknown product: ${product}` },
        { status: 400 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${siteUrl}`,
      // Optional: pre-fill customer email if you collect it beforehand
      // customer_email: body.email,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
