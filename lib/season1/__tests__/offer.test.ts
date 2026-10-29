import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { OFFER, isOpen, isJerseyEligible, lockInDate, formatDatePT, seasonLine } from "../offer";

const ms = (iso: string) => Date.parse(iso);

describe("OFFER config", () => {
  it("has the frozen values", () => {
    assert.equal(OFFER.textKarlinSms, "+18324438679");
    assert.equal(OFFER.firstKidCents, 10000);
    assert.equal(OFFER.siblingCents, 8000);
    assert.equal(OFFER.maxKidsPerOrder, 4);
    assert.equal(OFFER.ageMin, 9);
    assert.equal(OFFER.ageMax, 17);
  });
  it("every window is an ISO instant with an explicit offset", () => {
    for (const k of ["openAt", "jerseyCutoffAt", "lockInAt", "closeAt"] as const) {
      assert.match(OFFER[k], /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d[+-]\d\d:\d\d$/);
      assert.ok(Number.isFinite(ms(OFFER[k])));
    }
  });
});

describe("isOpen (openAt <= now < closeAt)", () => {
  const open = ms(OFFER.openAt);
  const close = ms(OFFER.closeAt);
  it("openAt boundary", () => {
    assert.equal(isOpen(new Date(open - 1)), false);
    assert.equal(isOpen(new Date(open)), true);
    assert.equal(isOpen(new Date(open + 1)), true);
  });
  it("closeAt boundary", () => {
    assert.equal(isOpen(new Date(close - 1)), true);
    assert.equal(isOpen(new Date(close)), false);
    assert.equal(isOpen(new Date(close + 1)), false);
  });
  it("mid window is open", () => {
    assert.equal(isOpen(new Date("2026-11-15T12:00:00Z")), true);
  });
});

describe("isJerseyEligible (created strictly before jerseyCutoffAt)", () => {
  const cut = ms(OFFER.jerseyCutoffAt);
  it("one ms before / at / after", () => {
    assert.equal(isJerseyEligible(new Date(cut - 1)), true);
    assert.equal(isJerseyEligible(new Date(cut)), false);
    assert.equal(isJerseyEligible(new Date(cut + 1)), false);
  });
  it("accepts ISO strings, epoch ms and Stripe epoch seconds", () => {
    assert.equal(isJerseyEligible(new Date(cut - 1000).toISOString()), true);
    assert.equal(isJerseyEligible(cut - 1000), true);
    assert.equal(isJerseyEligible(Math.floor(cut / 1000) - 1), true);
    assert.equal(isJerseyEligible(Math.floor(cut / 1000) + 1), false);
  });
  it("is Pacific, not UTC: 11:59 pm PT Nov 30 qualifies, 12:00 am PT Dec 1 does not", () => {
    assert.equal(isJerseyEligible("2026-12-01T07:59:58Z"), true);
    assert.equal(isJerseyEligible("2026-12-01T08:00:00Z"), false);
  });
  it("garbage is not eligible", () => {
    assert.equal(isJerseyEligible("nope"), false);
  });
});

describe("lockInDate / formatDatePT", () => {
  it("lockInDate is the lockInAt instant", () => {
    assert.equal(lockInDate().getTime(), ms(OFFER.lockInAt));
  });
  it("formats in Pacific time regardless of process TZ", () => {
    assert.equal(formatDatePT(OFFER.lockInAt), "December 31, 2026");
    assert.equal(formatDatePT(lockInDate()), "December 31, 2026");
    assert.equal(formatDatePT("2026-11-30T23:59:59-08:00"), "November 30, 2026");
    // 05:00 UTC Jan 1 is still Dec 31 in Pacific
    assert.equal(formatDatePT("2027-01-01T05:00:00Z"), "December 31, 2026");
  });
});

describe("seasonLine (canary 10-29)", () => {
  it("states the season dates and what today's payment covers", () => {
    assert.equal(seasonLine(OFFER.firstKidCents), "Season 01 runs mid January to May 6, 2027. Your $100 covers January.");
    assert.equal(seasonLine(18000), "Season 01 runs mid January to May 6, 2027. Your $180 covers January.");
  });
  it("has no em or en dashes", () => {
    assert.doesNotMatch(seasonLine(10000), /[\u2013\u2014]/);
  });
});
