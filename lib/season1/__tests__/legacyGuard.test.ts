import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { shouldSkipLegacy } from "../legacyGuard";

describe("shouldSkipLegacy", () => {
  it("skips season1 PaymentIntents", () => {
    assert.equal(shouldSkipLegacy({ metadata: { product: "season1", parent_email: "a@b.co" } }), true);
    assert.equal(shouldSkipLegacy({ metadata: { product: "season1" } }), true);
  });
  it("skips when parent_email is missing or empty", () => {
    assert.equal(shouldSkipLegacy({ metadata: { product: "camps" } }), true);
    assert.equal(shouldSkipLegacy({ metadata: { product: "camps", parent_email: "" } }), true);
    assert.equal(shouldSkipLegacy({ metadata: { product: "camps", parent_email: "  " } }), true);
    assert.equal(shouldSkipLegacy({ metadata: {} }), true);
    assert.equal(shouldSkipLegacy({ metadata: null }), true);
    assert.equal(shouldSkipLegacy({}), true);
  });
  it("processes camps and ekuzo100 with a parent_email", () => {
    assert.equal(shouldSkipLegacy({ metadata: { product: "camps", parent_email: "p@x.com" } }), false);
    assert.equal(shouldSkipLegacy({ metadata: { product: "ekuzo100", parent_email: "p@x.com" } }), false);
    assert.equal(shouldSkipLegacy({ metadata: { parent_email: "p@x.com" } }), false);
  });
});
