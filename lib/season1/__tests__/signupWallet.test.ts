import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * F12 (docs/season1-commit/final/05-defects.md): the wallet row's room and the
 * "Or pay with card" divider are in the layout from first paint, so the card
 * form never moves down when Stripe reports a wallet. The row must never be
 * clipped to 0 px either (Stripe draws the buttons only once the frame is on
 * screen; a clipped row never draws).
 */
const html = fs.readFileSync(path.join(process.cwd(), "app", "season1", "join", "signup", "signup.html"), "utf8");
const css = /<style>([\s\S]*?)<\/style>/.exec(html)?.[1] ?? "";

describe("F12 sign-up wallet row", () => {
  it("holds the row's room and the divider from first paint", () => {
    assert.match(html, /<div class="xpw" id="xpWrap"><div class="xpbox"><div id="xp"><\/div><\/div>/);
    assert.match(css, /\.xpw\{margin-top:20px\}/);
    assert.match(css, /\.xpbox\{[^}]*min-height:56px/);
    assert.doesNotMatch(css, /\.xpw \.orpay\{display:none\}/, "the divider is not gated on availability");
    assert.doesNotMatch(css, /\.xpw\.on[^{]*\{[^}]*(min-height|margin-top)/, "no room added on availability");
  });
  it("only collapses (display none), never clips to 0 px", () => {
    assert.match(css, /\.xpw\.none\{display:none\}/);
    assert.doesNotMatch(css, /\.xpw[^{]*\{[^}]*(height:0|overflow:hidden)/);
  });
});
