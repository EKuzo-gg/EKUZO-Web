"use client";

import { loadStripe, type Stripe } from "@stripe/stripe-js";

// Shared `stripePromise` for every register page. `loadStripe` is called
// once at module scope so a single Stripe.js instance is reused across
// camps + e100 + teams (avoids reloading the Stripe.js script per page).
export const stripePromise: Promise<Stripe | null> = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);
