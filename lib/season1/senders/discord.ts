import { SenderError, type FriendCtx, type OrderCtx, type SendOutcome } from "./context";
import { KLAVIYO_REVISION, testEmailAllowed } from "./klaviyo";

/**
 * Season 01 Discord sender for the ops channel: commits, referral flags and
 * ops alerts.
 *
 * Commit format (Jamie, 2026-10-30 13:17 CT; replaces decision 9 of 2026-10-29,
 * which kept email and location out of Discord):
 *   Season 01 commit | <n> kid|kids | Email: <payer email> | Location: <City>, <REGION> (time zone: <IANA tz>) | Source: <source>
 * The payer email and the family's city, region and time zone now appear, in a
 * private team channel. Kid names, ages, phone and amount still never do.
 * Free text is stripped of markup, mentions-by-markup and long digit runs;
 * sendDiscord also sends allowed_mentions parse [] so nothing pings. Referral
 * flag and ops alert formats are unchanged.
 */

export const DISCORD_TIMEOUT_MS = 2000;
/** The Klaviyo ad-name lookup for the Source field: short, and never allowed to fail the send. */
export const KLAVIYO_LOOKUP_TIMEOUT_MS = 1500;

/** Free text (order refs, referral ids): no mentions, markup, control characters or phone-like digit runs. */
export function free(s: unknown, max = 40): string {
  return String(s ?? "")
    .replace(/[@<>`*~|\\\u0000-\u001f\u007f-\u009f]/g, "")
    .replace(/\d{7,}/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/** Flag and alert names: lowercase identifier characters only. */
export const ident = (s: unknown, max = 60): string => String(s ?? "").toLowerCase().replace(/[^a-z0-9_:.-]/g, "").slice(0, max);

/** A payer email for the channel: markup and control characters out, the @ kept (mentions are disabled by allowed_mentions). */
export function emailText(s: unknown, max = 120): string {
  return String(s ?? "")
    .replace(/[<>`|*~\\\u0000-\u001f\u007f-\u009f\s]/g, "")
    .slice(0, max);
}

/** An IANA zone name: letters, digits and / _ + - . only. */
const tzText = (s: unknown): string => String(s ?? "").replace(/[^A-Za-z0-9_/+.-]/g, "").slice(0, 40);

const tag = (livemode: boolean) => (livemode ? "" : "[TEST] ");

export type SourceCategory = "ad" | "organic" | "referral" | "karlin" | "email";

/** Source category for a src value: referral when a friend code was used, else the src value mapped. */
export function sourceCategory(o: Pick<OrderCtx, "src" | "invited">): SourceCategory {
  if (o.invited) return "referral";
  const s = String(o.src ?? "").toLowerCase();
  if (s === "friend") return "referral";
  if (s === "karlin") return "karlin";
  if (s === "email") return "email";
  if (s === "ad" || s.startsWith("ad_")) return "ad";
  return "organic";
}

type SourceInput = Pick<OrderCtx, "src" | "invited" | "utmSource" | "utmMedium" | "utmCampaign" | "utmContent" | "firstTouch">;

const PAID_MEDIUMS = new Set(["paid", "cpc", "ppc", "paid_social"]);
const PAID_SOURCES = new Set(["meta", "facebook", "fb", "ig", "instagram"]);
const low = (s: unknown) => String(s ?? "").trim().toLowerCase();

const isReferral = (o: SourceInput) => o.invited || low(o.src) === "friend";
/** The last click is paid: a paid medium, or a Meta source that carries a utm_content. */
const isPaidClick = (o: SourceInput) =>
  PAID_MEDIUMS.has(low(o.utmMedium)) || (PAID_SOURCES.has(low(o.utmSource)) && !!free(o.utmContent, 80));
const isEmailClick = (o: SourceInput) => low(o.utmMedium) === "email" || low(o.src) === "email";

/** Branches a to c settle the Source without the Klaviyo profile (referral, karlin, a named paid click). */
export function needsAdNameLookup(o: SourceInput): boolean {
  if (isReferral(o) || low(o.src) === "karlin") return false;
  return !(isPaidClick(o) && !!free(o.utmContent, 80));
}

/**
 * One Source value, first match wins: (a) referral, (b) karlin, (c) a paid last
 * click `ad <utm_content>`, (d) the waitlist's Klaviyo `season1_ad_name`
 * `ad <name>` plus ` (via <last click>)` when the last click was something else,
 * (e) email, (f) the first-touch bucket, (g) organic. A paid click with no
 * utm_content and no profile ad name reads `ad` plus the campaign when there is one.
 */
export function formatSource(o: SourceInput, adName: string | null = null): string {
  if (isReferral(o)) return "referral";
  if (low(o.src) === "karlin") return "karlin";
  const content = free(o.utmContent, 80);
  if (isPaidClick(o) && content) return `ad ${content}`;
  const name = free(adName, 80);
  if (name) {
    const via = isEmailClick(o) ? "email" : sourceCategory(o);
    return via === "ad" || (isPaidClick(o) && via === "organic") ? `ad ${name}` : `ad ${name} (via ${via})`;
  }
  const campaign = free(o.utmCampaign, 60);
  if (isPaidClick(o)) return campaign ? `ad ${campaign}` : "ad";
  if (isEmailClick(o)) return campaign ? `email ${campaign}` : "email";
  const ft = ident(o.firstTouch, 40);
  if (ft) return ft;
  return "organic";
}

