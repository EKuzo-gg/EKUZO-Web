import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { renderJoin } from "../joinPage";

const tpl = fs.readFileSync(path.join(process.cwd(), "app", "season1", "join", "join.html"), "utf8");
const OPEN = new Date("2026-11-01T12:00:00-06:00");

describe("renderJoin", () => {
  it("open in test mode: CTAs, test bar, jersey line, config prices", () => {
    const h = renderJoin(tpl, { now: OPEN, mode: "test", src: null });
    assert.ok(h.includes("Season 01 is open"));
    assert.ok(h.includes("Spots are limited."));
    assert.ok(h.includes("Test mode. No real charges."));
    assert.ok(h.includes("Free jersey for the first 100 families"));
    assert.ok(h.includes('href="/season1/join/signup"'));
    assert.ok(h.includes("Save their spot &middot; $100"));
    assert.ok(h.includes(`Fully refundable until December 31, 2026, and any time we can't place your kid</a>`));
    assert.ok(!h.includes("{{"));
    assert.ok(!h.includes("$522"));
    assert.ok(!h.includes("Signups are paused"));
  });
  it("live mode has no test bar", () => {
    assert.ok(!renderJoin(tpl, { now: OPEN, mode: "live", src: null }).includes("Test mode"));
  });
  it("jersey line: shown before the cutoff, hidden at and after it", () => {
    const before = renderJoin(tpl, { now: new Date("2026-11-30T23:59:58-08:00"), mode: "test", src: null });
    const at = renderJoin(tpl, { now: new Date("2026-11-30T23:59:59-08:00"), mode: "test", src: null });
    assert.ok(before.includes("Free jersey for the first 100 families"));
    assert.ok(!at.includes("Free jersey for the first 100 families"));
  });
  it("closed: mode off, before open, and at close", () => {
    for (const [now, mode] of [
      [OPEN, "off"],
      [new Date("2026-10-25T23:59:59-05:00"), "test"],
      [new Date("2026-12-31T23:59:59-08:00"), "test"],
    ] as const) {
      const h = renderJoin(tpl, { now, mode, src: "karlin" });
      assert.ok(h.includes("Signups are paused. Text Karlin."));
      assert.ok(h.includes('href="/season1">Join the waitlist'));
      assert.ok(!h.includes("/season1/join/signup"));
      assert.ok(!h.includes("Season 01 is open"));
      assert.ok(!h.includes("Spots are limited."));
      assert.ok(h.includes('href="sms:+18324438679"'));
    }
  });
  it("opens exactly at openAt", () => {
    assert.ok(!renderJoin(tpl, { now: new Date("2026-10-26T00:00:00-05:00"), mode: "test", src: null }).includes("Signups are paused"));
  });
  it("src is carried to the CTAs only when passed (the route whitelists it)", () => {
    const h = renderJoin(tpl, { now: OPEN, mode: "test", src: "karlin" });
    assert.ok(h.includes('href="/season1/join/signup?src=karlin"'));
  });
  it("ladder and ages come from config", () => {
    const h = renderJoin(tpl, { now: OPEN, mode: "test", src: null });
    assert.ok(h.includes("Your season: $420") && h.includes("<b>$260</b>") && h.includes("<b>$100</b>"));
    assert.ok(h.includes("4 friends</span><b>Free. We refund your $100.</b>"));
    assert.ok(h.includes("ages 10 to 17"));
  });
});
