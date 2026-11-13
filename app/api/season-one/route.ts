import { randomUUID } from "crypto";
import { isIP } from "net";
import { NextRequest, NextResponse } from "next/server";
import { sendCapiEvent, sha256 } from "@/lib/metaCapi";
import { geoProfileProps, parseGeoHeader, tzProps } from "@/lib/seasonOneGeo";
import { getSql } from "@/lib/season1/db";
import { isCrossSite } from "@/lib/season1/httpGuard";
import { OFFER } from "@/lib/season1/offer";
import { handleBetaWizard } from "@/lib/season1/betaWizard";
import { hit } from "@/lib/season1/ratelimit";
import { keyHash } from "@/lib/season1/rules";
import { keyIsLive } from "@/lib/season1/stripe";

/**
 * POST /api/season-one
 *
 * Season 01 waitlist capture: the site popup (components/ui/SeasonOnePopup)
 * and the parent-ad landing pages (app/season1/landing.html, served at /season1 by app/season1/route.ts) both post here.
 *
 * Order: Origin guard (a cross-site browser POST gets 403; no Origin, as from
 * curl, still passes), email check, API key check, step check, the `games` /
 * `age` / `text-karlin` steps (stepAllowed first; they return before anything
 * below), honeypot, then the 24 h classification (classifySignup), then the steps:
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
 *     `new` claims the email and ev keys; a repeat claims a separate rp key
 *     (s1wl:rp:, never the ev key, so a second post of the same repeat reads as
 *     a repeat again and not as a retry that skips the IP count). The step lock
 *     accepts an ev or rp key (R2-D11), so a parent who signs up again from a new
 *     page view still has working follow-up steps. Only a seen ev key is a retry. Only `new` counts toward the IP hour. A stranger
 *     re-signing a known email can therefore unlock its steps; text-karlin stays
 *     capped at 3 per email per 24 h (and before round 2 any step posted freely).
 *     The same statement counts `new` sign-ups per client IP and globally
 *     (round 2, S2 items 1 to 4): key s1ip:<keyHash(ip)>, fixed one-hour window
 *     floored to the hour (the hit() convention; a 2x burst across the edge is
 *     accepted). The IP is Netlify's x-nf-client-connection-ip only, checked
 *     with isIP (x-forwarded-for is client-set and is never read); IPv6 keys on
 *     its /64, a ::ffff: mapped v4 keys as v4, and no valid IP means no per-IP
 *     limit (never one shared bucket). Retries, repeats and failed sign-ups do
 *     not count. Over IP_QUIET (10) in the hour, or over GLOBAL_QUIET (150) new
 *     sign-ups across all IPs: "quiet", the sign-up runs as usual but sends no
 *     Meta Lead and answers {ok:true, quiet:true}. Over IP_LIMIT (30): 429 with
 *     the claim released and nothing sent. Each quiet or 429 logs one warn line
 *     with the reason and no IP, no email.
 *     Fails open: no DATABASE_URL, any error, or no answer in 800 ms is "new".
 *     A failed event releases this request's claim (also capped at 800 ms, so
 *     the 502 path is 0.8 + 3.5 + 0.8 s). Known gap: a claim that commits after
 *     the 800 ms cap is not released, so that one family's next attempt reads as a repeat.
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
 * Step lock (games, age, text-karlin): the step must belong to a sign-up this
 * server claimed. With an `eventId`, the s1wl:ev: or s1wl:rp: key for that email and id must
 * exist inside 24 h; without one (old cached pages) the s1wl:em: key must. One
 * `select 1 ... limit 1`, 800 ms cap, fail open on any error or no database. No
 * match is a silent 200 {ok:true} with nothing written and a `step_dropped` warn
 * (step name and reason only), so a stranger learns nothing about an email.
 * text-karlin is also capped at 3 per email per 24 h.
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
 * The IP limiter shares the claim's one round trip and one 800 ms cap, so it adds
 * nothing. A step costs at most 0.8 s (lock) + 0.8 s (text-karlin cap) + 3.5 s.
 * Logs never carry an email, an IP or a Klaviyo response body.
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
// New sign-ups per client IP per clock hour: above IP_QUIET no Meta Lead, above IP_LIMIT a 429.
const IP_QUIET = 10;
const IP_LIMIT = 30;
// New sign-ups per clock hour across all IPs: above this every further one is quiet.
const GLOBAL_QUIET = 150;
const GLOBAL_KEY = "s1ip:global";
const TEXT_KARLIN_PER_DAY = 3;

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
type Verdict = { kind: Signup; claimed: string[]; quiet: boolean; limited: boolean; reason: string };
const NOT_COUNTED: Verdict = { kind: "new", claimed: [], quiet: false, limited: false, reason: "" };

/**
 * The key material for the per-IP limiter, from Netlify's x-nf-client-connection-ip
 * only (x-forwarded-for is client-set). null when there is no valid IP: the
 * limiter is then skipped, never one shared bucket. IPv4 keys as itself, a
 * ::ffff: mapped v4 as that v4, any other IPv6 on its /64.
 */
