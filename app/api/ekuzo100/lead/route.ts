import { NextRequest, NextResponse } from "next/server";
import { trackKlaviyoEvent } from "@/lib/klaviyo";
import { PRODUCTS } from "@/lib/products";

const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY!;
const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID!;

// Sourced from lib/products registry (Phase 1).
const FORM_STARTED_TAG = PRODUCTS.ekuzo100.beehiiv.tags.formStarted;
const REFERRING_SITE = PRODUCTS.ekuzo100.beehiiv.referringSites.formStarted;

// Loose RFC-5322-ish check. The Beehiiv API does its own validation; this
// is just a cheap pre-flight so we don't make an API call for "x".
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/ekuzo100/lead
 * Companion to /api/ekuzo100/register: captures the email AS SOON as a
 * parent finishes typing it on the EKUZO100 register page (onBlur), so
 * parents who start the form but never reach "Continue to Payment" still
 * land in Beehiiv with `form_started_ekuzo100` for nurture.
 *
 * Mirrors /api/camps/lead exactly — only the tag, the product extra, and
 * the referring_site differ. Idempotent on email; soft-fails on every
 * Beehiiv error so the form never blocks on lead capture.
 *
 * No welcome email and no automation enrollment here — those belong only
 * to PAID customers. On purchase the webhook adds `ekuzo100-purchased`
 * (Beehiiv has no tag-removal API — see the comment block in
 * /api/webhooks/stripe). Cart-abandonment automations should exclude
 * subscribers tagged `ekuzo100-purchased` so paid customers don't get
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
    //    can run from Klaviyo too, alongside Beehiiv. Single shared
    //    "Started Registration" metric (NOT program-prefixed) — the e100
    //    flow filters on event.extra.product == "ekuzo100" per the
    //    "same workflow" contract.
    await trackKlaviyoEvent({
      metricName: "Started Registration",
      email,
      properties: { product: "ekuzo100" },
    });

    // 1. Subscribe (or reactivate) the lead.
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
        console.error("Beehiiv ekuzo100 lead subscribe failed:", subRes.status, errText);
        return NextResponse.json({ ok: true, warning: "subscribe_failed" });
      }
      const subData = await subRes.json();
      subscriberId = subData?.data?.id || "";
    } catch (err) {
      console.error(
        "Beehiiv ekuzo100 lead subscribe error:",
        err instanceof Error ? err.message : err
      );
      return NextResponse.json({ ok: true, warning: "subscribe_error" });
    }

    // 2. Tag the subscriber. Beehiiv create endpoint silently ignores
    //    `tags`, so a separate POST is required (per CLAUDE.md API quirks).
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
          console.error("Beehiiv ekuzo100 lead tag failed:", tagRes.status, errText);
        }
      } catch (err) {
        console.error(
          "Beehiiv ekuzo100 lead tag error:",
          err instanceof Error ? err.message : err
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(
      "Ekuzo100 lead route error:",
      err instanceof Error ? err.message : err
    );
    // Even on unexpected error, return ok:true so the form never blocks.
    return NextResponse.json({ ok: true, warning: "unexpected_error" });
  }
}
