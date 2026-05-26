import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PRODUCTS } from "@/lib/products";
import { createRegistrationPaymentIntent } from "@/lib/registerIntent";

/**
 * POST /api/teams/register
 *
 * Thin wrapper around the shared register helper (Phase 3 — Seam 3 of
 * the teams convergence, see marketing/teams-redesign/05-phase3-register-api.md).
 * Teams-specific concerns that stay in this route per handoff §3 ("don't
 * force a seam that isn't cleanly shared by all three"):
 *   - paymentPlan validation + `chargeNow` derivation
 *   - Stripe Customer creation (camps + e100 don't create Customers)
 *   - `setup_future_usage: "off_session"` for installments (the saved
 *     card lets the Phase-2 webhook create a Subscription for the
 *     remaining 3 payments)
 *   - Response decoration with `{chargeNow, paymentPlan}` (the register
 *     page reads both)
 *
 * Two payment plans:
 *   - "upfront": $576 one-time PI (10% off $640)
 *   - "installment": $160 PI now + card saved on the Customer. The
 *     webhook creates a Subscription (trial until Oct 1, then 3 ×
 *     $160/mo auto-charges Oct/Nov/Dec, cancel Jan 1). That block is
 *     byte-identical to pre-Phase-3 per `02-baseline.md` §2I.
 *
 * Semester: Fall 2026, beginning week of Aug 31.
 *
 * Phase 3 also starts minting `squad_token` for teams via the helper's
 * server-side fallback (the existing rich form doesn't yet send one;
 * Phase 5's page rebuild will). The Phase 2 webhook is already wired to
 * consume the token and write the `squads` / `squad_members` rows.
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const UPFRONT_PRICE = 576; // 10% off $640
const INSTALLMENT_FIRST_PAYMENT = 160;
const INSTALLMENT_TOTAL = 640;

type ClientGamer = {
  firstName?: string;
  lastName?: string;
  gamerTag?: string;
  birthday?: string;
  gender?: string;
  skillLevel?: string;
  tshirtSize?: string;
  timePreference?: string;
  firstSemester?: string;
  preferredGames?: string[];
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { parent, gamers, paymentPlan } = body;

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

    if (!parent?.email || !parent?.firstName || !parent?.lastName) {
      // The helper would catch this too, but the Customer creation below
      // would 500 first if we let parent fall through unchecked.
      return NextResponse.json(
        { error: "Parent name and email are required." },
        { status: 400 }
      );
    }

    const chargeNow =
      paymentPlan === "upfront"
        ? UPFRONT_PRICE * gamers.length
        : INSTALLMENT_FIRST_PAYMENT * gamers.length;

    // Stripe Customer is teams-only — needed for installments to save
    // the card, created for upfront too for consistency.
    const customer = await stripe.customers.create({
      email: parent.email,
      name: `${parent.firstName} ${parent.lastName}`,
      phone: parent.phone || undefined,
      metadata: {
        product: "teams",
        payment_plan: paymentPlan,
      },
    });

    const productMetadata: Record<string, string> = {
      payment_plan: paymentPlan,
      semester: "fall-2026",
      semester_label: "Fall 2026 — Week of Aug 31",
      charge_now: String(chargeNow),
      total_per_gamer:
        paymentPlan === "upfront"
          ? String(UPFRONT_PRICE)
          : String(INSTALLMENT_TOTAL),
      stripe_customer_id: customer.id,
    };

    const description =
      paymentPlan === "upfront"
        ? `EKUZOTeams Fall 2026 — ${gamers.length} gamer${gamers.length > 1 ? "s" : ""} (paid in full)`
        : `EKUZOTeams Fall 2026 — ${gamers.length} gamer${gamers.length > 1 ? "s" : ""} (1st of 4 payments)`;

    const result = await createRegistrationPaymentIntent<ClientGamer>({
      request: req,
      body,
      productConfig: PRODUCTS.teams,
      gamers: gamers as ClientGamer[],
      productMetadata,
      buildGamerMetadataShape: (gamer) => ({
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
      }),
      amount: Math.round(chargeNow * 100),
      description,
      paymentIntentParams: {
        customer: customer.id,
        // For installments, save the card for the webhook-created
        // Subscription to charge off-session Oct/Nov/Dec.
        ...(paymentPlan === "installment"
          ? { setup_future_usage: "off_session" as const }
          : {}),
      },
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
      chargeNow,
      paymentPlan,
    });
  } catch (err) {
    console.error("Error creating Teams payment intent:", err);
    const message =
      err instanceof Error ? err.message : "Failed to create payment intent.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
