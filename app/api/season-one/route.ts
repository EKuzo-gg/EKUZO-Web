import { randomUUID } from "crypto";
import { isIP } from "net";
import { NextRequest, NextResponse } from "next/server";
import { sendCapiEvent, sha256 } from "@/lib/metaCapi";
import { geoProfileProps, parseGeoHeader, tzProps } from "@/lib/seasonOneGeo";
import { getSql } from "@/lib/season1/db";
import { keyHash } from "@/lib/season1/rules";
import { keyIsLive } from "@/lib/season1/stripe";

/**
 * POST /api/season-one
 *
 * Season 01 waitlist capture: the site popup (components/ui/SeasonOnePopup)
 * and the parent-ad landing pages (app/season1/landing.html, served at /season1 by app/season1/route.ts) both post here.
 *
 * Order for a main sign-up: email check, API key check, step check, the
 * `games` / `age` / `text-karlin` steps (they return before anything below),
 * honeypot, then the 24 h classification (classifySignup), then the steps:
 *  0. classifySignup: one Postgres transaction on s1_rate_limits (an advisory
 *     lock on the email key, then one claim statement). Three classes:
 *       new    email not seen in 24 h: the full path below.
 *       retry  email and this attempt's `eventId` seen (a lost response): the
 *              full path again, so a lost response still ends in one Lead
 *              (Meta dedupes on event_id, Klaviyo on unique_id).
 *       repeat email seen, this `eventId` not (a second attempt): a
 *              "Season 01 Waitlist Repeat" event with the same event props and
 *              no profile props, the idempotent subscribe, no Meta Lead;
 *              responds {ok:true, repeat:true}.
 *     Fails open: no DATABASE_URL, any error, or no answer in 800 ms is "new".
 *     The log line never carries the email.
 *  1. POST /api/events, "Season 01 Waitlist". Upserts the profile with where
 *     they signed up and which ad sent them, so Karlin's first email and any
 *     reporting can read it. unique_id is email-metric-eventId when the page
 *     sent an eventId, else email-metric-timestamp.
 *  2. POST /api/profile-subscription-bulk-create-jobs, marketing consent +
 *     joins the "Season 01 Waitlist" list (XGTv2F, created 2026-10-09).
 *     A welcome flow on that list is planned; none exists yet, so joining it
 *     sends nothing on its own today. A subscribe failure (HTTP error or a
 *     thrown network error) is logged loudly and the sign-up still succeeds.
 *  3. Meta Conversions API "Lead" (main sign-up only, never the games/age
 *     steps), sent once the Klaviyo event has succeeded, concurrently with
 *     step 2. It shares `eventId` with the browser fbq Lead so Meta dedupes
 *     the pair; the server makes one up if the page didn't send it.
 *     Best-effort: a Meta failure is logged and never fails the sign-up. See
 *     docs/season-one-tracking.md.
 *
 * Ad-landing sign-ups also carry which landing hero the parent saw: `hero`
 *    (amount | games | screentime | shortlist, else "none" for page A),
 *    `heroAnswer` (plain text, 200 chars max, markup and link characters
 *    stripped; "skipped" if a hero was shown but unanswered, empty on page A)
 *    and `heroFrom` (url | ad-map | split | none, else empty). They are saved
 *    as profile props season1_hero / season1_hero_answer and event props
 *    hero / hero_answer / hero_from. Site-popup sign-ups never write them, and
 *    no hero field or answer is sent to Meta (the hero id can appear in the
 *    page URL Meta already receives). season1_hero_answer is visitor text:
 *    never render it unescaped in a Klaviyo template.
 *
 * A second call with { step: "age", kidAge } after sign-up records the
 * kid's age band as a profile property (no new subscription).
 *
 * { step: "text-karlin", phone } comes from the "Chat with our founder" card
 * on the ad landing confirmation. The parent asks Karlin to text them, and
 * Karlin texts back by hand from his own phone. The number is saved as the
 * profile property season1_text_phone and on a "Season 01 Text Karlin" event
 * (a Klaviyo flow on that metric alerts Karlin). It is deliberately NOT the
 * profile's phone_number and grants NO SMS consent: nothing automated ever
 * texts it, and it is never sent to Meta. US numbers only, stored as E.164.
 *
 * Where the family is (so Karlin texts at a sensible hour for them): the
 * Waitlist and Text Karlin events carry geo_country / geo_region / geo_city /
 * geo_postal and geo_tz from Netlify's x-nf-geo header (see readGeo), plus
 * `tz` and `tz_source`. `tz` is the browser's time zone (the landing sends
 * `tz` in the request body, validated server-side) unless that is a UTC alias
 * and the header has a real zone, else geo_tz, else ""; `tz_source` is
 * "browser", "geo" or "". Both events also write the profile properties
 * season1_city, season1_region and season1_tz, each only when non-empty so a
 * request without geo never blanks an earlier value. All of it is Klaviyo
 * only: never sent to Meta, and no latitude/longitude is kept.
 *
 * Honeypot: a non-empty `ekz_hp` on the main sign-up gets a silent 200 with no
 * Klaviyo write and no Meta Lead.
 *
 * Fails loudly if Klaviyo is unreachable: the email is the whole point, so the
 * parent is asked to retry rather than shown a false "you're in".
 *
 * Every outbound call has a timeout so a stalled upstream cannot hold the
 * function past Netlify's 10 s synchronous limit. Worst case is the check,
 * then the event, then the slower of the two concurrent calls:
 * 0.8 s + 3.5 s + 2.5 s = 6.8 s (Meta's 2 s limit lives in lib/metaCapi.ts).
 * An event timeout is a failed event (502, no Lead); a subscribe or Meta
 * timeout is logged and the sign-up still succeeds.
 */

