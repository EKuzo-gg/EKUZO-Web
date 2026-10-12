// Test runner note (per docs/blog-newsletter/02-contract.md section 7 and
// 01-requirements.md T4): this module is TypeScript with no build step in
// this checkout. Run with:
//
//   node --experimental-strip-types docs/blog-newsletter/tests/newsletterAb.test.mjs
//
// Node's built-in type-stripping (available on the checkout's node v22.22.2)
// loads lib/newsletterAb.ts directly via a plain ESM import below; no
// transpile-to-temp-file step is used.

import test from "node:test";
import assert from "node:assert/strict";
import {
  VARIANT_KEY,
  DISMISSED_AT_KEY,
  SUBSCRIBED_AT_KEY,
  DISMISS_WINDOW_MS,
  SUBSCRIBED_WINDOW_MS,
  getOrAssignVariant,
  shouldShowPopup,
  recordDismiss,
  recordSuccess,
  isBlogPostPath,
} from "../../../lib/newsletterAb.ts";

function makeStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    _map: map,
  };
}

function throwingStorage() {
  return {
    getItem() {
      throw new Error("storage disabled");
    },
    setItem() {
      throw new Error("storage disabled");
    },
  };
}

// ---------------------------------------------------------------------------
// T4: getOrAssignVariant distribution
// ---------------------------------------------------------------------------

test("getOrAssignVariant: 10,000 draws with Math.random land between 48% and 52% thumbs", () => {
  let thumbsCount = 0;
  const N = 10000;
  for (let i = 0; i < N; i++) {
    const storage = makeStorage();
    const variant = getOrAssignVariant(storage, Math.random);
    if (variant === "thumbs") thumbsCount++;
  }
  const pct = (thumbsCount / N) * 100;
  assert.ok(
    pct >= 48 && pct <= 52,
    `expected thumbs share between 48% and 52%, got ${pct}%`
  );
});

test("getOrAssignVariant: random() < 0.5 assigns thumbs, persists it", () => {
  const storage = makeStorage();
  const variant = getOrAssignVariant(storage, () => 0.1);
  assert.equal(variant, "thumbs");
  assert.equal(storage.getItem(VARIANT_KEY), "thumbs");
});

test("getOrAssignVariant: random() >= 0.5 assigns classic, persists it", () => {
  const storage = makeStorage();
  const variant = getOrAssignVariant(storage, () => 0.9);
  assert.equal(variant, "classic");
  assert.equal(storage.getItem(VARIANT_KEY), "classic");
});

test("getOrAssignVariant: a stored valid value always wins, never reassigned", () => {
  const storage = makeStorage({ [VARIANT_KEY]: "classic" });
  // random() would assign "thumbs" if it were consulted at all.
  const variant = getOrAssignVariant(storage, () => 0.0);
  assert.equal(variant, "classic");
});

test("getOrAssignVariant: an invalid stored value is treated as unassigned", () => {
  const storage = makeStorage({ [VARIANT_KEY]: "garbage" });
  const variant = getOrAssignVariant(storage, () => 0.1);
  assert.equal(variant, "thumbs");
  assert.equal(storage.getItem(VARIANT_KEY), "thumbs");
});

test("getOrAssignVariant: storage throwing returns 'thumbs' and stores nothing", () => {
  const storage = throwingStorage();
  const variant = getOrAssignVariant(storage, () => 0.9); // would be classic if consulted
  assert.equal(variant, "thumbs");
});

// ---------------------------------------------------------------------------
// T4: isBlogPostPath
// ---------------------------------------------------------------------------

test("isBlogPostPath: cases from the contract", () => {
  assert.equal(isBlogPostPath("/blog"), false);
  assert.equal(isBlogPostPath("/blog/"), false);
  assert.equal(isBlogPostPath("/blog/some-post"), true);
  assert.equal(isBlogPostPath("/blog/some-post/"), true);
  assert.equal(isBlogPostPath("/blog/author/karlin-oei"), false);
  assert.equal(isBlogPostPath("/"), false);
  assert.equal(isBlogPostPath("/blogger"), false);
});

