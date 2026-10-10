import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { sendCapiEvent, sha256 } from "@/lib/metaCapi";

/**
 * POST /api/season-one
 *
 * Season 01 waitlist capture — the site popup (components/ui/SeasonOnePopup)
 * and the parent-ad landing pages (public/roadshow/landing.html) both post here.
 *
 * Steps:
 *  1. POST /api/events — "Season 01 Waitlist". Upserts the profile with where
 *     they signed up and which ad sent them, so Karlin's first email and any
 *     reporting can read it.
 *  2. POST /api/profile-subscription-bulk-create-jobs — marketing consent +
 *     joins the "Season 01 Waitlist" list (XGTv2F, created 2026-10-09).
 *     A welcome flow on that list is planned; none exists yet, so joining it
 *     sends nothing on its own today. A subscribe failure (HTTP error or a
 *     thrown network error) is logged loudly and the sign-up still succeeds.
 *  3. Meta Conversions API "Lead" (main sign-up only, never the games/age
 *     steps), sent once the Klaviyo event has succeeded. It shares `eventId`
 *     with the browser fbq Lead so Meta dedupes the pair; the server makes one
 *     up if the page didn't send it. Best-effort: a Meta failure is logged and
 *     never fails the sign-up. See docs/season-one-tracking.md.
 *
 * A second call with { step: "age", kidAge } after sign-up records the
 * kid's age band as a profile property (no new subscription).
 *
 * Honeypot: a non-empty `ekz_hp` on the main sign-up gets a silent 200 with no
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
// Only string values are kept; objects and arrays would stringify to junk.
const text = (v: unknown, max = 120) => (typeof v === "string" ? clean(v, max) : "");
// The 12 ads are d1..d12. Accepts any case and a leading zero (d01), returns "d1".."d12" or "".
const normalizeAd = (v: unknown) => {
  const m = typeof v === "string" ? /^d(0?[1-9]|1[0-2])$/i.exec(v.trim()) : null;
  return m ? `d${Number(m[1])}` : "";
};
const FAIL = "We couldn’t save that. Please try again.";

/**
 * Visitor location from Netlify's `x-nf-geo` request header. Klaviyo event
 * properties only: never sent to Meta, and no latitude/longitude is kept.
 * Format is typically base64-encoded JSON ({"city","country":{"code"},
 * "subdivision":{"code"},"postalCode"|"postal_code",...}); some runtimes send
 * plain JSON. Parsed defensively: base64 first, then raw, any failure = empty.
 * The exact format is NOT verified against a live deploy yet (checklist L2).
 */
function readGeo(req: NextRequest): Record<string, string> {
  const h = req.headers.get("x-nf-geo");
  let g: Record<string, unknown> | null = null;
  if (h) {
    for (const decode of [(s: string) => Buffer.from(s, "base64").toString("utf8"), (s: string) => s]) {
      try {
        const j = JSON.parse(decode(h));
        if (j && typeof j === "object" && !Array.isArray(j)) { g = j; break; }
      } catch {
        // not this encoding; try the next
      }
    }
  }
  // Accepts {code: "US"} objects or a bare string for country and subdivision.
  const code = (v: unknown) => text(v && typeof v === "object" ? (v as Record<string, unknown>).code : v, 8);
  return {
    geo_country: code(g?.country),
    geo_region: code(g?.subdivision),
    geo_city: text(g?.city, 80),
    geo_postal: text(g?.postalCode ?? g?.postal_code, 12),
  };
}

/** Coarse device class from the user agent. No dependency, deliberately rough. */
function readDevice(ua: string): Record<string, string> {
  if (!ua) return { device_os: "", device_type: "" };
  const os = /iPhone|iPad|iPod/.test(ua) ? "ios" : /Android/.test(ua) ? "android" : /CrOS/.test(ua) ? "chromeos"
    : /Windows/.test(ua) ? "windows" : /Macintosh|Mac OS X/.test(ua) ? "mac" : /Linux|X11/.test(ua) ? "linux" : "other";
  // iPadOS 13+ Safari reports a Macintosh UA, so it reads as mac/desktop here.
  const tablet = /iPad|Tablet/.test(ua) || (os === "android" && !/Mobile/.test(ua));
  return { device_os: os, device_type: tablet ? "tablet" : /iPhone|iPod|Mobi/.test(ua) ? "mobile" : "desktop" };
}

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
  const raw = await req.json().catch(() => null);
  const body = raw && typeof raw === "object" ? raw : {}; // null or a non-object falls through to the 400
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

    // Honeypot: the hidden `ekz_hp` field is only ever filled by bots. Look
    // like a success so they move on, but write nothing and send no Lead.
    if (clean(body.ekz_hp)) {
      console.warn("Season 01 sign-up dropped: honeypot field filled");
      return NextResponse.json({ ok: true });
    }

    const source = SOURCES.has(body.source) ? String(body.source) : "site-popup";
    const attr = (body.attribution && typeof body.attribution === "object" ? body.attribution : {}) as Record<string, unknown>;
    const profileProps: Record<string, string> = {
      season1_waitlist: "yes",
      season1_source: source,
      season1_ad: normalizeAd(body.ad),
      season1_ad_name: clean(body.adName, 80),
      season1_joined_at: new Date().toISOString(),
    };
    const eventProps: Record<string, string> = {
      source,
      ad: profileProps.season1_ad,
      ad_name: profileProps.season1_ad_name,
      where: clean(body.where, 20),
      utm_source: text(attr.utm_source),
      utm_medium: text(attr.utm_medium),
      utm_campaign: text(attr.utm_campaign),
      utm_content: text(attr.utm_content, 160),
      utm_term: text(attr.utm_term),
      utm_id: text(attr.utm_id, 40),
      site: text(attr.site, 20),
      page: clean(body.page, 300),
      // Klaviyo-only (see readGeo / readDevice); sendMetaLead never reads these.
      ...readGeo(req),
      ...readDevice(clean(req.headers.get("user-agent"), 400)),
    };

    const ev = await event("Season 01 Waitlist", email, profileProps, eventProps, clean(body.firstName, 60));
    if (!ev.ok) {
      console.error("Klaviyo Season 01 event failed:", ev.status, await ev.text());
      return NextResponse.json({ ok: false, error: FAIL }, { status: 502 });
    }

    try {
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
        // Profile + event exist, so the parent can still be found: log loudly, let them through.
        console.error("Klaviyo Season 01 list subscribe failed:", sub.status, await sub.text());
      }
    } catch (err) {
      // A thrown fetch (network error, timeout) is handled like an HTTP error: same log, carry on.
      console.error("Klaviyo Season 01 list subscribe failed:", err instanceof Error ? err.message : err);
    }
    // Awaited so the serverless function isn't frozen mid-call. Never throws.
    await sendMetaLead(req, body, email, source === "ad-landing" ? `season_one_${profileProps.season1_ad || "landing"}` : "season_one_popup");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Season 01 route error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: FAIL }, { status: 502 });
  }
}
