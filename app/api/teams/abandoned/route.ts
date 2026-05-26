import { NextRequest, NextResponse } from "next/server";
import { trackKlaviyoEvent } from "@/lib/klaviyo";
import { PRODUCTS } from "@/lib/products";

const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY!;
const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID!;

// Sourced from lib/products registry (Phase 1).
const CART_ABANDONED_TAG = PRODUCTS.teams.beehiiv.tags.cartAbandoned;
const REFERRING_SITE = PRODUCTS.teams.beehiiv.referringSites.cartAbandoned;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Match the register-route allow-list so a malformed client payload can't
// smuggle an arbitrary string into the captured profile.
const PAYMENT_PLAN_VALUES = new Set(["upfront", "installment"]);

/**
 * POST /api/teams/abandoned
 * Fires from the EKUZOTeams register page AFTER `/api/teams/register`
 * returns a Stripe Payment Intent and BEFORE the parent enters their
 * card. By that point we have email + parent names + first gamer's
 * first name + selected `semester_label` + chosen `payment_plan` —
 * enough for a useful Beehiiv profile + a recovery email that can
 * reference the plan they almost picked.
 *
 * Mirrors /api/camps/abandoned and /api/ekuzo100/abandoned exactly —
 * differences are the tag name, the product extra in Klaviyo, the
 * referring_site, and the captured fields (semester_label +
 * payment_plan instead of camps' week+slot or e100's cohort_label).
 *
 * Field names (`team_semester`, `team_payment_plan`) match what
 * `lib/products/teams.ts buildBeehiivCustomFields` emits post-purchase
 * so Beehiiv stores one consistent schema across the lifecycle. See
 * `marketing/teams-redesign/06-phase4-partial-capture.md` §3.
 *
 * If the parent then completes payment, the Stripe webhook adds
 * `teams-purchased` (Beehiiv's public API doesn't expose tag removal).
 * Cart-abandonment automations must exclude subscribers tagged
 * `teams-purchased` so paid customers don't get recovery emails. If
 * they don't pay, the tag stays and nurture can re-engage them with
 * their selected semester + plan in mind.
 *
 * Idempotent on email (Beehiiv `reactivate_existing: true`). Wrapped
 * in try/catch end-to-end — never returns a 5xx that could block the
 * payment flow upstream. Caller treats this as fire-and-forget.
 *
 * Phase 4 ships the endpoint; the teams register page is wired to call
 * it in Phase 5 (handoff §4).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Invalid email." },
        { status: 400 }
      );
    }

    // Optional fields — every value bounded so a malformed client
    // payload can't smuggle a giant string into Beehiiv.
    const parentFirstName = String(body?.parent_first_name || "").slice(0, 200);
    const parentLastName = String(body?.parent_last_name || "").slice(0, 200);
    const gamerFirstName = String(body?.gamer_first_name || "").slice(0, 200);
    const semesterLabel = String(body?.semester_label || "").slice(0, 200);
    const paymentPlanRaw = String(body?.payment_plan || "");
    const paymentPlan = PAYMENT_PLAN_VALUES.has(paymentPlanRaw) ? paymentPlanRaw : "";

    const customFields: { name: string; value: string }[] = [];
    if (parentFirstName) customFields.push({ name: "first_name", value: parentFirstName });
    if (parentLastName) customFields.push({ name: "last_name", value: parentLastName });
    if (gamerFirstName) customFields.push({ name: "gamer_name", value: gamerFirstName });
    if (semesterLabel) customFields.push({ name: "team_semester", value: semesterLabel });
    if (paymentPlan) customFields.push({ name: "team_payment_plan", value: paymentPlan });

    // 0. Klaviyo — mirror the abandonment into Klaviyo so cart-recovery
    //    nurture can run from Klaviyo too, alongside Beehiiv. Single
    //    shared "Started Checkout" metric (NOT program-prefixed) — the
    //    teams recovery flow filters on event.extra.product == "teams"
    //    per the "same workflow" contract. A recovery flow should also
    //    add a filter excluding profiles who later "Placed Order".
    await trackKlaviyoEvent({
      metricName: "Started Checkout",
      email,
      firstName: parentFirstName || undefined,
      lastName: parentLastName || undefined,
      properties: {
        product: "teams",
        ...(gamerFirstName ? { gamer_name: gamerFirstName } : {}),
        ...(semesterLabel ? { team_semester: semesterLabel } : {}),
        ...(paymentPlan ? { team_payment_plan: paymentPlan } : {}),
      },
    });

    // 1. Subscribe (or reactivate). reactivate_existing makes this safe
    //    to re-fire across submits with the same email.
    let subscriberId = "";
    try {
      const subPayload: Record<string, unknown> = {
        email,
        reactivate_existing: true,
        send_welcome_email: false,
        referring_site: REFERRING_SITE,
      };
      if (customFields.length > 0) subPayload.custom_fields = customFields;

      const subRes = await fetch(
        `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${BEEHIIV_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subPayload),
        }
      );
      if (!subRes.ok) {
        const errText = await subRes.text();
        console.error("Beehiiv teams abandoned subscribe failed:", subRes.status, errText);
        return NextResponse.json({ ok: true, warning: "subscribe_failed" });
      }
      const subData = await subRes.json();
      subscriberId = subData?.data?.id || "";
    } catch (err) {
      console.error(
        "Beehiiv teams abandoned subscribe error:",
        err instanceof Error ? err.message : err
      );
      return NextResponse.json({ ok: true, warning: "subscribe_error" });
    }

    // 2. Tag the subscriber. Separate POST per CLAUDE.md API quirks.
    if (subscriberId) {
      try {
        const tagRes = await fetch(
          `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions/${subscriberId}/tags`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${BEEHIIV_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ tags: [CART_ABANDONED_TAG] }),
          }
        );
        if (!tagRes.ok) {
          const errText = await tagRes.text();
          console.error("Beehiiv teams abandoned tag failed:", tagRes.status, errText);
        }
      } catch (err) {
        console.error(
          "Beehiiv teams abandoned tag error:",
          err instanceof Error ? err.message : err
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(
      "Teams abandoned route error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ ok: true, warning: "unexpected_error" });
  }
}
