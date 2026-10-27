import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveMode, deployContext } from "../mode";

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
  const LIVE = {
    envMode: "live",
    stripeKey: "sk_live_abc",
    publishableKey: "pk_live_abc",
    databaseUrl: PROD_DB,
    webhookSecret: "whsec_abc",
    context: "production",
    host: "ekuzo.gg",
  };
  it("RT17: live only with every live condition met", () => {
    for (const host of ["ekuzo.gg", "www.ekuzo.gg", "EKUZO.GG", "ekuzo.gg:443"]) {
      assert.equal(resolveMode({ ...LIVE, host }), "live", host);
    }
  });
  it("RT17: live on a preview or other host -> off", () => {
    for (const host of ["deploy-preview-3--ekuzo.netlify.app", "localhost:3000", "evil-ekuzo.gg", "ekuzo.gg.evil.com", "", null, undefined]) {
      assert.equal(resolveMode({ ...LIVE, host }), "off", String(host));
    }
  });
  it("RT17: live with a test secret key -> off", () => {
    assert.equal(resolveMode({ ...LIVE, stripeKey: "sk_test_abc" }), "off");
    assert.equal(resolveMode({ ...LIVE, stripeKey: "" }), "off");
    assert.equal(resolveMode({ ...LIVE, stripeKey: "rk" + "_live_abc" }), "off");
  });
  it("RT17: live without a pk_live_ publishable key -> off", () => {
    assert.equal(resolveMode({ ...LIVE, publishableKey: "pk_test_abc" }), "off");
    assert.equal(resolveMode({ ...LIVE, publishableKey: undefined }), "off");
  });
  it("RT17: live pointed at the test DB, or no DB -> off", () => {
    assert.equal(resolveMode({ ...LIVE, databaseUrl: TEST_DB }), "off");
    assert.equal(resolveMode({ ...LIVE, databaseUrl: "" }), "off");
    assert.equal(resolveMode({ ...LIVE, databaseUrl: null }), "off");
  });
  it("RT17: live without the S1 webhook secret -> off", () => {
    assert.equal(resolveMode({ ...LIVE, webhookSecret: "" }), "off");
    assert.equal(resolveMode({ ...LIVE, webhookSecret: "  " }), "off");
    assert.equal(resolveMode({ ...LIVE, webhookSecret: undefined }), "off");
  });
  it("RT17: live outside the production deploy context -> off", () => {
    for (const context of ["deploy-preview", "branch-deploy", "dev", "Production", "", null, undefined]) {
      assert.equal(resolveMode({ ...LIVE, context }), "off", String(context));
    }
  });
  it("live with only the old inputs (key + host) -> off", () => {
    assert.equal(resolveMode({ envMode: "live", stripeKey: "sk_live_abc", databaseUrl: PROD_DB, host: "ekuzo.gg" }), "off");
  });
  it("deployContext prefers S1_DEPLOY_CONTEXT, then CONTEXT", () => {
    assert.equal(deployContext({ S1_DEPLOY_CONTEXT: "production", CONTEXT: "dev" }), "production");
    assert.equal(deployContext({ CONTEXT: "deploy-preview" }), "deploy-preview");
    assert.equal(deployContext({}), "");
  });
  it("explicit off and unknown values -> off", () => {
    assert.equal(resolveMode({ envMode: "off", stripeKey: "sk_test_abc", databaseUrl: TEST_DB }), "off");
    assert.equal(resolveMode({ envMode: "maybe", stripeKey: "sk_test_abc", databaseUrl: TEST_DB }), "off");
  });
});
