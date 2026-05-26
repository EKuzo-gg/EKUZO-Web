import { NextRequest, NextResponse } from "next/server";
import { trackKlaviyoEvent } from "@/lib/klaviyo";
import { PRODUCTS } from "@/lib/products";

const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY!;
const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID!;

// Sourced from lib/products registry (Phase 1) — single source of truth
// for camps Beehiiv tags + referring sites across lead / abandoned /
// webhook surfaces.
const FORM_STARTED_TAG = PRODUCTS.camps.beehiiv.tags.formStarted;
const REFERRING_SITE = PRODUCTS.camps.beehiiv.referringSites.formStarted;

// Loose RFC-5322-ish check. The Beehiiv API does its own validation; this
// is just a cheap pre-flight so we don't make an API call for "x".
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/camps/lead
 * Companion to /api/camps/register: this route captures the email AS SOON as a parent finishes
 * typing it on the camps register page (onBlur). It exists so that parents
 * who start the form but never reach "Continue to Payment" still land in
 * Beehiiv with a `form_started_camps` tag so nurture can re-engage them.
 *
 * Contract: idempotent on email. Wraps every Beehiiv call in try/catch so
 * a Beehiiv outage never produces a 500 to the user — capturing the email
 * is best-effort and must not block the form.
 *
 * Subscriber created with `send_welcome_email: false` and no
 * `automation_ids` — the welcome sequence belongs only to PAID customers,
 * not mid-funnel leads. On purchase the webhook adds camp-2026-purchased
 * (it does NOT remove form_started_camps — Beehiiv's public API has no
 * tag-removal endpoint, see the comment block in /api/webhooks/stripe
 * for the limitation). Cart-abandonment automations should exclude
 * subscribers with camp-2026-purchased so paid customers don't get
 * recovery emails.
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

    // 0. Klaviyo — mirror the lead into Klaviyo so form-started nurture
    //    can run from Klaviyo too, alongside Beehiiv. Fired first (and
    //    awaited but soft-failing) so a Beehiiv early-return below can't
    //    skip it — the two captures are independent. Flow trigger:
    //    metric "Started Registration", filtered on product = camps.
    await trackKlaviyoEvent({
      metricName: "Started Registration",
      email,
      properties: { product: "camps" },
    });

    // 1. Subscribe (or reactivate) the lead. Beehiiv's reactivate_existing
    //    flag makes this idempotent on email — repeat submissions of the
    //    same email return the existing subscriber instead of erroring.
    let subscriberId = "";
    try {
      const subRes = await fetch(
        `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${BEEHIIV_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            reactivate_existing: true,
            send_welcome_email: false,
            referring_site: REFERRING_SITE,
          }),
        }
      );
      if (!subRes.ok) {
        const errText = await subRes.text();
        console.error("Beehiiv lead subscribe failed:", subRes.status, errText);
        return NextResponse.json({ ok: true, warning: "subscribe_failed" });
      }
      const subData = await subRes.json();
      subscriberId = subData?.data?.id || "";
    } catch (err) {
      console.error(
        "Beehiiv lead subscribe error:",
        err instanceof Error ? err.message : err
      );
      return NextResponse.json({ ok: true, warning: "subscribe_error" });
    }

    // 2. Tag the subscriber. Beehiiv requires a separate POST to /tags
    //    because the create endpoint silently ignores `tags` (per CLAUDE.md
    //    API quirks). Soft-fail on tag-side errors so the email is still
    //    captured even if tagging breaks.
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
            body: JSON.stringify({ tags: [FORM_STARTED_TAG] }),
          }
        );
        if (!tagRes.ok) {
          const errText = await tagRes.text();
          console.error("Beehiiv lead tag failed:", tagRes.status, errText);
        }
      } catch (err) {
        console.error(
          "Beehiiv lead tag error:",
          err instanceof Error ? err.message : err
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(
      "Camps lead route error:",
      err instanceof Error ? err.message : err
    );
    // Even on unexpected error, return ok:true so the form never blocks.
    // Logs above are the source of truth for ops.
    return NextResponse.json({ ok: true, warning: "unexpected_error" });
  }
}
