import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * Jamie 10-29: with Apple Pay or Google Pay available the card form sits
 * behind "Or pay with card"; with Link only or no wallet it shows open with no
 * button. The state function is
 * pulled out of the template and run here.
 */
const html = fs.readFileSync(path.join(process.cwd(), "app", "season1", "join", "signup", "signup.html"), "utf8");
const css = /<style>([\s\S]*?)<\/style>/.exec(html)?.[1] ?? "";
const src = /function cardState\(avail,opened\)\{[^\n]*\}/.exec(html)?.[0] ?? "";
type Avail = { applePay: boolean; googlePay: boolean; link: boolean } | null;
const cardState = new Function(`${src}; return cardState;`)() as (a: Avail, o: boolean) => { open: boolean; toggle: boolean };
const none = { applePay: false, googlePay: false, link: false };

describe("sign-up card form behind Or pay with card", () => {
  it("state: collapsed with the button while unknown or with Apple Pay or Google Pay", () => {
    assert.deepEqual(cardState(null, false), { open: false, toggle: true });
    assert.deepEqual(cardState({ ...none, googlePay: true }, false), { open: false, toggle: true });
    assert.deepEqual(cardState({ ...none, applePay: true }, false), { open: false, toggle: true });
  });
  it("state: opened by the parent stays open, whatever Stripe reports later", () => {
    assert.deepEqual(cardState(null, true), { open: true, toggle: true });
    assert.deepEqual(cardState({ ...none, googlePay: true }, true), { open: true, toggle: true });
    assert.deepEqual(cardState(none, true), { open: true, toggle: false });
  });
  it("state: no wallet opens the card form and drops the button", () => {
    assert.deepEqual(cardState(none, false), { open: true, toggle: false });
  });
  it("state: Link only shows the card form open with no button (Link stays secondary)", () => {
    assert.deepEqual(cardState({ ...none, link: true }, false), { open: true, toggle: false });
  });
  it("state: shown open, a later Apple Pay or Google Pay report never collapses it", () => {
    assert.deepEqual(cardState({ ...none, googlePay: true, link: true }, true), { open: true, toggle: true });
    assert.match(html, /if\(s\.open\)cardOpen=true;/, "setCard latches the open state");
  });
  it("markup: a plain-text divider for the Link-only state, swapped with the button", () => {
    assert.match(html, /<p class="orpay orp" id="cardOr" hidden>Or pay with card<\/p><\/div>/);
    assert.match(html, /g\('cardTog'\)\.hidden=!s\.toggle;g\('cardOr'\)\.hidden=s\.toggle;/);
  });
  it("markup: a real button with aria wiring; card form and its pay button inside the collapsed section", () => {
    assert.match(html, /<button type="button" class="orpay" id="cardTog" aria-expanded="false" aria-controls="cardSec">/);
    const sec = /<div id="cardSec" class="cardsec shut" inert>([\s\S]*?)\n<\/div>/.exec(html)?.[1] ?? "";
    assert.match(sec, /<div id="pe"><\/div>/);
    assert.match(sec, /id="go" type="submit"/);
    assert.match(css, /\.cardsec\.shut\{height:0;overflow:hidden;visibility:hidden\}/);
  });
  it("markup: terms above both pay paths; the toggle lives in the wallet block (hidden with it)", () => {
    const terms = html.indexOf('id="terms"'), wrap = html.indexOf('id="xpWrap"'), tog = html.indexOf('id="cardTog"'), sec = html.indexOf('id="cardSec"');
    assert.ok(terms > 0 && terms < wrap && wrap < tog && tog < sec);
    assert.ok(html.indexOf("</div>", tog) < sec, "toggle closes inside #xpWrap before the card section");
  });
  it("submit never pays from a collapsed card form", () => {
    assert.match(html, /if\(!cardState\(xpAvail,cardOpen\)\.open\)return;/);
  });
});
