import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { sendCapiEvent, sha256 } from "@/lib/metaCapi";

/**
 * POST /api/season-one
 *
 * Season 01 waitlist capture — the site popup (components/ui/SeasonOnePopup)
 * and the parent-ad landing pages (public/roadshow/landing.html) both post here.
 *
 * Mirrors /api/campaign/lead:
 *  1. POST /api/events — "Season 01 Waitlist". Upserts the profile with where
 *     they signed up and which ad sent them, so Karlin's first email and any
 *     reporting can read it.
 *  2. POST /api/profile-subscription-bulk-create-jobs — marketing consent +
 *     joins the "Season 01 Waitlist" list (XGTv2F, created 2026-10-09).
 *     Joining that list is the trigger for the welcome flow.
 *  3. Meta Conversions API "Lead" (main sign-up only, never the games/age
 *     steps), sent once the Klaviyo event has succeeded. It shares `eventId`
 *     with the browser fbq Lead so Meta dedupes the pair; the server makes one
 *     up if the page didn't send it. Best-effort: a Meta failure is logged and
 *     never fails the sign-up. See docs/season-one-tracking.md.
 *
 * A second call with { step: "age", kidAge } after sign-up records the
 * kid's age band as a profile property (no new subscription).
 *
 * Honeypot: a non-empty `company` on the main sign-up gets a silent 200 with no
 * Klaviyo write and no Meta Lead.
 *
 * Fails loudly if Klaviyo is unreachable: the email is the whole point, so the
 * parent is asked to retry rather than shown a false "you're in".
 */

const KLAVIYO_API_KEY = process.env.KLAVIYO_PRIVATE_API_KEY;
const KLAVIYO_REVISION = "2025-07-15";
const LIST_ID = process.env.KLAVIYO_SEASON1_LIST_ID || "XGTv2F";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SOURCES = new Set(["site-popup", "ad-landing"]);
const clean = (v: unknown, max = 120) => String(v ?? "").trim().slice(0, max);
const FAIL = "We couldn’t save that. Please try again.";

/**
 * Server-side Meta Lead for a main sign-up. Parent email only (hashed);
 * nothing about the child is ever sent to Meta. ip, ua, fbp and fbc go
 * plaintext, as Meta expects. Never throws (sendCapiEvent logs failures).
 */
async function sendMetaLead(req: NextRequest, body: Record<string, unknown>, email: string, contentName: string) {
  try {
    const eventSourceUrl = clean(body.eventSourceUrl, 1000);
    const userData: Record<string, string | string[]> = { em: [sha256(email)] };
    const ip =
      clean(req.headers.get("x-nf-client-connection-ip"), 100) ||
      clean((req.headers.get("x-forwarded-for") || "").split(",")[0], 100);
    if (ip) userData.client_ip_address = ip;
    const ua = clean(req.headers.get("user-agent"), 400);
    if (ua) userData.client_user_agent = ua;
    const fbp = clean(req.cookies.get("_fbp")?.value, 500);
    if (fbp) userData.fbp = fbp;
    // The pixel sets _fbc when the visitor lands with ?fbclid=. If the cookie
    // is missing (blocked, or the pixel hadn't loaded yet), rebuild it from
    // the landing URL in Meta's fb.1.<ms>.<fbclid> format.
    let fbc = clean(req.cookies.get("_fbc")?.value, 500);
    if (!fbc && eventSourceUrl) {
      try {
        const fbclid = new URL(eventSourceUrl).searchParams.get("fbclid");
        if (fbclid) fbc = `fb.1.${Date.now()}.${fbclid}`;
      } catch {
        // not a URL; skip
      }
    }
    if (fbc) userData.fbc = fbc;

    await sendCapiEvent({
      event_name: "Lead",
      event_time: Math.floor(Date.now() / 1000),
      event_id: clean(body.eventId, 100) || randomUUID(),
      action_source: "website",
      ...(eventSourceUrl ? { event_source_url: eventSourceUrl } : {}),
      user_data: userData,
      custom_data: { content_name: contentName },
    });
  } catch (err) {
    console.error("Meta CAPI Lead error:", err instanceof Error ? err.message : err);
  }
}

