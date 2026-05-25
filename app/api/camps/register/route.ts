import { NextRequest, NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/products";
import { createRegistrationPaymentIntent } from "@/lib/registerIntent";

/**
 * Shape of each gamer as posted by the camps register form. Kept local
 * to this route because it's the client-form shape (has `selectedSlot`,
 * `preferredGames` as array) — distinct from the metadata-reconstructed
 * shape in the Stripe webhook. All fields optional: we defensively
 * coerce in the body.
 */
type ClientGamer = {
  firstName?: string;
  lastName?: string;
  gamerTag?: string;
  weekLabel?: string;
  weekDates?: string;
  selectedSlot?: string;
  slotHours?: string;
  price?: number;
  birthday?: string;
  gender?: string;
  skillLevel?: string;
  tshirtSize?: string;
  preferredGames?: string[];
};

/**
 * POST /api/camps/register
 *
 * Thin wrapper around the shared register helper (Phase 3 — Seam 3 of
 * the teams convergence, see marketing/teams-redesign/05-phase3-register-api.md).
 * Validates camps-specific fields (`totalPrice`, `squadStatus`) then
 * delegates parent/gamer validation, attribution + squad-token handling,
 * per-gamer JSON shaping, and the PI create to the helper.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { gamers, totalPrice, squadStatus } = body;

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

  // squad_status: "building" | "looking" (family-level vibe check).
  // Coerced to a safe string; unknown/missing values become "".
  const squadStatusSafe =
    squadStatus === "building" || squadStatus === "looking" ? squadStatus : "";

  const result = await createRegistrationPaymentIntent<ClientGamer>({
    request: req,
    body,
    productConfig: PRODUCTS.camps,
    gamers: gamers as ClientGamer[],
    productMetadata: {
      squad_status: squadStatusSafe,
    },
    buildGamerMetadataShape: (gamer) => ({
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
    }),
    amount: Math.round(totalPrice * 100),
    description: `EKUZO Camp — ${gamers.length} gamer${gamers.length > 1 ? "s" : ""}`,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    clientSecret: result.clientSecret,
    paymentIntentId: result.paymentIntentId,
  });
}
