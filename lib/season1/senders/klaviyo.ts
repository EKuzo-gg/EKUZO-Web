import { lockInDate } from "../offer";
import {
  FRIENDS_TO_FREE,
  SenderError,
  dollars,
  shareUrl,
  type FriendCtx,
  type OrderCtx,
  type RefundCtx,
  type SendOutcome,
} from "./context";

/**
 * Season 01 Klaviyo sender (PM scope section 5, slice 3 contract).
 * Pure payload builders at the top, one network function at the bottom.
 * No kid data of a friend ever leaves in an inviter's payload, and no
 * `invited_by_kid` anywhere (T12).
 */

export const KLAVIYO_REVISION = "2025-07-15";
export const KLAVIYO_TIMEOUT_MS = 3500;

/** Test-mode isolation (O11): only these profiles may receive a test-mode event. */
export const S1_TEST_EMAIL_RE = /^(team\+s1test[^@]*|aaron\+[^@]*)@ekuzo\.gg$/i;

export function testEmailAllowed(email: string): boolean {
  return S1_TEST_EMAIL_RE.test(email.trim());
}

export interface KlaviyoEventInput {
  metric: string;
  email: string;
  firstName?: string | null;
  profileProps: Record<string, unknown>;
  props: Record<string, unknown>;
  time: string;
  uniqueId: string;
  value?: number;
}

/** The exact Committed property set (T12: no invited_by_kid). */
export const COMMITTED_PROPERTY_KEYS = [
  "order_id",
  "kids_count",
  "kid_name",
  "kid_age",
  "sibling_names",
  "amount_paid",
  "currency",
  "share_code",
  "share_url",
  "invited",
  "jersey_eligible",
  "lock_in_date",
  "refund_until",
  "src",
  "offer_version",
] as const;

const iso = (v: string | null | undefined) => (v ? new Date(v).toISOString() : new Date().toISOString());

export function buildCommittedEvent(o: OrderCtx): KlaviyoEventInput {
  const first = o.kids[0];
  const siblings = o.kids.slice(1).map((k) => k.firstName);
  const lockIn = lockInDate().toISOString();
  const url = shareUrl(o.livemode, o.code, o.origin);
  const props = {
    order_id: o.orderPublicId,
    kids_count: o.kids.length,
    kid_name: first?.firstName ?? "",
    kid_age: first?.age ?? null,
    sibling_names: siblings.join(", "),
    amount_paid: dollars(o.amountCents),
    currency: "USD",
    share_code: o.code ?? "",
    share_url: url,
    invited: o.invited,
    jersey_eligible: o.jerseyEligible === true,
    lock_in_date: lockIn,
    refund_until: lockIn,
    src: o.src ?? "",
    offer_version: o.offerVersion,
  };
  const profileProps: Record<string, unknown> = {
    season1_status: "committed",
    season1_committed_at: iso(o.paidAt),
    season1_kid_name: first?.firstName ?? "",
    season1_kids_count: o.kids.length,
    season1_code: o.code ?? "",
    season1_share_url: url,
    season1_invited: o.invited,
    season1_jersey_eligible: o.jerseyEligible === true,
    season1_offer: o.offerVersion,
  };
  if (o.phone) {
    // Saved the way the Text Karlin step does: a number to text, no SMS marketing consent.
    profileProps.season1_text_phone = o.phone;
    profileProps.season1_text_consent_at = iso(o.consentAt);
  }
  return {
    metric: "Season 01 Committed",
    email: o.email,
    firstName: o.parentFirstName,
    profileProps,
    props,
    time: iso(o.paidAt),
    uniqueId: o.orderPublicId,
    value: dollars(o.amountCents),
  };
}

export const FRIEND_JOINED_PROPERTY_KEYS = [
  "friend_kids",
  "friends_total",
  "credit_pending",
  "credits_to_free",
  "share_url",
] as const;

/** Inviter's event: counts and the share link only, never the friend's names. */
export function buildFriendJoinedEvent(f: FriendCtx, now: Date = new Date()): KlaviyoEventInput {
  const creditPending = Math.min(f.friendsTotal, FRIENDS_TO_FREE);
  const url = shareUrl(f.livemode, f.code, f.origin);
  return {
    metric: "Season 01 Friend Joined",
    email: f.inviterEmail,
    firstName: f.inviterFirstName,
    profileProps: {
      season1_friends_joined: f.friendsTotal,
      season1_credit_pending: creditPending,
    },
    props: {
      friend_kids: f.friendKids,
      friends_total: f.friendsTotal,
      credit_pending: creditPending,
      credits_to_free: Math.max(0, FRIENDS_TO_FREE - f.friendsTotal),
      share_url: url,
    },
    time: now.toISOString(),
    uniqueId: f.referralId,
  };
}

export const REFUNDED_PROPERTY_KEYS = ["order_id", "amount_refunded", "full", "kid_name"] as const;

export function buildRefundedEvent(r: RefundCtx, now: Date = new Date()): KlaviyoEventInput {
  return {
    metric: "Season 01 Refunded",
    email: r.order.email,
    firstName: r.order.parentFirstName,
    profileProps: r.full ? { season1_status: "refunded" } : {},
    props: {
      order_id: r.orderPublicId,
      amount_refunded: dollars(r.amountRefundedCents),
      full: r.full,
      kid_name: r.order.kids[0]?.firstName ?? "",
    },
    time: now.toISOString(),
    uniqueId: r.refundId,
  };
}

/** The Klaviyo `POST /api/events` body for one event. */
export function toRequestBody(e: KlaviyoEventInput) {
  return {
    data: {
      type: "event",
      attributes: {
        metric: { data: { type: "metric", attributes: { name: e.metric } } },
        profile: {
          data: {
            type: "profile",
            attributes: {
              email: e.email,
              ...(e.firstName ? { first_name: e.firstName } : {}),
              properties: e.profileProps,
            },
          },
        },
        properties: e.props,
        time: e.time,
        unique_id: e.uniqueId,
        ...(typeof e.value === "number" ? { value: e.value } : {}),
      },
    },
  };
}

/** Sends one event. Throws SenderError with a PII-free code on failure. */
export async function sendKlaviyoEvent(e: KlaviyoEventInput, livemode: boolean): Promise<SendOutcome> {
  if (!livemode && !testEmailAllowed(e.email)) return { outcome: "skipped_test" };
  const key = process.env.KLAVIYO_PRIVATE_API_KEY;
  if (!key) return { outcome: "skipped_no_config" };
  let res: Response;
  try {
    res = await fetch("https://a.klaviyo.com/api/events", {
      method: "POST",
      signal: AbortSignal.timeout(KLAVIYO_TIMEOUT_MS),
      headers: {
        Authorization: `Klaviyo-API-Key ${key}`,
        "Content-Type": "application/json",
        accept: "application/json",
        revision: KLAVIYO_REVISION,
      },
      body: JSON.stringify(toRequestBody(e)),
    });
  } catch (err) {
    throw new SenderError((err as Error)?.name === "TimeoutError" ? "klaviyo_timeout" : "klaviyo_network");
  }
  // Drain the body so the connection is released; never keep it (it can echo the profile).
  await res.text().catch(() => "");
  if (res.status !== 202 && !res.ok) throw new SenderError(`klaviyo_http_${res.status}`);
  return { outcome: "sent", detail: `http_${res.status}` };
}