async function klaviyo(path: string, body: unknown) {
  return fetch(`https://a.klaviyo.com/api/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
      "Content-Type": "application/json",
      accept: "application/json",
      revision: KLAVIYO_REVISION,
    },
    body: JSON.stringify(body),
  });
}

function event(metric: string, email: string, profileProps: Record<string, string>, eventProps: Record<string, string>, firstName = "") {
  return klaviyo("events", {
    data: {
      type: "event",
      attributes: {
        metric: { data: { type: "metric", attributes: { name: metric } } },
        profile: {
          data: {
            type: "profile",
            attributes: { email, ...(firstName ? { first_name: firstName } : {}), properties: profileProps },
          },
        },
        properties: eventProps,
        time: new Date().toISOString(),
        unique_id: `${email}-${metric}-${Date.now()}`,
      },
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = clean(body.email, 254).toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "That email doesn’t look right." }, { status: 400 });
  }
  if (!KLAVIYO_API_KEY) {
    console.error("KLAVIYO_PRIVATE_API_KEY not set — Season 01 sign-up lost:", email);
    return NextResponse.json({ ok: false, error: FAIL }, { status: 500 });
  }

  try {
    // Follow-up: games they play (multi-select, comma-separated)
    if (body.step === "games") {
      const kidGames = clean(body.kidGames, 200);
      if (!kidGames) return NextResponse.json({ ok: false, error: "Pick a game." }, { status: 400 });
      const r = await event("Season 01 Waitlist Games", email, { kid_games: kidGames }, { kid_games: kidGames });
      if (!r.ok) console.error("Klaviyo games event failed:", r.status, await r.text());
      return NextResponse.json({ ok: r.ok });
    }

    // Follow-up: kid's age band
    if (body.step === "age") {
      const kidAge = clean(body.kidAge, 20);
      if (!kidAge) return NextResponse.json({ ok: false, error: "Pick an age." }, { status: 400 });
      const r = await event("Season 01 Waitlist Age", email, { season1_kid_age: kidAge }, { kid_age: kidAge });
      if (!r.ok) console.error("Klaviyo age event failed:", r.status, await r.text());
      return NextResponse.json({ ok: r.ok });
    }

    // Honeypot: the hidden `company` field is only ever filled by bots. Look
    // like a success so they move on, but write nothing and send no Lead.
    if (clean(body.company)) {
      console.warn("Season 01 sign-up dropped: honeypot field filled");
      return NextResponse.json({ ok: true });
    }

    const source = SOURCES.has(body.source) ? String(body.source) : "site-popup";
    const attr = (body.attribution && typeof body.attribution === "object" ? body.attribution : {}) as Record<string, unknown>;
    const profileProps: Record<string, string> = {
      season1_waitlist: "yes",
      season1_source: source,
      season1_ad: clean(body.ad, 40),
      season1_ad_name: clean(body.adName, 80),
      season1_joined_at: new Date().toISOString(),
    };
    const eventProps: Record<string, string> = {
      source,
      ad: profileProps.season1_ad,
      ad_name: profileProps.season1_ad_name,
      where: clean(body.where, 20),
      utm_source: clean(attr.utm_source),
      utm_medium: clean(attr.utm_medium),
      utm_campaign: clean(attr.utm_campaign),
      utm_content: clean(attr.utm_content, 160),
      utm_term: clean(attr.utm_term),
      page: clean(body.page, 300),
    };

    const ev = await event("Season 01 Waitlist", email, profileProps, eventProps, clean(body.firstName, 60));
    if (!ev.ok) {
      console.error("Klaviyo Season 01 event failed:", ev.status, await ev.text());
      return NextResponse.json({ ok: false, error: FAIL }, { status: 502 });
    }

    const sub = await klaviyo("profile-subscription-bulk-create-jobs", {
      data: {
        type: "profile-subscription-bulk-create-job",
        attributes: {
          custom_source: source === "ad-landing" ? "Season 01 ad landing page" : "Season 01 site popup",
          profiles: {
            data: [{ type: "profile", attributes: { email, subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } } } }],
          },
        },
        relationships: { list: { data: { type: "list", id: LIST_ID } } },
      },
    });
    if (!sub.ok) {
      // Profile + event exist, so the parent can still be found — log loudly, let them through.
      console.error("Klaviyo Season 01 list subscribe failed:", sub.status, await sub.text());
    }
    // Awaited so the serverless function isn't frozen mid-call. Never throws.
    await sendMetaLead(req, body, email, source === "ad-landing" ? `season_one_${profileProps.season1_ad || "landing"}` : "season_one_popup");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Season 01 route error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: FAIL }, { status: 502 });
  }
}
