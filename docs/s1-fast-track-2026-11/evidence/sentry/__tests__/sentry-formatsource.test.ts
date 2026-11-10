import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatSource, needsAdNameLookup } from "../../../../../lib/season1/senders/discord";
const base = { src: null, invited: false, utmSource: null, utmMedium: null, utmCampaign: null, utmContent: null, firstTouch: null, ad: "d19" } as any;
describe("Sentry: formatSource with lc.ad (Atlas follow-up cases a to d)", () => {
  it("(a) share link: no name organic; with a name ad d11-a (via organic)", () => {
    const o = { ...base, utmSource: "share", utmMedium: "referral" };
    assert.equal(formatSource(o), "organic"); assert.equal(formatSource(o, "d11-a"), "ad d11-a (via organic)"); assert.equal(needsAdNameLookup(o), true);
  });
  it("(b) email click: email s01-open; with a name ad d11-a (via email)", () => {
    const o = { ...base, utmMedium: "email", utmCampaign: "s01-open" };
    assert.equal(formatSource(o), "email s01-open"); assert.equal(formatSource(o, "d11-a"), "ad d11-a (via email)"); assert.equal(needsAdNameLookup(o), true);
  });
  it("(c) src=ad, ad=d19, no utm: ad d19, with and without a name", () => {
    const o = { ...base, src: "ad" };
    assert.equal(formatSource(o), "ad d19"); assert.equal(formatSource(o, "d11-a"), "ad d19"); assert.equal(needsAdNameLookup(o), false);
  });
  it("(d) paid_social and cpc without content: ad d19", () => {
    for (const m of ["paid_social", "cpc"]) { const o = { ...base, utmMedium: m }; assert.equal(formatSource(o), "ad d19"); assert.equal(needsAdNameLookup(o), false); }
  });
  it("extra: utm_content wins over lc.ad; ad null equals main behaviour", () => {
    assert.equal(formatSource({ ...base, utmMedium: "paid_social", utmContent: "d19-a" }), "ad d19-a");
    assert.equal(formatSource({ ...base, src: "ad", ad: null }), formatSource({ ...base, src: "ad", ad: null }));
    assert.equal(formatSource({ ...base, src: "ad", ad: null }), "organic");
  });
});
