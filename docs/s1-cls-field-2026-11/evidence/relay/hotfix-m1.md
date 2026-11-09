# Slice 0 hotfix M-1 (Relay)

Branch `lane/relay`, 2026-11-09. Files: `app/season1/join/signup/signup.html` (2 added lines), `lib/season1/__tests__/signupCommit.test.ts` (new test inside the existing "sign-up confirmed flag after a Stripe answer" describe, which already runs the real `pay()` against stubs).

## Decision on `keepConfirmed`

`keepConfirmed` is unchanged (still true for `payment_intent_unexpected_state`), because the same code can mean the PaymentIntent already succeeded in another tab; there the flag must stay so a later commit failure sends the parent to the confirmation instead of saying "not charged". The new line does two things on that code only:

1. Always clears `secret` and `secretSig`, so the next tap re-commits (the server already cancels the dead order and mints a new PI, `commit/route.ts:369-388`). If the PI had actually succeeded, the re-commit hits the existing in-flight/duplicate guards (`in_progress` goes to the welcome page).
2. Clears the confirmed flag only when `error.payment_intent.status === 'canceled'`. A canceled PI cannot have charged, and a kept flag would send a 429 or price change on the re-commit to the "Checking on your payment" page, which would be wrong after three declines. This matches the money lens recommendation (drop the flag as well).

No copy change; Stripe's message stays on `#e-pay` through the existing line.

## Test

Drives the real `pay()` with a stubbed Stripe: three `card_declined`, then `payment_intent_unexpected_state` with `payment_intent.status: "canceled"`, then a fifth tap. Asserts: one commit across taps 1 to 4 (cached secret reused), Stripe's message on the error line, flag cleared at the canceled tap, a second commit on tap 5, and confirm on the fresh secret.

### On main's signup.html (test added, fix stashed): FAILS

```
not ok 5 - M-1: three declines, the webhook cancels the PaymentIntent, the next tap re-commits for a fresh one
  error: the next tap after unexpected_state re-commits
         1 !== 2
# tests 473  # pass 472  # fail 1  # skipped 0     (npm run test:s1 scope)
```

### On lane/relay: PASSES

```
# tests 473  # pass 473  # fail 0  # skipped 0     (lib/season1/__tests__)
npm test:
# tests 576
# pass 575
# fail 0
# skipped 1
```

Main baseline is 575 tests, 574 pass, 1 skipped; this adds one passing test.

## Diff

```diff
diff --git a/app/season1/join/signup/signup.html b/app/season1/join/signup/signup.html
index 3af83ae..9752a6f 100644
--- a/app/season1/join/signup/signup.html
+++ b/app/season1/join/signup/signup.html
@@ -565,6 +565,8 @@ async function pay(body,xev){
   confirming=true;
   var r=await stripe.confirmPayment({elements:els,clientSecret:secret,confirmParams:{return_url:window.location.origin+'/season1/join/welcome'}});
   if(!keepConfirmed(r)){try{sessionStorage.removeItem(confirmedKey())}catch(_){}}
+  /* M-1: the webhook cancels the PaymentIntent after three declines. Drop the cached secret so the next tap re-commits for a fresh one; a canceled PI cannot have charged, so its flag goes too. */
+  if(r&&r.error&&r.error.code==='payment_intent_unexpected_state'){secret=null;secretSig='';if(r.error.payment_intent&&r.error.payment_intent.status==='canceled'){try{sessionStorage.removeItem(confirmedKey())}catch(_){}}}
   if(r&&r.error){pf();var msg=r.error.message||'The payment did not go through. Try again or use another card.';errEl.textContent=msg;announce(msg);fail()}
  }catch(err){
   if(wasConfirmed()){toWelcome(CHECKING_MSG);return}
```

## Follow-up D20 (Steward F-1): fallback line for `payment_intent_unexpected_state`

Stripe's text for a canceled PI is developer wording a parent reads as "your sign-up was canceled". For this one code the page now shows its existing fallback line, "The payment did not go through. Try again or use another card." Every other error keeps Stripe's message. No new copy. Same one-line area as the M-1 change in `signup.html`.

Test extended (same M-1 test): after taps 1 to 3 the error line equals "Your card was declined." (plain `card_declined` keeps Stripe's text); after the canceled tap it equals the fallback line and the announce log does not contain Stripe's text; re-commit and flag assertions unchanged.

Output after rebase onto `origin/build/s1-cls-field` (ed1ea8f):

```
npm test:                 # tests 588  # pass 587  # fail 0  # skipped 1
season1 scope (test:s1):  # tests 485  # pass 485  # fail 0  # skipped 0
```

Diff:

```diff
diff --git a/app/season1/join/signup/signup.html b/app/season1/join/signup/signup.html
index 9752a6f..d702701 100644
--- a/app/season1/join/signup/signup.html
+++ b/app/season1/join/signup/signup.html
@@ -567,7 +567,7 @@ async function pay(body,xev){
   if(!keepConfirmed(r)){try{sessionStorage.removeItem(confirmedKey())}catch(_){}}
   /* M-1: the webhook cancels the PaymentIntent after three declines. Drop the cached secret so the next tap re-commits for a fresh one; a canceled PI cannot have charged, so its flag goes too. */
   if(r&&r.error&&r.error.code==='payment_intent_unexpected_state'){secret=null;secretSig='';if(r.error.payment_intent&&r.error.payment_intent.status==='canceled'){try{sessionStorage.removeItem(confirmedKey())}catch(_){}}}
-  if(r&&r.error){pf();var msg=r.error.message||'The payment did not go through. Try again or use another card.';errEl.textContent=msg;announce(msg);fail()}
+  if(r&&r.error){pf();var msg=(r.error.code==='payment_intent_unexpected_state'?'':r.error.message)||'The payment did not go through. Try again or use another card.';errEl.textContent=msg;announce(msg);fail()}
  }catch(err){
   if(wasConfirmed()){toWelcome(CHECKING_MSG);return}
   pf();announce(confirming?'We could not confirm your payment. Text our founder before you try again.':'Something hiccuped. Your card was not charged. Try again in a minute or text our founder.');fail()}
```