const KLAVIYO_API_KEY = process.env.KLAVIYO_PRIVATE_API_KEY;
const KLAVIYO_REVISION = "2025-07-15";
const LIST_ID = process.env.KLAVIYO_SEASON1_LIST_ID || "XGTv2F";

// Anything but letters, digits, spaces, commas, periods, apostrophes and hyphens.
const GAMES_STRIP_RE = /[^\p{L}\p{N} ,.'-]/gu;
// Season 01 landing heroes (app/season1/landing.html). Anything else from an ad landing is recorded as "none".
const HEROES = new Set(["amount", "games", "screentime", "shortlist"]);
const HERO_FROM = new Set(["url", "ad-map", "split", "none"]);
// Letters, digits, spaces and the punctuation Aaron's answers use; strips markup and link characters.
const HERO_ANSWER_STRIP_RE = /[^\p{L}\p{N} ,.'’“”"!?&-]/gu;
const EVENT_TIMEOUT_MS = 3500;
const SUBSCRIBE_TIMEOUT_MS = 2500;
const DEDUPE_TIMEOUT_MS = 800;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// C0 and C1 control characters plus DEL; EMAIL_RE alone admits NUL.
const CONTROL_RE = /[\u0000-\u001f\u007f-\u009f]/;
const SOURCES = new Set(["site-popup", "ad-landing"]);
const clean = (v: unknown, max = 120) => String(v ?? "").trim().slice(0, max);
// Only string values are kept; objects and arrays would stringify to junk.
const text = (v: unknown, max = 120) => (typeof v === "string" ? clean(v, max) : "");
// Ad codes are d1..d99 (d1..d12 at launch; the November batch runs d16 to d21). Accepts any case and a
// leading zero (d01), returns "d1".."d99" or "". It was capped at d12, which blanked the ad on d13+ sign-ups.
const normalizeAd = (v: unknown) => {
  const m = typeof v === "string" ? /^d(0?[1-9]|[1-9]\d)$/i.exec(v.trim()) : null;
  return m ? `d${Number(m[1])}` : "";
};
const FAIL = "We couldn’t save that. Please try again.";
// Same sanitizer for the CAPI event_id and the Klaviyo unique_id; "" when the page sent none.
const cleanEventId = (v: unknown) => (typeof v === "string" ? v.replace(/[^A-Za-z0-9-]/g, "").slice(0, 64) : "");

type Signup = "new" | "retry" | "repeat";

/**
 * 24 h sign-up classification (see the header). One transaction: an advisory
 * lock on the email key serializes two requests for one email, then one
 * statement reads which keys were seen inside the last 24 h and claims the
 * rest. Fails open to "new" (and never logs the email). `claimed` is the keys
 * this call inserted, so a failed sign-up can release them (releaseClaim).
 */
async function classifySignup(email: string, eventId: string): Promise<{ kind: Signup; claimed: string[] }> {
  if (!process.env.DATABASE_URL) return { kind: "new", claimed: [] };
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const emailKey = `s1wl:em:${keyHash(email)}`;
    const keys = eventId ? [emailKey, `s1wl:ev:${keyHash(`${email}|${eventId}`)}`] : [emailKey];
    const sql = getSql();
    const run = sql.transaction([
      sql.query("select pg_advisory_xact_lock(hashtext($1))", [emailKey]),
      sql.query(
        `with seen as (
           select key from s1_rate_limits where key = any($1::text[]) and window_start > now() - interval '24 hours'),
         claimed as (
           insert into s1_rate_limits (key, window_start, count, livemode)
           select k, now(), 1, $2::boolean from unnest($1::text[]) k where k not in (select key from seen)
           on conflict do nothing returning key)
         select key from seen`,
        [keys, keyIsLive()],
      ),
    ]);
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`no answer in ${DEDUPE_TIMEOUT_MS} ms`)), DEDUPE_TIMEOUT_MS);
    });
    const results = (await Promise.race([run, timeout])) as { key: string }[][];
    const seen = new Set((results[1] ?? []).map((r) => r.key));
    const claimed = keys.filter((k) => !seen.has(k));
    if (!seen.has(emailKey)) return { kind: "new", claimed };
    return { kind: keys.length > 1 && seen.has(keys[1]) ? "retry" : "repeat", claimed };
  } catch (err) {
    console.warn("Season 01 dedupe check skipped:", err instanceof Error ? err.message : err);
    return { kind: "new", claimed: [] };
  } finally {
    clearTimeout(timer);
  }
}

