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
  it("RT14: skips a set but unknown product even with a parent_email", () => {
    for (const product of ["season2", "Camps", "camp", "s1", "ekuzo1000", "unknown"]) {
      assert.equal(shouldSkipLegacy({ metadata: { product, parent_email: "p@x.com" } }), true, product);
    }
  });
  it("RT14: known products with a parent_email are processed", () => {
    for (const product of ["camps", "ekuzo100", "ekuzo101", "teams"]) {
      assert.equal(shouldSkipLegacy({ metadata: { product, parent_email: "p@x.com" } }), false, product);
    }
  });
  it("RT14: missing or empty product with a parent_email keeps camps behaviour", () => {
    assert.equal(shouldSkipLegacy({ metadata: { parent_email: "p@x.com" } }), false);
    assert.equal(shouldSkipLegacy({ metadata: { product: "", parent_email: "p@x.com" } }), false);
  });
});
