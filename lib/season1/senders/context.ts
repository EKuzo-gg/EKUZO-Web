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
  fbp: string | null;
  fbc: string | null;
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

export type SendOutcome = { outcome: "sent" | "skipped_test" | "skipped_no_config"; detail?: string };
