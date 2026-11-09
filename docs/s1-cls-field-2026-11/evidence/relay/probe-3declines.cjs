// Probe M-1: after the webhook cancels the PaymentIntent on the third failed payment
// (app/api/season1/stripe-webhook/route.ts:121-129), does the shipped signup page ever
// ask the commit API for a new PaymentIntent, or does it keep confirming the dead one?
// No server: Playwright route() serves the shipped signup.html and stubs Stripe.js and the API.
const { chromium } = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs");
const path = require("path");

const html = fs
  .readFileSync(path.join("/home/claude/ekuzo-web/app/season1/join/signup/signup.html"), "utf8")
  .split("__S1_CONFIG__")
  .join(JSON.stringify({ publishableKey: "pk_test_probe", mode: "live", open: true, prices: { first: 10000, sibling: 8000, monthly: 16000, siblingMonthly: 12800 }, maxKids: 4, textKarlinSms: "+18322710150" }))
  .split("{{URL_ALLOW}}").join("")
  .split("{{TAGS}}").join("");

const STRIPE_STUB = `
window.__confirms=[];
window.Stripe=function(){
  function el(){var h={};return {mount:function(){},on:function(e,cb){h[e]=cb;if(e==='ready')setTimeout(cb,10);if(e==='availablepaymentmethodschange')setTimeout(function(){cb({paymentMethods:null})},10)},update:function(){},focus:function(){}}}
  return {
    elements:function(){return {create:function(){return el()},submit:async function(){return {}},update:function(){}}},
    confirmPayment:async function(o){
      window.__confirms.push(o.clientSecret);
      var n=window.__confirms.filter(function(s){return s===o.clientSecret}).length;
      // Stripe: three declines on this PI, then the webhook has canceled it.
      if(n<=3) return {error:{type:'card_error',code:'card_declined',message:'Your card was declined.'}};
      return {error:{type:'invalid_request_error',code:'payment_intent_unexpected_state',message:'You cannot confirm this PaymentIntent because it has a status of canceled.',payment_intent:{status:'canceled'}}};
    }
  };
};`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let commits = 0;
  await page.route("**/*", async (route) => {
    const u = new URL(route.request().url());
    if (u.hostname === "js.stripe.com") return route.fulfill({ contentType: "application/javascript", body: STRIPE_STUB });
    if (u.pathname === "/season1/join/signup") return route.fulfill({ contentType: "text/html", body: html });
    if (u.pathname === "/api/season1/commit") {
      commits++;
      return route.fulfill({ contentType: "application/json", body: JSON.stringify({ clientSecret: `pi_probe${commits}_secret_x`, orderId: `ord${commits}`, amountCents: 10000, invite: "none" }) });
    }
    if (u.pathname === "/api/season1/warm") return route.fulfill({ status: 204, body: "" });
    return route.fulfill({ status: 404, body: "" });
  });
  await page.goto("https://probe.ekuzo.test/season1/join/signup");
  await page.waitForTimeout(200);
  await page.fill(".kid .nm", "Sam");
  await page.selectOption(".kid .ag", "11");
  await page.fill("#pname", "Pat");
  await page.fill("#email", "pat@example.com");
  await page.check("#terms");
  const out = [];
  for (let tap = 1; tap <= 6; tap++) {
    await page.click("#go");
    await page.waitForFunction(() => !document.getElementById("go").disabled, null, { timeout: 5000 });
    out.push({ tap, commitsSoFar: commits, ePay: await page.textContent("#e-pay") });
  }
  console.log(JSON.stringify({ confirms: await page.evaluate(() => window.__confirms), taps: out }, null, 1));
  await browser.close();
})();