// ---------------------------------------------------------------------------
// T4: shouldShowPopup windows
// ---------------------------------------------------------------------------

test("shouldShowPopup: dismissed 29 days ago is still within the window (false)", () => {
  const now = 1_000_000_000_000;
  const dismissedAt = now - 29 * 24 * 60 * 60 * 1000;
  const storage = makeStorage({ [DISMISSED_AT_KEY]: String(dismissedAt) });
  assert.equal(shouldShowPopup(storage, now), false);
});

test("shouldShowPopup: dismissed 31 days ago is outside the window (true)", () => {
  const now = 1_000_000_000_000;
  const dismissedAt = now - 31 * 24 * 60 * 60 * 1000;
  const storage = makeStorage({ [DISMISSED_AT_KEY]: String(dismissedAt) });
  assert.equal(shouldShowPopup(storage, now), true);
});

test("shouldShowPopup: subscribed 364 days ago is still within the window (false)", () => {
  const now = 1_000_000_000_000;
  const subscribedAt = now - 364 * 24 * 60 * 60 * 1000;
  const storage = makeStorage({ [SUBSCRIBED_AT_KEY]: String(subscribedAt) });
  assert.equal(shouldShowPopup(storage, now), false);
});

test("shouldShowPopup: subscribed 366 days ago is outside the window (true)", () => {
  const now = 1_000_000_000_000;
  const subscribedAt = now - 366 * 24 * 60 * 60 * 1000;
  const storage = makeStorage({ [SUBSCRIBED_AT_KEY]: String(subscribedAt) });
  assert.equal(shouldShowPopup(storage, now), true);
});

test("shouldShowPopup: no stored timestamps at all is true", () => {
  const storage = makeStorage();
  assert.equal(shouldShowPopup(storage, Date.now()), true);
});

test("shouldShowPopup: storage throwing defaults to showing (true)", () => {
  const storage = throwingStorage();
  assert.equal(shouldShowPopup(storage, Date.now()), true);
});

test("shouldShowPopup: window boundaries are named constants matching 30/365 days", () => {
  assert.equal(DISMISS_WINDOW_MS, 30 * 24 * 60 * 60 * 1000);
  assert.equal(SUBSCRIBED_WINDOW_MS, 365 * 24 * 60 * 60 * 1000);
});

// ---------------------------------------------------------------------------
// T4: recordDismiss / recordSuccess write the keys
// ---------------------------------------------------------------------------

test("recordDismiss writes DISMISSED_AT_KEY with the given now", () => {
  const storage = makeStorage();
  recordDismiss(storage, 12345);
  assert.equal(storage.getItem(DISMISSED_AT_KEY), "12345");
});

test("recordSuccess writes SUBSCRIBED_AT_KEY with the given now", () => {
  const storage = makeStorage();
  recordSuccess(storage, 67890);
  assert.equal(storage.getItem(SUBSCRIBED_AT_KEY), "67890");
});

test("recordDismiss: storage throwing is swallowed, never throws", () => {
  const storage = throwingStorage();
  assert.doesNotThrow(() => recordDismiss(storage, Date.now()));
});

test("recordSuccess: storage throwing is swallowed, never throws", () => {
  const storage = throwingStorage();
  assert.doesNotThrow(() => recordSuccess(storage, Date.now()));
});

test("recordDismiss then shouldShowPopup: dismissal actually suppresses the popup", () => {
  const storage = makeStorage();
  const now = 2_000_000_000_000;
  recordDismiss(storage, now);
  assert.equal(shouldShowPopup(storage, now + 1000), false);
  assert.equal(
    shouldShowPopup(storage, now + DISMISS_WINDOW_MS + 1000),
    true
  );
});

test("recordSuccess then shouldShowPopup: success actually suppresses the popup", () => {
  const storage = makeStorage();
  const now = 2_000_000_000_000;
  recordSuccess(storage, now);
  assert.equal(shouldShowPopup(storage, now + 1000), false);
  assert.equal(
    shouldShowPopup(storage, now + SUBSCRIBED_WINDOW_MS + 1000),
    true
  );
});
