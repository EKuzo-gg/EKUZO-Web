import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SECURITY_HEADERS, isCrossSite, isJsonContentType, shareOrigin } from "../httpGuard";

const req = (h: Record<string, string>) => new Request("http://localhost:3103/api/season1/commit", { method: "POST", headers: h });

describe("isCrossSite (security review L1, L2)", () => {
  it("Sec-Fetch-Site wins when present", () => {
    for (const v of ["same-origin", "same-site", "none", "Same-Origin"]) {
      assert.equal(isCrossSite(req({ host: "ekuzo.gg", "sec-fetch-site": v, origin: "https://evil.example" })), false, v);
    }
    for (const v of ["cross-site", "garbage", ""]) {
      assert.equal(isCrossSite(req({ host: "ekuzo.gg", "sec-fetch-site": v, origin: "https://ekuzo.gg" })), true, v);
    }
  });
  it("without Sec-Fetch-Site, Origin must name the raw host (port included)", () => {
    assert.equal(isCrossSite(req({ host: "ekuzo.gg", origin: "https://ekuzo.gg" })), false);
    assert.equal(isCrossSite(req({ host: "EKUZO.GG", origin: "https://ekuzo.gg" })), false);
    assert.equal(isCrossSite(req({ host: "localhost:3103", origin: "http://localhost:3103" })), false);
    assert.equal(isCrossSite(req({ host: "ekuzo.gg", origin: "https://evil.example" })), true);
    assert.equal(isCrossSite(req({ host: "ekuzo.gg", origin: "https://www.ekuzo.gg" })), true);
    assert.equal(isCrossSite(req({ host: "localhost:3103", origin: "http://localhost:3000" })), true);
    assert.equal(isCrossSite(req({ host: "ekuzo.gg", origin: "null" })), true);
    // Origin is compared with the raw host, never x-forwarded-host.
    assert.equal(isCrossSite(req({ host: "ekuzo.gg", "x-forwarded-host": "evil.example", origin: "https://evil.example" })), true);
  });
  it("no Sec-Fetch-Site and no Origin passes (server-to-server, tests)", () => {
    assert.equal(isCrossSite(req({ host: "ekuzo.gg" })), false);
  });
});

describe("isJsonContentType (L1)", () => {
  it("accepts application/json with or without parameters", () => {
    assert.equal(isJsonContentType(req({ "content-type": "application/json" })), true);
    assert.equal(isJsonContentType(req({ "content-type": "Application/JSON; charset=utf-8" })), true);
  });
  it("rejects form and text types and a missing header", () => {
    for (const ct of ["text/plain", "text/plain;charset=UTF-8", "application/x-www-form-urlencoded", "multipart/form-data; boundary=x", "application/jsonx"]) {
      assert.equal(isJsonContentType(req({ "content-type": ct })), false, ct);
    }
    assert.equal(isJsonContentType(new Request("http://x/", { method: "POST" })), false);
  });
});

describe("shareOrigin (L3)", () => {
  it("https from the raw host, http only for localhost", () => {
    assert.equal(shareOrigin("ekuzo.gg"), "https://ekuzo.gg");
    assert.equal(shareOrigin("deploy-preview-9--ekuzo.netlify.app"), "https://deploy-preview-9--ekuzo.netlify.app");
    assert.equal(shareOrigin("localhost:3103"), "http://localhost:3103");
    assert.equal(shareOrigin(null), "https://ekuzo.gg");
  });
});

describe("SECURITY_HEADERS (L7)", () => {
  it("DENY framing and nosniff", () => {
    assert.deepEqual({ ...SECURITY_HEADERS }, { "x-frame-options": "DENY", "x-content-type-options": "nosniff" });
  });
});