/** `City, REGION (time zone: tz)`; missing pieces drop out, nothing at all reads `unknown`. */
export function formatLocation(o: Pick<OrderCtx, "geoCity" | "geoRegion" | "geoTz">): string {
  const city = free(o.geoCity, 60);
  const region = free(o.geoRegion, 12);
  const tz = tzText(o.geoTz);
  const place = [city, region].filter(Boolean).join(", ");
  if (!place) return tz ? `unknown (time zone: ${tz})` : "unknown";
  return tz ? `${place} (time zone: ${tz})` : place;
}

/**
 * Season 01 commit | <n> kid|kids | Email: <payer email> | Location: <place> | Source: <source>
 * `adName` is the parent's Klaviyo season1_ad_name when the caller looked it up (see lookupAdName).
 */
export function formatCommit(o: OrderCtx, adName: string | null = null): string {
  const n = o.kids.length;
  const parts = [
    `${tag(o.livemode)}Season 01 commit`,
    `${n} ${n === 1 ? "kid" : "kids"}`,
    `Email: ${emailText(o.email) || "unknown"}`,
    `Location: ${formatLocation(o)}`,
    `Source: ${formatSource(o, adName)}`,
  ];
  return parts.join(" | ").slice(0, 1800);
}

/**
 * The parent's `season1_ad_name` from Klaviyo (set by the waitlist Lead), or null.
 * Reads one profile by email: 1.5 s timeout; no key, no profile, no property,
 * a non-200, a timeout or any error all return null. It never throws, so it
 * can never fail the Discord send, and it logs nothing (the email is PII).
 * Test-mode orders are looked up only for the allowlisted test addresses.
 */
export async function lookupAdName(email: string, livemode: boolean): Promise<string | null> {
  try {
    const key = process.env.KLAVIYO_PRIVATE_API_KEY;
    const e = String(email ?? "").trim().toLowerCase();
    if (!key || !e || e.length > 200) return null;
    if (!livemode && !testEmailAllowed(e)) return null;
    const filter = `equals(email,"${e.replace(/[\\"]/g, "")}")`;
    const url = `https://a.klaviyo.com/api/profiles?filter=${encodeURIComponent(filter)}&fields[profile]=properties`;
    const res = await fetch(url, {
      headers: { Authorization: `Klaviyo-API-Key ${key}`, accept: "application/json", revision: KLAVIYO_REVISION },
      signal: AbortSignal.timeout(KLAVIYO_LOOKUP_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { data?: Array<{ attributes?: { properties?: Record<string, unknown> } }> };
    const v = j?.data?.[0]?.attributes?.properties?.season1_ad_name;
    return typeof v === "string" && v.trim() ? v.trim().slice(0, 80) : null;
  } catch {
    return null;
  }
}

/** The Klaviyo ad name for a commit, looked up only when the Source can still use it. */
export async function adNameFor(o: OrderCtx): Promise<string | null> {
  return needsAdNameLookup(o) ? lookupAdName(o.email, o.livemode) : null;
}

export function formatFlag(f: FriendCtx, flag: string, livemode: boolean): string {
  const parts = [
    `${tag(livemode)}Season 01 referral flag: ${ident(flag, 40)}`,
    `code ${ident(f.code, 20)}`,
    `friend kids ${f.friendKids}`,
    `live friend kids ${f.friendsTotal}`,
    `referral ${free(f.referralId, 40)}`,
  ];
  if (f.joinerOrderRef) parts.push(`ref ${free(f.joinerOrderRef, 20)}`);
  return parts.join(" | ").slice(0, 1800);
}

export function formatOpsAlert(kind: string, paymentIntent: string | null, livemode: boolean): string {
  const pi = paymentIntent && /^pi_[A-Za-z0-9_]{6,80}$/.test(paymentIntent) ? ` | ${paymentIntent}` : "";
  return `${tag(livemode)}Season 01 ops alert: ${ident(kind, 60) || "unknown"}${pi}`;
}

/** TEST webhook for test-mode rows, the live one for live rows. Unset means skipped. */
export function webhookUrl(livemode: boolean): string | null {
  const v = livemode ? process.env.S1_DISCORD_WEBHOOK_URL : process.env.S1_DISCORD_WEBHOOK_URL_TEST;
  return v && v.trim() ? v.trim() : null;
}

export async function sendDiscord(content: string, livemode: boolean): Promise<SendOutcome> {
  const url = webhookUrl(livemode);
  if (!url) return { outcome: "skipped_no_config" };
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
      signal: AbortSignal.timeout(DISCORD_TIMEOUT_MS),
    });
  } catch (err) {
    throw new SenderError((err as Error)?.name === "TimeoutError" ? "discord_timeout" : "discord_network");
  }
  await res.text().catch(() => "");
  if (!res.ok) throw new SenderError(`discord_http_${res.status}`);
  return { outcome: "sent", detail: `http_${res.status}` };
}
