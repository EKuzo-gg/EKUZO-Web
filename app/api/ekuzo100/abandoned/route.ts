import { NextRequest, NextResponse } from "next/server";
import { trackKlaviyoEvent } from "@/lib/klaviyo";

const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY!;
const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID!;

const CART_ABANDONED_TAG = "cart_abandoned_ekuzo100";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/ekuzo100/abandoned
 * Fires from the EKUZO100 register page AFTER `/api/ekuzo100/register`
 * returns a Stripe Payment Intent and BEFORE the parent enters their
 * card. By that point we have email + parent names + first gamer's first
 * name + selected cohort_label — enough for a useful Beehiiv profile.
 *
 * Mirrors /api/camps/abandoned exactly — differences are the tag name,
 * the product extra in Klaviyo, the referring_site, and the captured
 * fields (cohort_label instead of week + slot).
 *
 * If the parent then completes payment, the Stripe webhook adds
 * `ekuzo100-purchased` (Beehiiv's public API doesn't expose tag
 * removal). Cart-abandonment automations must exclude subscribers
 * tagged `ekuzo100-purchased` so paid customers don't get recovery
 * emails. If they don't pay, the tag stays and nurture can re-engage
 * them with their selected cohort in mind.
 *
 * Idempotent on email (Beehiiv `reactivate_existing: true`). Wrapped
 * in try/catch end-to-end — never returns a 5xx that could block the
 * payment flow upstream. Caller treats this as fire-and-forget.
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
    const cohortLabel = String(body?.cohort_label || "").slice(0, 200);

    const customFields: { name: string; value: string }[] = [];
    if (parentFirstName) customFields.push({ name: "first_name", value: parentFirstName });
    if (parentLastName) customFields.push({ name: "last_name", value: parentLastName });
    if (gamerFirstName) customFields.push({ name: "gamer_name", value: gamerFirstName });
    if (cohortLabel) customFields.push({ name: "cohort_label", value: cohortLabel });

    // 0. Klaviyo — mirror the abandonment into Klaviyo so cart-recovery
    //    nurture can run from Klaviyo too, alongside Beehiiv. Single
    //    shared "Started Checkout" metric (NOT program-prefixed) — the
    //    e100 recovery flow filters on event.extra.product == "ekuzo100"
    //    per the "same workflow" contract. A recovery flow should also
    //    add a filter excluding profiles who later "Placed Order".
    await trackKlaviyoEvent({
      metricName: "Started Checkout",
      email,
      firstName: parentFirstName || undefined,
      lastName: parentLastName || undefined,
      properties: {
        product: "ekuzo100",
        ...(gamerFirstName ? { gamer_name: gamerFirstName } : {}),
        ...(cohortLabel ? { cohort_label: cohortLabel } : {}),
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
        referring_site: "ekuzo100-cart-abandoned",
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
        console.error("Beehiiv ekuzo100 abandoned subscribe failed:", subRes.status, errText);
        return NextResponse.json({ ok: true, warning: "subscribe_failed" });
      }
      const subData = await subRes.json();
      subscriberId = subData?.data?.id || "";
    } catch (err) {
      console.error(
        "Beehiiv ekuzo100 abandoned subscribe error:",
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
          console.error("Beehiiv ekuzo100 abandoned tag failed:", tagRes.status, errText);
        }
      } catch (err) {
        console.error(
          "Beehiiv ekuzo100 abandoned tag error:",
          err instanceof Error ? err.message : err
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(
      "Ekuzo100 abandoned route error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ ok: true, warning: "unexpected_error" });
  }
}
