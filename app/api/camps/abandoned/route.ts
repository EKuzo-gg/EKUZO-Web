import { NextRequest, NextResponse } from "next/server";

const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY!;
const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID!;

const CART_ABANDONED_TAG = "cart_abandoned_camps";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/camps/abandoned
 * Fires from the camps register page AFTER `/api/camps/register` returns a
 * Stripe Payment Intent and BEFORE the parent enters their card. By that
 * point we have email + parent names + first gamer's first name + first
 * gamer's selected week/slot — enough to populate a useful Beehiiv profile.
 *
 * If the parent then completes payment, the Stripe webhook adds
 * `camp-2026-purchased` (Beehiiv's public API doesn't expose tag
 * removal, so cart_abandoned_camps stays on the profile — see the
 * comment block in /api/webhooks/stripe). Cart-abandonment automations
 * must exclude subscribers tagged camp-2026-purchased so paid customers
 * don't get recovery emails. If they don't pay, the tag stays and
 * nurture can re-engage them with their selected week/slot in mind.
 *
 * Idempotent on email (Beehiiv `reactivate_existing: true`). Wrapped in
 * try/catch end-to-end — never returns a 5xx that could block the
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

    // Optional fields — every value is bounded so a malformed client
    // payload can't smuggle a giant string into Beehiiv.
    const parentFirstName = String(body?.parent_first_name || "").slice(0, 200);
    const parentLastName = String(body?.parent_last_name || "").slice(0, 200);
    const gamerFirstName = String(body?.gamer_first_name || "").slice(0, 200);
    const week = body?.week != null ? String(body.week).slice(0, 10) : "";
    const slotRaw = String(body?.slot || "").toUpperCase();
    const slot = slotRaw === "AM" || slotRaw === "PM" ? slotRaw : "";

    const customFields: { name: string; value: string }[] = [];
    if (parentFirstName) customFields.push({ name: "first_name", value: parentFirstName });
    if (parentLastName) customFields.push({ name: "last_name", value: parentLastName });
    if (gamerFirstName) customFields.push({ name: "gamer_name", value: gamerFirstName });
    if (week) customFields.push({ name: "camp_week", value: week });
    if (slot) customFields.push({ name: "camp_slot", value: slot });

    // 1. Subscribe (or reactivate). reactivate_existing makes this safe to
    //    re-fire across submits with the same email.
    let subscriberId = "";
    try {
      const subPayload: Record<string, unknown> = {
        email,
        reactivate_existing: true,
        send_welcome_email: false,
        referring_site: "ekuzo-camps-cart-abandoned",
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
        console.error("Beehiiv abandoned subscribe failed:", subRes.status, errText);
        return NextResponse.json({ ok: true, warning: "subscribe_failed" });
      }
      const subData = await subRes.json();
      subscriberId = subData?.data?.id || "";
    } catch (err) {
      console.error(
        "Beehiiv abandoned subscribe error:",
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
          console.error("Beehiiv abandoned tag failed:", tagRes.status, errText);
        }
      } catch (err) {
        console.error(
          "Beehiiv abandoned tag error:",
          err instanceof Error ? err.message : err
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(
      "Camps abandoned route error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ ok: true, warning: "unexpected_error" });
  }
}
