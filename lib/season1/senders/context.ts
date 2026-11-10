/**
 * Season 01 outbox: the plain data the senders build payloads from. Types and
 * tiny pure helpers only (no network, no database), so the builders can be
 * unit tested. Loaded from the database by lib/season1/outboxLoad.ts.
 */

export interface KidCtx {
  firstName: string;
  age: number | null;
  role: string;
}

export interface OrderCtx {
  orderPublicId: string;
  livemode: boolean;
  status: string;
  email: string;
  parentFirstName: string | null;
  phone: string | null;
  consentAt: string | null;
  consentIp: string | null;
  consentUa: string | null;
  amountCents: number;
  paidAt: string | null;
  src: string | null;
  offerVersion: string;
  jerseyEligible: boolean | null;
  /** The order was placed with an accepted invite code. */
  invited: boolean;
  referralCode: string | null;
  familyPublicId: string;
  code: string | null;
  kids: KidCtx[];
  geoCity: string | null;
  geoRegion: string | null;
  /** Validated IANA zone from the family geo (geo_tz), when known. */
  geoTz: string | null;
  /** Validated (attribution.ts FBP_RE / FBC_RE): the order's, else the family's. */
  fbp: string | null;
  fbc: string | null;
  /** Analytics S7: the order's last click (ekuzo_lc) and first touch (ekuzo_origin bucket). */
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  firstTouch: string | null;
  /** The last click's landing ad id (`lc.ad`, d1 to d99; s1-fast-track A2), when the order has one. */
  ad: string | null;
  /** Request origin recorded for test orders, when known. */
  origin: string | null;
  /** First name of the inviter's first kid, when the order was referred. */
  inviterKidName: string | null;
}

export interface FriendCtx {
  referralId: string;
  livemode: boolean;
  inviterEmail: string;
  inviterFirstName: string | null;
  inviterKidName: string | null;
  /** The inviter's code (the code the friend used). */
  code: string;
  friendKids: number;
  /** Live (pending or matured) friend kids across the inviter's referrals. */
  friendsTotal: number;
  joinerOrderRef: string | null;
  origin: string | null;
}

export interface RefundCtx {
  refundId: string;
  orderPublicId: string;
  amountRefundedCents: number;
  full: boolean;
  order: OrderCtx;
}

/** The public site in live mode; the recorded request origin (or the test deploy) otherwise. */
export const LIVE_ORIGIN = "https://ekuzo.gg";
export const TEST_ORIGIN_FALLBACK = "https://season1-commit--ekuzo.netlify.app";

const ORIGIN_RE = /^https?:\/\/[a-z0-9.-]+(:\d{1,5})?$/i;

export function resolveOrigin(livemode: boolean, recorded: string | null | undefined): string {
  if (livemode) return LIVE_ORIGIN;
  return recorded && ORIGIN_RE.test(recorded) ? recorded : TEST_ORIGIN_FALLBACK;
}

export function shareUrl(livemode: boolean, code: string | null, recordedOrigin: string | null | undefined): string {
  return code ? `${resolveOrigin(livemode, recordedOrigin)}/crew/${code}` : "";
}

export const dollars = (cents: number): number => Math.round(cents) / 100;

/** The `src` values the Committed event carries. */
export type EventSrc = "friend" | "karlin" | "ad" | "email" | "direct";

const PAID_MEDIUMS_SRC = new Set(["paid", "cpc", "ppc", "paid_social"]);
const PAID_SOURCES_SRC = new Set(["meta", "facebook", "fb", "ig", "instagram"]);
const lowSrc = (s: unknown) => String(s ?? "").trim().toLowerCase();

/**
 * The order's source for the Committed event (11-03: every event so far had a
 * blank `src`, because most orders arrive without `?src=`). Same first-match
 * order as the Discord Source line (senders/discord.ts formatSource), minus
 * the Klaviyo ad-name lookup, except that an email click comes before a paid
 * click: friend, karlin, email, a paid last click, a src of ad, a paid first
 * touch, then direct.
 */
export function eventSrc(
  o: Pick<OrderCtx, "src" | "invited" | "utmSource" | "utmMedium" | "utmContent" | "firstTouch">,
): EventSrc {
  const src = lowSrc(o.src);
  if (o.invited || src === "friend") return "friend";
  if (src === "karlin") return "karlin";
  // An email click wins over a paid one, so a stale Meta utm_source can never
  // turn an offer-email order (src=email, utm_medium=email) into "ad".
  if (lowSrc(o.utmMedium) === "email" || src === "email") return "email";
  const paidClick =
    PAID_MEDIUMS_SRC.has(lowSrc(o.utmMedium)) || (PAID_SOURCES_SRC.has(lowSrc(o.utmSource)) && lowSrc(o.utmContent) !== "");
  if (paidClick) return "ad";
  if (src === "ad" || src.startsWith("ad_")) return "ad";
  if (lowSrc(o.firstTouch).startsWith("paid_")) return "ad";
  return "direct";
}

/** The ladder: this many friends makes the season free. */
export const FRIENDS_TO_FREE = 4;

/** A send failed. `code` is PII-free and safe to store in last_error. */
export class SenderError extends Error {
  code: string;
  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

export type SendOutcome = {
  outcome: "sent" | "skipped_test" | "skipped_no_config" | "skipped_refunded";
  detail?: string;
};
