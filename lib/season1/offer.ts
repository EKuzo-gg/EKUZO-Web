/**
 * Season 01 commit offer config. Single source of truth for prices, windows
 * and limits. Every window is an ISO instant with an explicit offset; the
 * helpers below take injected dates and never read the clock.
 * Plain TS (no enums) so Node's type stripping can run it in tests.
 */

export const OFFER = {
  id: "s1-commit",
  version: "s1-commit-v1",
  currency: "usd",
  firstKidCents: 10000,
  siblingCents: 8000,
  monthlyCents: 16000,
  siblingMonthlyCents: 12800,
  seasonCents: 58000,
  siblingSeasonCents: 46400,
  friendCreditCents: 16000,
  /** Two 90-minute practices a week, about 8 a month. Copy only: "about $20 a practice". */
  practicesPerMonth: 8,
  maxKidsPerOrder: 4,
  ageMin: 9,
  ageMax: 17,
  ageCopyMin: 9,
  ageCopyMax: 17,
  openAt: "2026-10-26T00:00:00-05:00",
  jerseyCutoffAt: "2026-11-30T23:59:59-08:00",
  lockInAt: "2026-12-31T23:59:59-08:00",
  closeAt: "2026-12-31T23:59:59-08:00",
  textKarlinSms: "+18324438679",
  termsVersion: "s1-terms-2026-10-29",
  termsUrl: "/terms-of-service#season-01",
  privacyUrl: "/privacy-policy#season-01",
  /** Season dates for copy (decision 2, 10-29): first practice the week of Jan 18, last practice May 6. */
  seasonLabel: "mid January to May 6, 2027",
  /** The month the commitment payment covers. */
  firstMonthLabel: "January",
} as const;

/** Accepts a Date, ISO string, or epoch number (seconds if < 1e12, else ms). */
function toMs(value: Date | string | number): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value < 1e12 ? value * 1000 : value;
  return new Date(value).getTime();
}

/** The commit window: openAt <= now < closeAt. */
export function isOpen(now: Date): boolean {
  const t = now.getTime();
  return t >= Date.parse(OFFER.openAt) && t < Date.parse(OFFER.closeAt);
}

/**
 * Jersey eligibility: the PaymentIntent was created strictly before
 * jerseyCutoffAt. Pass a Date, ISO string, or Stripe's `created` (epoch
 * seconds) or epoch ms.
 */
export function isJerseyEligible(piCreatedAt: Date | string | number): boolean {
  const t = toMs(piCreatedAt);
  return Number.isFinite(t) && t < Date.parse(OFFER.jerseyCutoffAt);
}

/** The lock-in instant (refund-until date) as a Date. */
export function lockInDate(): Date {
  return new Date(OFFER.lockInAt);
}

/** "December 31, 2026" in Pacific time, from an ISO string or Date. */
export function formatDatePT(iso: string | Date): string {
  const d = iso instanceof Date ? iso : new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/**
 * Canary 10-29 ("nowhere on that flow does it say it's for the whole
 * season"): one factual line near the price, e.g. "Season 01 runs mid January
 * to May 6, 2027. Your $100 covers January." `paidCents` is what this order
 * pays today (the first kid's price on the join page).
 */
export function seasonLine(paidCents: number): string {
  const usd = `$${paidCents % 100 === 0 ? paidCents / 100 : (paidCents / 100).toFixed(2)}`;
  return `Season 01 runs ${OFFER.seasonLabel}. Your ${usd} covers ${OFFER.firstMonthLabel}.`;
}