/** A failed sign-up must not leave its claim behind, or the next attempt would read as a repeat. Never throws, never logs the email. */
async function releaseClaim(keys: string[]) {
  if (!keys.length) return;
  try {
    await getSql().query(
      "delete from s1_rate_limits where key = any($1::text[]) and window_start > now() - interval '24 hours'",
      [keys],
    );
  } catch (err) {
    console.warn("Season 01 dedupe release failed:", err instanceof Error ? err.message : err);
  }
}

/**
 * Visitor location and time zone from Netlify's `x-nf-geo` request header,
 * parsed by parseGeoHeader (lib/seasonOneGeo.ts, unit tested). Returns
 * geo_country, geo_region, geo_city, geo_postal and geo_tz. Written to Klaviyo
 * event properties (and, via geoProfileProps, to the season1_city,
 * season1_region and season1_tz profile properties); never sent to Meta, and no
 * latitude/longitude is kept. Format is typically base64-encoded JSON, some
 * runtimes send plain JSON; any failure gives empty strings. Whether the live
 * header carries `timezone` is checked after deploy (tz_source "geo" on a
 * popup sign-up).
 */
function readGeo(req: NextRequest): Record<string, string> {
  return parseGeoHeader(req.headers.get("x-nf-geo"));
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
    // Only a real http(s) URL goes to Meta (not javascript: or data:). The
    // parsed href is sent, since URL parsing drops tabs and newlines.
    let eventSourceUrl = "";
    try {
      const u = new URL(clean(body.eventSourceUrl, 1000));
      if (u.protocol === "http:" || u.protocol === "https:") eventSourceUrl = u.href;
    } catch {
      // not a URL; omit it
    }
    const userData: Record<string, string | string[]> = { em: [sha256(email)] };
    const ip =
      clean(req.headers.get("x-nf-client-connection-ip"), 100) ||
      clean((req.headers.get("x-forwarded-for") || "").split(",")[0], 100);
    if (isIP(ip)) userData.client_ip_address = ip;
    const ua = clean(req.headers.get("user-agent"), 400);
    if (ua) userData.client_user_agent = ua;
    const fbp = clean(req.cookies.get("_fbp")?.value, 500);
    if (fbp) userData.fbp = fbp;
    // The pixel sets _fbc when the visitor lands with ?fbclid=. If the cookie
    // is missing (blocked, or the pixel hadn't loaded yet), rebuild it from
    // the landing URL in Meta's fb.1.<ms>.<fbclid> format.
    let fbc = clean(req.cookies.get("_fbc")?.value, 500);
    if (!fbc && eventSourceUrl) {
      const fbclid = new URL(eventSourceUrl).searchParams.get("fbclid");
      if (fbclid) fbc = `fb.1.${Date.now()}.${fbclid}`;
    }
    if (fbc) userData.fbc = fbc;

    await sendCapiEvent({
      event_name: "Lead",
      event_time: Math.floor(Date.now() / 1000),
      event_id: cleanEventId(body.eventId) || randomUUID(),
      action_source: "website",
      ...(eventSourceUrl ? { event_source_url: eventSourceUrl } : {}),
      user_data: userData,
      custom_data: { content_name: contentName },
    });
  } catch (err) {
    console.error("Meta CAPI Lead error:", err instanceof Error ? err.message : err);
  }
}

