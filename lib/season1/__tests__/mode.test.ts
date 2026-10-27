import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveMode } from "../mode";

const TEST_DB = "postgres://ep-lively-boat-b4fak1h6.us-east-2.aws.neon.tech/db";
const PROD_DB = "postgres://ep-other-prod-123456.us-east-2.aws.neon.tech/db";

describe("resolveMode", () => {
  it("unset + sk_test -> test", () => {
    assert.equal(resolveMode({ stripeKey: "sk_test_abc", databaseUrl: TEST_DB, host: "localhost:3000" }), "test");
    assert.equal(resolveMode({ envMode: "", stripeKey: "sk_test_abc", databaseUrl: TEST_DB }), "test");
    assert.equal(resolveMode({ envMode: undefined, stripeKey: "sk_test_abc", databaseUrl: TEST_DB }), "test");
  });
  it("unset + non-test key or no key -> off", () => {
    assert.equal(resolveMode({ stripeKey: "sk_live_abc", databaseUrl: TEST_DB, host: "ekuzo.gg" }), "off");
    assert.equal(resolveMode({ databaseUrl: TEST_DB }), "off");
    assert.equal(resolveMode({ stripeKey: "", databaseUrl: TEST_DB }), "off");
  });
  it("unset + sk_test but non-test DB -> off", () => {
    assert.equal(resolveMode({ stripeKey: "sk_test_abc", databaseUrl: PROD_DB }), "off");
  });
  it("test with non-test DB host or missing DB -> off", () => {
    assert.equal(resolveMode({ envMode: "test", stripeKey: "sk_test_abc", databaseUrl: PROD_DB }), "off");
    assert.equal(resolveMode({ envMode: "test", stripeKey: "sk_test_abc" }), "off");
    assert.equal(resolveMode({ envMode: "test", stripeKey: "sk_test_abc", databaseUrl: null }), "off");
  });
  it("test with a live key -> off", () => {
    assert.equal(resolveMode({ envMode: "test", stripeKey: "sk_live_abc", databaseUrl: TEST_DB }), "off");
  });
  it("test with good key and DB -> test (any host)", () => {
    assert.equal(resolveMode({ envMode: "test", stripeKey: "sk_test_abc", databaseUrl: TEST_DB, host: "deploy-preview-3--ekuzo.netlify.app" }), "test");
  });
  it("live only on ekuzo.gg / www.ekuzo.gg with sk_live", () => {
    for (const host of ["ekuzo.gg", "www.ekuzo.gg", "EKUZO.GG", "ekuzo.gg:443"]) {
      assert.equal(resolveMode({ envMode: "live", stripeKey: "sk_live_abc", databaseUrl: PROD_DB, host }), "live", host);
    }
  });
  it("live on a preview or other host -> off", () => {
    for (const host of ["deploy-preview-3--ekuzo.netlify.app", "localhost:3000", "evil-ekuzo.gg", "ekuzo.gg.evil.com", "", null, undefined]) {
      assert.equal(resolveMode({ envMode: "live", stripeKey: "sk_live_abc", databaseUrl: PROD_DB, host }), "off", String(host));
    }
  });
  it("live with a test key -> off", () => {
    assert.equal(resolveMode({ envMode: "live", stripeKey: "sk_test_abc", databaseUrl: TEST_DB, host: "ekuzo.gg" }), "off");
  });
  it("explicit off and unknown values -> off", () => {
    assert.equal(resolveMode({ envMode: "off", stripeKey: "sk_test_abc", databaseUrl: TEST_DB }), "off");
    assert.equal(resolveMode({ envMode: "maybe", stripeKey: "sk_test_abc", databaseUrl: TEST_DB }), "off");
  });
});
