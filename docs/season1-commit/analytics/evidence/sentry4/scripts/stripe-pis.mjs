// READ-ONLY Stripe test-mode lookup: PaymentIntents per customer email.
const key=process.env.STRIPE_SECRET_KEY;if(!key.startsWith('sk_test_')){console.error('not a test key');process.exit(2)}
const h={authorization:'Bearer '+key};
for(const email of process.argv.slice(2)){
 const c=await (await fetch('https://api.stripe.com/v1/customers?limit=10&email='+encodeURIComponent(email),{headers:h})).json();
 for(const cu of c.data||[]){const p=await (await fetch('https://api.stripe.com/v1/payment_intents?limit=20&customer='+cu.id,{headers:h})).json();
  console.log(email,cu.id,JSON.stringify((p.data||[]).map(x=>({id:x.id,amount:x.amount,status:x.status,created:new Date(x.created*1000).toISOString(),last_error:x.last_payment_error&&x.last_payment_error.code,order:x.metadata&&(x.metadata.order_public_id||x.metadata.orderId||x.metadata.order)}))))}
 if(!(c.data||[]).length)console.log(email,'no customer',c.error&&c.error.message)}