async function klaviyo(path: string, body: unknown, timeoutMs: number) {
  return fetch(`https://a.klaviyo.com/api/${path}`, {
    method: "POST",
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
      "Content-Type": "application/json",
      accept: "application/json",
      revision: KLAVIYO_REVISION,
    },
    body: JSON.stringify(body),
  });
}

function event(metric: string, email: string, profileProps: Record<string, string>, eventProps: Record<string, string>, firstName = "", eventId = "") {
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
        unique_id: `${email}-${metric}-${eventId || Date.now()}`,
      },
    },
  }, EVENT_TIMEOUT_MS);
}

/** Idempotent list subscribe. Never throws: a failure is logged and the sign-up carries on. */
async function subscribe(email: string, source: string) {
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
    }, SUBSCRIBE_TIMEOUT_MS);
    if (!sub.ok) {
      // Profile + event exist, so the parent can still be found: log loudly, let them through.
      console.error("Klaviyo Season 01 list subscribe failed:", sub.status, await sub.text());
    }
  } catch (err) {
    // A thrown fetch (network error, timeout) is handled like an HTTP error: same log, carry on.
    console.error("Klaviyo Season 01 list subscribe failed:", err instanceof Error ? err.message : err);
  }
}

export async function POST(req: NextRequest) {
  const raw = await req.json().catch(() => null);
  const body = raw && typeof raw === "object" ? raw : {}; // null or a non-object falls through to the 400
  const email = clean(body.email, 254).toLowerCase();

  if (!EMAIL_RE.test(email) || CONTROL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "That email doesn’t look right." }, { status: 400 });
  }
  if (!KLAVIYO_API_KEY) {
    console.error("KLAVIYO_PRIVATE_API_KEY not set — Season 01 sign-up lost:", email);
    return NextResponse.json({ ok: false, error: FAIL }, { status: 500 });
  }

  // A step that is present but not one we know is a client bug: do nothing rather than fall through to a sign-up.
  if (body.step !== undefined && body.step !== "games" && body.step !== "age" && body.step !== "text-karlin") {
    return NextResponse.json({ ok: false, error: FAIL }, { status: 400 });
  }

  try {
    // Follow-up: games they play (multi-select, comma-separated)
    if (body.step === "games") {
      // Plain words only, so a link or markup can't ride into a welcome email.
      const kidGames = clean(typeof body.kidGames === "string" ? body.kidGames.replace(GAMES_STRIP_RE, "") : "", 200);
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

    // Follow-up: the parent wants Karlin to text them (see the header note: no SMS consent, no Meta)
    if (body.step === "text-karlin") {
      const phone = text(body.phone, 16);
      if (!/^\+1[2-9]\d{9}$/.test(phone)) return NextResponse.json({ ok: false, error: "Check the number and try again." }, { status: 400 });
      const ad = normalizeAd(body.ad);
      const h = text(body.hero).toLowerCase();
      const geo = readGeo(req);
      const t = tzProps(body.tz, geo);
      const r = await event("Season 01 Text Karlin", email,
        { season1_text_phone: phone, season1_text_requested_at: new Date().toISOString(), ...geoProfileProps(geo, t.tz) },
        { phone, ad, hero: HEROES.has(h) ? h : "none", ...geo, ...t });
      if (!r.ok) console.error("Klaviyo text-karlin event failed:", r.status, await r.text());
      return NextResponse.json({ ok: r.ok }, { status: r.ok ? 200 : 502 });
    }

    // Honeypot: the hidden `ekz_hp` field is only ever filled by bots. Look
    // like a success so they move on, but write nothing and send no Lead.
    if (clean(body.ekz_hp)) {
      console.warn("Season 01 sign-up dropped: honeypot field filled");
      return NextResponse.json({ ok: true });
    }

    const source = SOURCES.has(body.source) ? String(body.source) : "site-popup";
    const attr = (body.attribution && typeof body.attribution === "object" ? body.attribution : {}) as Record<string, unknown>;
    const geo = readGeo(req);
    const t = tzProps(body.tz, geo);
    const profileProps: Record<string, string> = {
      season1_waitlist: "yes",
      season1_source: source,
      season1_ad: normalizeAd(body.ad),
      season1_ad_name: clean(body.adName, 80),
      season1_joined_at: new Date().toISOString(),
      ...geoProfileProps(geo, t.tz),
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
      attribution_from: "none",
      page: clean(body.page, 300),
      // Klaviyo-only (see readGeo / readDevice); sendMetaLead never reads these.
      ...geo,
      ...t,
      ...readDevice(clean(req.headers.get("user-agent"), 400)),
    };

    // Where the attribution came from. A claim of url/session/return-visit only counts if some value arrived with it.
    const hasAttr = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id", "site"].some((k) => eventProps[k]);
    if (hasAttr) {
      if (source === "ad-landing") eventProps.attribution_from = "url";
      else if (body.attributionFrom === "url" || body.attributionFrom === "session" || body.attributionFrom === "return-visit") {
        eventProps.attribution_from = body.attributionFrom;
      }
    }

    // Which landing hero the parent saw and what they answered (ad landing only; the popup never writes these).
    if (source === "ad-landing") {
      const h = text(body.hero).toLowerCase();
      const hero = HEROES.has(h) ? h : "none";
      // Trim, cap at 200 UTF-16 units, drop a high surrogate the cap may have split (the strip above leaves no other lone ones), re-trim.
      const answer = (typeof body.heroAnswer === "string" ? body.heroAnswer.replace(HERO_ANSWER_STRIP_RE, "") : "").trim().slice(0, 200).replace(/[\uD800-\uDBFF]$/, "").trim();
      const heroAnswer = hero === "none" ? "" : answer || "skipped";
      profileProps.season1_hero = hero;
      profileProps.season1_hero_answer = heroAnswer;
      eventProps.hero = hero;
      eventProps.hero_answer = heroAnswer;
      eventProps.hero_from = typeof body.heroFrom === "string" && HERO_FROM.has(body.heroFrom) ? body.heroFrom : "";
    }

    const eventId = cleanEventId(body.eventId);
    const { kind: signup, claimed } = await classifySignup(email, eventId);

    if (signup === "repeat") {
      // Same attribution on a separate metric; no profile props (season1_* stay as first written), no Lead.
      try {
        const rep = await event("Season 01 Waitlist Repeat", email, {}, eventProps, "", eventId); // no firstName: a repeat must not change first_name
        if (!rep.ok) console.error("Klaviyo Season 01 repeat event failed:", rep.status, await rep.text());
      } catch (err) {
        console.error("Klaviyo Season 01 repeat event failed:", err instanceof Error ? err.message : err);
      }
      await subscribe(email, source);
      return NextResponse.json({ ok: true, repeat: true });
    }

    let ev: Response;
    try {
      ev = await event("Season 01 Waitlist", email, profileProps, eventProps, clean(body.firstName, 60), eventId);
    } catch (err) {
      await releaseClaim(claimed);
      throw err; // the outer catch logs and returns the 502
    }
    if (!ev.ok) {
      console.error("Klaviyo Season 01 event failed:", ev.status, await ev.text());
      await releaseClaim(claimed);
      return NextResponse.json({ ok: false, error: FAIL }, { status: 502 });
    }

    // Both helpers never throw; awaited so the serverless function isn't frozen mid-call.
    await Promise.all([
      subscribe(email, source),
      sendMetaLead(req, body, email, source === "ad-landing" ? `season_one_${profileProps.season1_ad || "landing"}` : "season_one_popup"),
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Season 01 route error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: FAIL }, { status: 502 });
  }
}