function clientIpKeyMaterial(req: NextRequest): string | null {
  const ip = clean(req.headers.get("x-nf-client-connection-ip"), 100).split("%")[0];
  const v = isIP(ip);
  if (v === 4) return ip;
  if (v !== 6) return null;
  let s = ip.toLowerCase();
  const dotted = /(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(s);
  if (dotted) {
    const [a, b, c, d] = dotted.slice(1).map(Number);
    s = s.slice(0, dotted.index) + `${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
  }
  const halves = s.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const fill = halves.length === 2 ? 8 - head.length - tail.length : 0;
  const groups = [...head, ...Array(Math.max(fill, 0)).fill("0"), ...tail].map((g) => parseInt(g, 16));
  if (groups.length !== 8 || groups.some((g) => !Number.isFinite(g))) return null;
  if (groups.slice(0, 5).every((g) => g === 0) && groups[5] === 0xffff) {
    return `${groups[6] >> 8}.${groups[6] & 255}.${groups[7] >> 8}.${groups[7] & 255}`;
  }
  return "v6:" + groups.slice(0, 4).map((g) => g.toString(16).padStart(4, "0")).join(":");
}

/**
 * 24 h sign-up classification plus the per-IP and global counters (see the
 * header). One transaction: an advisory lock on the email key serializes two
 * requests for one email, then one statement reads which keys were seen inside
 * the last 24 h, claims the rest (a repeat claims its ev key), and counts this new
 * sign-up against the hour's IP and global keys. Fails open to "new" (and never
 * logs the email or the IP). `claimed` is the keys this call inserted, so a
 * failed or refused sign-up can release them (releaseClaim).
 */
async function classifySignup(req: NextRequest, email: string, eventId: string): Promise<Verdict> {
  if (!process.env.DATABASE_URL) return NOT_COUNTED;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const emailKey = `s1wl:em:${keyHash(email)}`;
    const evKey = eventId ? `s1wl:ev:${keyHash(`${email}|${eventId}`)}` : "";
    const rpKey = eventId ? `s1wl:rp:${keyHash(`${email}|${eventId}`)}` : "";
    const keys = eventId ? [emailKey, evKey, rpKey] : [emailKey];
    const material = clientIpKeyMaterial(req);
    const ipKey = material ? `s1ip:${keyHash(material)}` : "";
    const counted = ipKey ? [ipKey, GLOBAL_KEY] : [GLOBAL_KEY];
    const sql = getSql();
    const run = sql.transaction([
      sql.query("select pg_advisory_xact_lock(hashtext($1))", [emailKey]),
      sql.query(
        `with seen as (
           select key from s1_rate_limits where key = any($1::text[]) and window_start > now() - interval '24 hours'),
         claimed as (
           insert into s1_rate_limits (key, window_start, count, livemode)
           select k, now(), 1, $2::boolean from unnest($1::text[]) k
            where k not in (select key from seen)
              and (case when exists (select 1 from seen where key = $3::text) then k = $5::text else k <> $5::text end)
           on conflict do nothing returning key),
         counted as (
           insert into s1_rate_limits (key, window_start, count, livemode)
           select k, to_timestamp(floor(extract(epoch from now()) / 3600) * 3600), 1, $2::boolean from unnest($4::text[]) k
            where exists (select 1 from claimed where key = $3::text)
           on conflict (key, window_start) do update set count = s1_rate_limits.count + 1
           returning key, count)
         select 'seen' as kind, key, 0 as n from seen
         union all select 'ip', key, count from counted`,
        [keys, keyIsLive(), emailKey, counted, rpKey],
      ),
    ]);
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`no answer in ${DEDUPE_TIMEOUT_MS} ms`)), DEDUPE_TIMEOUT_MS);
    });
    const results = (await Promise.race([run, timeout])) as { kind: string; key: string; n: number }[][];
    const rows = results[1] ?? [];
    const seen = new Set(rows.filter((r) => r.kind === "seen").map((r) => r.key));
    if (seen.has(emailKey)) {
      const kind = evKey && seen.has(evKey) ? "retry" : "repeat";
      return { kind, claimed: kind === "repeat" && rpKey && !seen.has(rpKey) ? [rpKey] : [], quiet: false, limited: false, reason: "" };
    }
    const count = (k: string) => Number(rows.find((r) => r.kind === "ip" && r.key === k)?.n ?? 0);
    const ipN = ipKey ? count(ipKey) : 0;
    const globalN = count(GLOBAL_KEY);
    const reason = ipN > IP_LIMIT ? "ip_limit" : ipN > IP_QUIET ? "ip_quiet" : globalN > GLOBAL_QUIET ? "global_quiet" : "";
    return { kind: "new", claimed: keys.filter((k) => k !== rpKey), quiet: reason !== "", limited: reason === "ip_limit", reason };
  } catch (err) {
    console.warn("Season 01 dedupe check skipped:", err instanceof Error ? err.message : err);
    return NOT_COUNTED;
  } finally {
    clearTimeout(timer);
  }
}

/** One DB step with the same 800 ms fail-open cap. Resolves to `fallback` on no database, error or timeout. Never logs the email. */
async function capped<T>(what: string, fallback: T, work: () => Promise<T>): Promise<T> {
  if (!process.env.DATABASE_URL) return fallback;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`no answer in ${DEDUPE_TIMEOUT_MS} ms`)), DEDUPE_TIMEOUT_MS);
    });
    return await Promise.race([work(), timeout]);
  } catch (err) {
    console.warn(`Season 01 ${what} skipped:`, err instanceof Error ? err.message : err);
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The step lock: true when this step belongs to a sign-up we claimed in the last
 * 24 h (the ev key for this email and eventId, else the email key when the page
 * sent no eventId). Fails open (true) on no database, an error or a slow answer.
 */
function stepAllowed(email: string, eventId: string): Promise<boolean> {
  return capped("step check", true, async () => {
    const keys = eventId
      ? [`s1wl:ev:${keyHash(`${email}|${eventId}`)}`, `s1wl:rp:${keyHash(`${email}|${eventId}`)}`]
      : [`s1wl:em:${keyHash(email)}`];
    const rows = (await getSql().query(
      "select 1 from s1_rate_limits where key = any($1::text[]) and window_start > now() - interval '24 hours' limit 1",
      [keys],
    )) as unknown[];
    return rows.length > 0;
  });
}

/** text-karlin: at most 3 per email per 24 h. Fails open (true). */
function textKarlinWithinCap(email: string): Promise<boolean> {
  return capped("text-karlin cap", true, () => hit(`s1tk:${keyHash(email)}`, TEXT_KARLIN_PER_DAY, 86400));
}

/** "+18322710150" as "(832) 271-0150" for a parent; any other shape is shown as given. */
function displayPhone(e164: string): string {
  const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164;
}

function dropStep(step: string, reason: string) {
  console.warn(`Season 01 step_dropped step=${step} reason=${reason}`);
  return NextResponse.json({ ok: true });
}

/** A failed sign-up must not leave its claim behind, or the next attempt would read as a repeat. Same 800 ms cap as the claim. Never throws, never logs the email. */
async function releaseClaim(keys: string[]) {
  if (!keys.length) return;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const run = getSql().query(
      "delete from s1_rate_limits where key = any($1::text[]) and window_start > now() - interval '24 hours'",
      [keys],
    );
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`no answer in ${DEDUPE_TIMEOUT_MS} ms`)), DEDUPE_TIMEOUT_MS);
    });
    await Promise.race([run, timeout]);
  } catch (err) {
    console.warn("Season 01 dedupe release failed:", err instanceof Error ? err.message : err);
  } finally {
    clearTimeout(timer);
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
    // Netlify's header only: x-forwarded-for is client-set, so a spoofed value must never reach Meta.
    const ip = clean(req.headers.get("x-nf-client-connection-ip"), 100);
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
      console.error("Klaviyo Season 01 list subscribe failed:", sub.status);
    }
  } catch (err) {
    // A thrown fetch (network error, timeout) is handled like an HTTP error: same log, carry on.
    console.error("Klaviyo Season 01 list subscribe failed:", err instanceof Error ? err.message : err);
  }
}

export async function POST(req: NextRequest) {
  // A hostile page must not use a visitor's browser as a proxy. No Origin (curl) still passes.
  if (isCrossSite(req)) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  const raw = await req.json().catch(() => null);
  const body = raw && typeof raw === "object" ? raw : {}; // null or a non-object falls through to the 400
  const email = clean(body.email, 254).toLowerCase();

  if (!EMAIL_RE.test(email) || CONTROL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "That email doesn’t look right." }, { status: 400 });
  }
  if (!KLAVIYO_API_KEY) {
    console.error("KLAVIYO_PRIVATE_API_KEY not set: Season 01 sign-up lost");
    return NextResponse.json({ ok: false, error: FAIL }, { status: 500 });
  }

  // A step that is present but not one we know is a client bug: do nothing rather than fall through to a sign-up.
  if (body.step !== undefined && body.step !== "games" && body.step !== "age" && body.step !== "text-karlin" && body.step !== "beta-wizard") {
    return NextResponse.json({ ok: false, error: FAIL }, { status: 400 });
  }

  try {
    // The free beta sign-up wizard (lib/season1/betaWizard.ts). It is its own sign-up: no step lock, no 24 h email limit.
    if (body.step === "beta-wizard") return await handleBetaWizard(req, body, email, clientIpKeyMaterial(req));

    const stepEventId = cleanEventId(body.eventId);
    // Follow-up: games they play (multi-select, comma-separated)
    if (body.step === "games") {
      // Plain words only, so a link or markup can't ride into a welcome email.
      const kidGames = clean(typeof body.kidGames === "string" ? body.kidGames.replace(GAMES_STRIP_RE, "") : "", 200);
      if (!kidGames) return NextResponse.json({ ok: false, error: "Pick a game." }, { status: 400 });
      if (!(await stepAllowed(email, stepEventId))) return dropStep("games", "no_signup");
      const r = await event("Season 01 Waitlist Games", email, { kid_games: kidGames }, { kid_games: kidGames });
      if (!r.ok) console.error("Klaviyo games event failed:", r.status);
      return NextResponse.json({ ok: r.ok });
    }

    // Follow-up: kid's age band
    if (body.step === "age") {
      const kidAge = clean(body.kidAge, 20);
      if (!kidAge) return NextResponse.json({ ok: false, error: "Pick an age." }, { status: 400 });
      if (!(await stepAllowed(email, stepEventId))) return dropStep("age", "no_signup");
      const r = await event("Season 01 Waitlist Age", email, { season1_kid_age: kidAge }, { kid_age: kidAge });
      if (!r.ok) console.error("Klaviyo age event failed:", r.status);
      return NextResponse.json({ ok: r.ok });
    }

    // Follow-up: the parent wants Karlin to text them (see the header note: no SMS consent, no Meta)
    if (body.step === "text-karlin") {
      const phone = text(body.phone, 16);
      if (!/^\+1[2-9]\d{9}$/.test(phone)) return NextResponse.json({ ok: false, error: "Check the number and try again." }, { status: 400 });
      if (!(await stepAllowed(email, stepEventId))) return dropStep("text-karlin", "no_signup");
      if (!(await textKarlinWithinCap(email))) return dropStep("text-karlin", "cap");
      const ad = normalizeAd(body.ad);
      const h = text(body.hero).toLowerCase();
      const geo = readGeo(req);
      const t = tzProps(body.tz, geo);
      const r = await event("Season 01 Text Karlin", email,
        { season1_text_phone: phone, season1_text_requested_at: new Date().toISOString(), ...geoProfileProps(geo, t.tz) },
        { phone, ad, hero: HEROES.has(h) ? h : "none", ...geo, ...t });
      if (!r.ok) console.error("Klaviyo text-karlin event failed:", r.status);
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
    const { kind: signup, claimed, quiet, limited, reason } = await classifySignup(req, email, eventId);

    if (limited) {
      // Nothing is sent. The claim is released so the family's next attempt (or a hand-added one) reads as new.
      console.warn(`Season 01 sign-up rate limited: reason=${reason}`);
      await releaseClaim(claimed);
      return NextResponse.json({
        ok: false,
        error: `We couldn’t save your sign-up just now. Text our founder at ${displayPhone(OFFER.textKarlinSms)} and we’ll add you by hand.`,
      }, { status: 429 });
    }
    if (quiet) console.warn(`Season 01 sign-up quiet: reason=${reason}`);

    if (signup === "repeat") {
      // Same attribution on a separate metric; no profile props (season1_* stay as first written), no Lead.
      try {
        const rep = await event("Season 01 Waitlist Repeat", email, {}, eventProps, "", eventId); // no firstName: a repeat must not change first_name
        if (!rep.ok) console.error("Klaviyo Season 01 repeat event failed:", rep.status);
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
      console.error("Klaviyo Season 01 event failed:", ev.status);
      await releaseClaim(claimed);
      return NextResponse.json({ ok: false, error: FAIL }, { status: 502 });
    }

    // Both helpers never throw; awaited so the serverless function isn't frozen mid-call. A quiet sign-up sends no Lead.
    await Promise.all([
      subscribe(email, source),
      quiet ? Promise.resolve() : sendMetaLead(req, body, email, source === "ad-landing" ? `season_one_${profileProps.season1_ad || "landing"}` : "season_one_popup"),
    ]);
    return NextResponse.json(quiet ? { ok: true, quiet: true } : { ok: true });
  } catch (err) {
    console.error("Season 01 route error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: FAIL }, { status: 502 });
  }
}
