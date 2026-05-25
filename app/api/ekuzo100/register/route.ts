import { NextRequest, NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/products";
import { createRegistrationPaymentIntent } from "@/lib/registerIntent";

/**
 * Shape of each gamer as posted by the EKUZO100 register form.
 * Distinct from the metadata-reconstructed shape in the webhook —
 * `preferredGames` is an array here, joined to a string before being
 * written into Stripe metadata.
 */
type ClientGamer = {
  firstName?: string;
  lastName?: string;
  gamerTag?: string;
  birthday?: string;
  gender?: string;
  skillLevel?: string;
  tshirtSize?: string;
  preferredGames?: string[];
};

/**
 * POST /api/ekuzo100/register
 *
 * Thin wrapper around the shared register helper (Phase 3 — Seam 3 of
 * the teams convergence, see marketing/teams-redesign/05-phase3-register-api.md).
 * Validates e100-specific fields (`cohort.value`, server-authoritative
 * `totalPrice === 100 * N`) then delegates everything shared (parent
 * validation, attribution, squad-token handling, per-gamer JSON,
 * additional_info chunking, PI create) to the helper.
 *
 * schedulePreference retired 2026-05-24 — only one session time runs
 * today (7-8:30 PM); preferred_days (family-level) captures the demand
 * signal instead.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { gamers, cohort, preferredDays, totalPrice } = body;

  if (!gamers?.length) {
    return NextResponse.json(
      { error: "At least one gamer is required." },
      { status: 400 }
    );
  }

  if (!cohort?.value) {
    return NextResponse.json(
      { error: "Please select a cohort month." },
      { status: 400 }
    );
  }

  const expectedPrice = 100 * gamers.length;
  if (!totalPrice || totalPrice !== expectedPrice) {
    return NextResponse.json(
      { error: "Invalid total price." },
      { status: 400 }
    );
  }

  const gamerNames = (gamers as ClientGamer[])
    .map((g) => `${g.firstName} ${g.lastName}`)
    .join(", ");

  const result = await createRegistrationPaymentIntent<ClientGamer>({
    request: req,
    body,
    productConfig: PRODUCTS.ekuzo100,
    gamers: gamers as ClientGamer[],
    productMetadata: {
      cohort_month: cohort.value || "",
      cohort_label: cohort.label || "",
      cohort_start: cohort.startDate || "",
      cohort_end: cohort.endDate || "",
      // Family-level day-availability signal from the "Prefer other
      // days?" disclosure. Comma-separated short labels. Internal-only —
      // threads to Sheets + Klaviyo profile, NOT surfaced in the
      // confirmation email (echoing "your preferred days" next to
      // "you're booked Tue/Thu" would re-open the exact expectation
      // mismatch the picker design routed around).
      preferred_days: Array.isArray(preferredDays)
        ? preferredDays.join(", ").slice(0, 200)
        : "",
    },
    buildGamerMetadataShape: (gamer) => ({
      firstName: gamer.firstName,
      lastName: gamer.lastName,
      gamerTag: gamer.gamerTag || "",
      birthday: gamer.birthday || "",
      gender: gamer.gender || "",
      skillLevel: gamer.skillLevel || "",
      tshirtSize: gamer.tshirtSize || "",
      preferredGames: (gamer.preferredGames || []).join(", "),
    }),
    amount: Math.round(totalPrice * 100),
    description: `EKUZO100 — ${gamerNames} — ${cohort.label}`,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    clientSecret: result.clientSecret,
    paymentIntentId: result.paymentIntentId,
  });
}
