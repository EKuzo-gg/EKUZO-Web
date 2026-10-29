import { OFFER } from "./offer";

/**
 * Pure copy helpers for the paid state of /season1/join/welcome
 * (app/season1/join/welcome/route.ts). Prices come from offer.ts.
 */

const usd = (cents: number) => `$${cents % 100 === 0 ? cents / 100 : (cents / 100).toFixed(2)}`;

/**
 * The line under the receipt. One kid: the per-practice frame. Siblings: the
 * family's monthly total, so a sibling price never shows on a one-kid order.
 * Through a friend's code (decision 12, 10-29): one kid gets February free,
 * then monthly on Mar 15 and Apr 15. Siblings get the plain family line plus
 * "less your friend's credit" (Jamie 10-29: one free month only, no edge-case
 * explaining on screen).
 */
export function thenLine(kidCount: number, inviteApplied: boolean): string {
  const familyMonthly = OFFER.monthlyCents + OFFER.siblingMonthlyCents * (kidCount - 1);
  const kids = kidCount === 2 ? "both" : `all ${kidCount}`;
  if (kidCount === 1) {
    return inviteApplied
      ? `February is free with your friend's credit. Then ${usd(OFFER.monthlyCents)} on Mar 15 and Apr 15.`
      : `Then ${usd(OFFER.monthlyCents)} a month from Feb 15. About ${usd(Math.round(OFFER.monthlyCents / OFFER.practicesPerMonth))} a practice.`;
  }
  const family = `Then ${usd(familyMonthly)} a month for ${kids} kids from Feb 15`;
  return inviteApplied ? `${family}, less your friend's credit.` : `${family}.`;
}

/**
 * PR-8: the "How this discount works" ladder shows one-kid season prices. On a
 * multi-kid order it is labelled rather than recomputed. Empty for one kid.
 */
export function ladderNote(kidCount: number): string {
  return kidCount > 1 ? '<p style="font-size:14px;margin-top:8px">For your first kid.</p>' : "";
}
