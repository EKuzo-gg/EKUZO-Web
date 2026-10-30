import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * Analytics build, front end: the sign-up's commit handling for F15 (resolution
 * C2, money red team 3, 4, 6, 14), the busy progress line (S11), Pixel
 * InitiateCheckout (S3, C6) and the tap timestamp (S8). The pure decision
 * function is pulled out of the template and run; the wiring is checked in the
 * source. Copy is D5's recommended strings (03-copy-deck.md), verbatim.
 */
const html = fs.readFileSync(path.join(process.cwd(), "app", "season1", "join", "signup", "signup.html"), "utf8");
const src = /function commitNext\(st,e,cf,rt\)\{[^\n]*\}/.exec(html)?.[0] ?? "";
const commitNext = new Function(`${src}; return commitNext;`)() as (st: number, e: string, cf: boolean, rt: boolean) => string;
const payFn = html.slice(html.indexOf("async function pay(body,xev){"), html.indexOf("/* Speed pass 10-29: wake the commit API"));

describe("sign-up commit answers (F15, C2)", () => {
  it("in_progress always goes to the confirmation, before any 409 handling", () => {
    assert.equal(commitNext(409, "in_progress", false, false), "welcome");
    assert.equal(commitNext(409, "in_progress", true, true), "welcome");
  });
  it("in_progress_other shows its own message (no cookie, no order), confirmed or not", () => {
    assert.equal(commitNext(409, "in_progress_other", false, false), "error");
    assert.equal(commitNext(409, "in_progress_other", true, false), "error");
    assert.match(html, /function serverErr\(status,j\)\{\n var f=[^\n]*\n if\(e==='in_progress_other'\)\{/, "checked first in serverErr, before the generic 409");
  });
  it("attempt_busy retries once with the same attempt, then falls through", () => {
    assert.equal(commitNext(503, "attempt_busy", false, false), "retry");
    assert.equal(commitNext(503, "attempt_busy", false, true), "error");
    assert.match(payFn, /if\(nx==='retry'\)\{retried=true;await new Promise\(function\(r\)\{setTimeout\(r,1500\)\}\);continue\}/);
    assert.doesNotMatch(payFn.slice(payFn.indexOf("for(;;){"), payFn.indexOf("if(nx==='retry')")), /attemptId=/, "the body keeps its attemptId");
  });
  it("after confirmPayment was reached on this attempt, any failure goes to the confirmation (never 'not charged')", () => {
    for (const [st, e] of [[500, "server"], [503, "try_again"], [429, "rate_limited"], [409, "closed"], [409, "price_changed"], [503, "attempt_busy"], [0, ""]] as const)
      assert.equal(commitNext(st, e, true, false), "welcome", `${st} ${e}`);
    assert.match(payFn, /\}catch\(err\)\{\n  if\(wasConfirmed\(\)\)\{toWelcome\(\);return\}/, "network errors too");
  });
  it("without the flag, nothing can have been confirmed: the existing messages stay", () => {
    for (const [st, e] of [[500, "server"], [503, "try_again"], [429, "rate_limited"], [409, "closed"], [409, "duplicate_kid"], [422, ""]] as const)
      assert.equal(commitNext(st, e, false, false), "error", `${st} ${e}`);
  });
  it("the confirmed flag is set just before confirmPayment, keyed by attempt", () => {
    const set = payFn.indexOf("sessionStorage.setItem(confirmedKey(),'1')");
    const confirm = payFn.indexOf("var r=await stripe.confirmPayment(");
    assert.ok(set > 0 && confirm > set);
    assert.ok(!payFn.slice(set + 10, confirm).includes("await"), "nothing awaited between flag and confirm");
    assert.match(html, /function confirmedKey\(\)\{return 's1_confirmed_'\+attemptId\}/);
  });
  it("the attempt id is reused for the tab (s1_attempt), cleared by welcome's paid state", () => {
    assert.match(html, /try\{var sa=sessionStorage\.getItem\('s1_attempt'\)\|\|'';if\(\/\^\[A-Za-z0-9-\]\{8,64\}\$\/\.test\(sa\)\)attemptId=sa\}catch\(_\)\{\}\nif\(!attemptId\)\{/);
    const w = fs.readFileSync(path.join(process.cwd(), "app", "season1", "join", "welcome", "welcome.html"), "utf8");
    const paid = w.slice(w.indexOf("<!--paid-->"), w.indexOf("<!--/paid-->"));
    assert.match(paid, /sessionStorage\.removeItem\('s1_attempt'\)/);
  });
  it("D5 copy, verbatim: in_progress (then the confirmation after about 1.5 s) and in_progress_other with the text link", () => {
    assert.ok(html.includes("var IN_PROGRESS_MSG='Your payment is already going through. Taking you to your confirmation to check on it.';"));
    assert.match(payFn, /function toWelcome\(\)\{pf\(\);announce\(IN_PROGRESS_MSG\);if\(xev\)errEl\.textContent=IN_PROGRESS_MSG;setTimeout\(function\(\)\{location\.replace\('\/season1\/join\/welcome'\)\},1500\)\}/);
    assert.ok(html.includes("'A payment for this email is already going through. Your receipt will arrive in your inbox when it\\u0027s done. Questions? '"));
    assert.match(html, /ao\.href=sms;ao\.textContent='Text our founder';fo\.appendChild\(ao\);fo\.appendChild\(document\.createTextNode\('\.'\)\);/);
  });
  it("wallet: paymentFailed runs before any message (once)", () => {
    assert.match(payFn, /function pf\(\)\{if\(xev&&!pfDone\)\{pfDone=true;try\{xev\.paymentFailed\(\{reason:'fail'\}\)\}catch\(_\)\{\}\}\}/);
    assert.match(payFn, /pf\(\);serverErr\(res\.status,j\);fail\(\);return/);
    assert.match(payFn, /if\(sub\.error\)\{pf\(\);/);
    assert.match(payFn, /if\(r&&r\.error\)\{pf\(\);/);
  });
});

describe("sign-up busy line (S11, money 14)", () => {
  it("after 2 s the label becomes the D5 line, announced once in the status region", () => {
    assert.ok(html.includes("var BUSY_LINE='Still saving. Please stay here.'"));
    assert.match(html, /busyT=setTimeout\(function\(\)\{busyT=0;if\(!busy\)return;btn\.innerHTML='<span class="spin" aria-hidden="true"><\/span>'\+BUSY_LINE;g\('liveErr'\)\.textContent=BUSY_LINE\},2000\)/);
    assert.match(html, /<div id="liveErr" class="hp" aria-live="polite" role="status"><\/div>/);
  });
  it("the timer is cleared in setBusy (true and false), fail() and pageshow", () => {
    assert.match(html, /function setBusy\(b\)\{busy=b;clearBusyLine\(\);/);
    assert.match(html, /function clearBusyLine\(\)\{if\(busyT\)\{clearTimeout\(busyT\);busyT=0\}/);
    assert.match(payFn, /function fail\(\)\{[^}]*\}?[^\n]*setBusy\(false\)\}/);
    assert.match(html, /addEventListener\('pageshow',function\(e\)\{if\(e\.persisted\)\{clearBusyLine\(\);/);
  });
});

describe("sign-up InitiateCheckout and tap time (S3, C6, S8)", () => {
  it("fires at the pay tap (same point as season1_pay_submit), once per attempt, eventID sha256(attemptId)", () => {
    const submit = payFn.indexOf("ga('season1_pay_submit'");
    const ic = payFn.indexOf("initiateCheckout();");
    assert.ok(submit > 0 && ic > submit && ic < payFn.indexOf("await els.submit()"));
    assert.match(html, /var k='s1_ic_'\+attemptId;try\{if\(sessionStorage\.getItem\(k\)\)return;sessionStorage\.setItem\(k,'1'\)\}catch\(_\)\{\}/);
    assert.match(html, /crypto\.subtle\.digest\('SHA-256',new TextEncoder\(\)\.encode\(attemptId\)\)\.then\(function\(b\)\{s1px\('InitiateCheckout',p,/);
    assert.doesNotMatch(html, /s1px\('InitiateCheckout',p,attemptId\)/, "the raw attempt id never goes to Meta");
    assert.equal((html.match(/initiateCheckout\(\)/g) ?? []).length, 2, "defined once, called once (in pay)");
  });
  it("stores s1_tap at the pay tap", () => {
    assert.match(payFn, /sessionStorage\.setItem\('s1_tap',String\(performance\.timeOrigin\?performance\.timeOrigin\+performance\.now\(\):Date\.now\(\)\)\)/);
  });
});

/**
 * Lead 10-30 (open item 3): a confirm that resolves with an error (Stripe answered, nothing charged) clears
 * s1_confirmed_<attempt>; a confirm that throws keeps it. The real pay() and its helpers are pulled out of the
 * template and run against stubs (DOM, Stripe, fetch, sessionStorage, location).
 */
describe("sign-up confirmed flag after a Stripe answer (lead 10-30)", () => {
  const pick = (re: RegExp) => {
    const m = re.exec(html);
    assert.ok(m, String(re));
    return m[0];
  };
  const helpers = [
    pick(/function commitNext\(st,e,cf,rt\)\{[^\n]*\}/),
    pick(/var IN_PROGRESS_MSG='[^']*';/),
    pick(/function confirmedKey\(\)\{[^\n]*\}/),
    pick(/function wasConfirmed\(\)\{[^\n]*\}/),
    pick(/function keepConfirmed\(r\)\{[^\n]*\}/),
  ].join("\n");
  const keepConfirmed = new Function(`${helpers}; return keepConfirmed;`)() as (r: unknown) => boolean;

  type Res = { ok: boolean; status: number; json: () => Promise<unknown> };
  function harness() {
    const factory = new Function(`
      var calls={announce:[],replace:[],serverErr:[]},store=new Map();
      var sessionStorage={getItem:function(k){return store.has(k)?store.get(k):null},setItem:function(k,v){store.set(k,String(v))},removeItem:function(k){store.delete(k)}};
      var attemptId='att-12345678',secret=null,secretSig='',confirming=false,inviteRemoved=false,invite=null,IGNORED_MSG='ignored';
      var elements={submit:function(){return Promise.resolve({})}},xel=null,stripe=null,fetchImpl=null,dom={};
      function g(id){return dom[id]||(dom[id]={textContent:'',innerHTML:'',hidden:false})}
      function setBusy(){} function ga(){} function initiateCheckout(){} function showTotal(){} function renderInvite(){} function upd(){}
      function announce(m){calls.announce.push(m)} function totalCents(){return 10000} function money(c){return '$'+c/100}
      function serverErr(st,j){calls.serverErr.push([st,(j&&j.error)||''])}
      var location={origin:'https://ekuzo.gg',replace:function(u){calls.replace.push(u)}},window={location:location};
      var performance={timeOrigin:1,now:function(){return 1}};
      function setTimeout(fn){fn();return 0}
      function fetch(u,o){return fetchImpl(u,o)}
      ${helpers}
      ${payFn}
      return {pay:pay,calls:calls,store:store,set:function(s,f){stripe=s;fetchImpl=f}};`);
    return factory() as {
      pay: (body: Record<string, unknown>, xev: null) => Promise<void>;
      calls: { announce: string[]; replace: string[]; serverErr: [number, string][] };
      store: Map<string, string>;
      set: (stripe: unknown, fetch: (u: string) => Promise<Res>) => void;
    };
  }
  const reply = (status: number, j: unknown): Res => ({ ok: status >= 200 && status < 300, status, json: async () => j });
  const body = (kid: string) => ({ email: "p@example.com", parentFirstName: "Pat", phone: "", kids: [{ firstName: kid, age: 11 }] });
  const FLAG = "s1_confirmed_att-12345678";

  it("rule: an error answer clears the flag; success or redirect (no error) and unexpected_state keep it", () => {
    assert.equal(keepConfirmed({ error: { type: "card_error", code: "card_declined" } }), false);
    assert.equal(keepConfirmed({ error: { type: "card_error", code: "payment_intent_authentication_failure" } }), false);
    assert.equal(keepConfirmed({ error: { type: "invalid_request_error", code: "payment_intent_unexpected_state" } }), true);
    assert.equal(keepConfirmed({}), true);
    assert.equal(keepConfirmed(undefined), true);
  });

  it("decline, then a 429 on the same attempt: the normal message, no navigation", async () => {
    const h = harness();
    const answers = [reply(200, { clientSecret: "pi_1_secret_x", amountCents: 10000 }), reply(429, { error: "rate_limited" })];
    h.set({ confirmPayment: async () => ({ error: { type: "card_error", code: "card_declined", message: "Your card was declined." } }) }, async () => answers.shift()!);
    await h.pay(body("Maya"), null);
    assert.ok(h.calls.announce.includes("Your card was declined."));
    assert.equal(h.store.has(FLAG), false, "flag cleared by Stripe's answer");
    await h.pay(body("Mia"), null); // changed details: a new commit on the same attempt, answered 429
    assert.deepEqual(h.calls.serverErr, [[429, "rate_limited"]]);
    assert.deepEqual(h.calls.replace, []);
    assert.ok(!h.calls.announce.some((m) => /already going through/.test(m)));
  });

  it("decline, then a network error on the re-commit: the existing 'not charged' line, no navigation", async () => {
    const h = harness();
    let n = 0;
    h.set({ confirmPayment: async () => ({ error: { type: "card_error", code: "card_declined", message: "Declined." } }) }, async () => {
      if (n++ === 0) return reply(200, { clientSecret: "pi_1_secret_x", amountCents: 10000 });
      throw new TypeError("Failed to fetch");
    });
    await h.pay(body("Maya"), null);
    await h.pay(body("Mia"), null);
    assert.deepEqual(h.calls.replace, []);
    assert.match(h.calls.announce[h.calls.announce.length - 1], /Your card was not charged/);
  });

  it("network error after confirm (confirm throws): the flag stays and the parent goes to the confirmation", async () => {
    const h = harness();
    h.set({ confirmPayment: async () => { throw new TypeError("Failed to fetch"); } }, async () => reply(200, { clientSecret: "pi_1_secret_x", amountCents: 10000 }));
    await h.pay(body("Maya"), null);
    assert.equal(h.store.get(FLAG), "1");
    assert.deepEqual(h.calls.replace, ["/season1/join/welcome"]);
    assert.equal(h.calls.announce[h.calls.announce.length - 1], "Your payment is already going through. Taking you to your confirmation to check on it.");
    // A later failure on that attempt also goes to the confirmation, never "not charged".
    h.set({ confirmPayment: async () => ({}) }, async () => reply(429, { error: "rate_limited" }));
    await h.pay(body("Mia"), null);
    assert.deepEqual(h.calls.replace, ["/season1/join/welcome", "/season1/join/welcome"]);
    assert.deepEqual(h.calls.serverErr, []);
  });
});
