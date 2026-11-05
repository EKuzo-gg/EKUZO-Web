import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { renderJoin } from "../joinPage";

const tpl = fs.readFileSync(path.join(process.cwd(), "app", "season1", "join", "b", "join-b.html"), "utf8");
const OPEN = new Date("2026-11-01T12:00:00-06:00");

describe("renderJoin", () => {
  it("open in test mode: CTAs, test bar, jersey line, config prices", () => {
    const h = renderJoin(tpl, { now: OPEN, mode: "test", src: null });
    assert.ok(h.includes("Season 01 is open"));
    assert.ok(!h.includes("Spots are limited."), "the jersey line is the urgency line before the cutoff");
    assert.ok(h.includes("until Nov 30"));
    assert.ok(h.includes("That's $580 for the whole season, which runs January to May, about $20 a practice."), "B's price FAQ carries the season total and the per-practice price");
    assert.ok(h.includes("Test mode. No real charges."));
    assert.ok(h.includes("<b>Free jersey</b> <small>First 100 families"));
    assert.ok(h.includes('href="/season1/join/signup"'));
    assert.ok(h.includes("Save their spot for $100"));
    assert.ok(!h.includes("Fully refundable"), "refund terms live in the terms, not the offer card");
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
    assert.ok(before.includes("<b>Free jersey</b> <small>First 100 families"));
    assert.ok(!at.includes("<b>Free jersey</b> <small>First 100 families"));
    assert.ok(at.includes("Spots are limited."), "after the cutoff the urgency line falls back to spots");
  });
  it("closed: mode off, before open, and at close", () => {
    for (const [now, mode] of [
      [OPEN, "off"],
      [new Date("2026-10-25T23:59:59-05:00"), "test"],
      [new Date("2026-12-31T23:59:59-08:00"), "test"],
    ] as const) {
      const h = renderJoin(tpl, { now, mode, src: "karlin" });
      assert.ok(h.includes("Signups are paused. Text our founder."));
      assert.ok(h.includes('href="/season1">Join the waitlist'));
      assert.ok(!h.includes("/season1/join/signup"));
      assert.ok(!h.includes("Season 01 is open"));
      assert.ok(!h.includes("Spots are limited."));
      assert.ok(h.includes('href="sms:+18322710150"'));
    }
  });
  it("opens exactly at openAt", () => {
    assert.ok(!renderJoin(tpl, { now: new Date("2026-10-26T00:00:00-05:00"), mode: "test", src: null }).includes("Signups are paused"));
  });
  it("src is carried to the CTAs only when passed (the route whitelists it)", () => {
    const h = renderJoin(tpl, { now: OPEN, mode: "test", src: "karlin" });
    assert.ok(h.includes('href="/season1/join/signup?src=karlin"'));
  });
  it("friend credit and ages come from config", () => {
    const h = renderJoin(tpl, { now: OPEN, mode: "test", src: null });
    assert.ok(h.includes("1 free month"), "B shows the friend credit as one month per friend");
    assert.ok(h.includes("Four friends, free season."));
    assert.ok(h.includes("We send your $100 back too."));
    assert.ok(h.includes("ages 9 to 17"));
  });
});

describe("renderJoin SEO block (R2-D5, R2-D6, R2-D8)", () => {
  const seoOf = (h: string) => h.match(/<!--SEO:start-->([\s\S]*?)<!--SEO:end-->/)![1];
  const ldOf = (h: string) => JSON.parse(seoOf(h).match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1]);
  const CLOSED = new Date("2027-01-02T12:00:00-08:00");

  it("default and indexable:false give exactly the noindex meta", () => {
    for (const seo of [undefined, { indexable: false }]) {
      assert.equal(seoOf(renderJoin(tpl, { now: OPEN, mode: "live", src: null, seo })), '<meta name="robots" content="noindex">');
    }
  });
  it("indexable: canonical constant, description, no robots meta, JSON-LD from offer.ts", () => {
    const h = renderJoin(tpl, { now: OPEN, mode: "live", src: "email", seo: { indexable: true } });
    const seo = seoOf(h);
    assert.ok(seo.includes('<link rel="canonical" href="https://ekuzo.gg/season1/join">'));
    assert.ok(seo.includes('<meta name="description" content="'));
    assert.ok(!/robots/i.test(seo));
    assert.ok(!h.includes("{{"));
    const ld = ldOf(h);
    const course = ld["@graph"].find((n: { "@type": string }) => n["@type"] === "Course");
    assert.equal(course.provider["@id"], "https://ekuzo.gg/#organization");
    assert.equal(course.courseMode, "online");
    assert.equal(course.offers.price, 580);
    assert.equal(course.offers.priceCurrency, "USD");
    assert.equal(course.offers.description, "$100 today covers January, then $160 a month February to April");
    assert.equal(course.offers.availability, "https://schema.org/InStock");
    assert.equal(course.offers.validThrough, "2026-12-31T23:59:59-08:00");
    assert.ok(ld["@graph"].some((n: { "@type": string }) => n["@type"] === "BreadcrumbList"));
    assert.ok(!JSON.stringify(ld).includes("FAQPage"));
  });
  it("stays indexed when closed: Offer SoldOut, same canonical", () => {
    for (const [now, mode] of [[CLOSED, "live"], [OPEN, "off"]] as const) {
      const h = renderJoin(tpl, { now, mode, src: null, seo: { indexable: true } });
      assert.ok(h.includes("Signups are paused"));
      assert.equal(ldOf(h)["@graph"][0].offers.availability, "https://schema.org/SoldOut");
      assert.ok(seoOf(h).includes("https://ekuzo.gg/season1/join"));
    }
  });
  it("escaping: `</script>`, U+2028 and U+2029 cannot break the block", async () => {
    const { escapeJsonLd } = await import("../../schema");
    const out = escapeJsonLd({ a: "x</script><script>alert(1)//\u2028\u2029" });
    assert.ok(!out.includes("<") && !out.includes("\u2028") && !out.includes("\u2029"));
    assert.equal(JSON.parse(out).a, "x</script><script>alert(1)//\u2028\u2029");
  });
});
