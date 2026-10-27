import Stripe from "stripe";
import type { S1Mode } from "./mode";

/**
 * Server Stripe client for Season 01. Lazy so importing this module never
 * needs the key (unit tests, build). One network retry, 8 s timeout.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  _stripe = new Stripe(key, { apiVersion: "2026-02-25.clover", maxNetworkRetries: 1, timeout: 8000 });
  return _stripe;
}

/** True when the configured secret key is a live key. */
export function keyIsLive(key: string | undefined = process.env.STRIPE_SECRET_KEY): boolean {
  return (key ?? "").startsWith("sk_live_");
}

/**
 * Throws unless the key prefix agrees with the mode: live needs sk_live_,
 * test needs sk_test_, off never creates anything.
 */
export function assertKeyMatchesMode(mode: S1Mode, key: string | undefined = process.env.STRIPE_SECRET_KEY): void {
  const k = key ?? "";
  if (mode === "live" && k.startsWith("sk_live_")) return;
  if (mode === "test" && k.startsWith("sk_test_")) return;
  throw new Error(`Stripe key does not match mode ${mode}`);
}
