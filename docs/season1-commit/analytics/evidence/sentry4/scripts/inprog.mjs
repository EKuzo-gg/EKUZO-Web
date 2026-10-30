// Server F15 path: commit, confirm via Stripe test API, immediately re-commit the same attempt. Test mode only.
import crypto from 'node:crypto';
const BASE='https://season1-commit--ekuzo.netlify.app';const key=process.env.STRIPE_SECRET_KEY;if(!key.startsWith('sk_test_'))process.exit(2);
const email=`team+s1test-sentry4-inprog-${crypto.randomBytes(3).toString('hex')}@ekuzo.gg`;const attemptId=crypto.randomUUID();
const body={email,parentFirstName:'Quillon',phone:'',kids:[{firstName:'Pellanor',age:11}],consent:true,company:'',attemptId,expectedCents:10000};
const H={'content-type':'application/json',origin:BASE};
const ts=()=>new Date().toISOString();
const r1=await fetch(BASE+'/api/season1/commit',{method:'POST',headers:H,body:JSON.stringify(body)});const j1=await r1.json();
console.log(ts(),'commit1',r1.status,j1.orderId,j1.amountCents,'secret',j1.clientSecret?'present':'none','set-cookie s1_order',/s1_order=/.test(r1.headers.get('set-cookie')||''));
const pi=j1.clientSecret.split('_secret_')[0];
const c=await fetch(`https://api.stripe.com/v1/payment_intents/${pi}/confirm`,{method:'POST',headers:{authorization:'Bearer '+key,'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({payment_method:'pm_card_visa',return_url:BASE+'/season1/join/welcome'})});
const cj=await c.json();console.log(ts(),'stripe confirm',c.status,cj.status||cj.error&&cj.error.code);
const r2=await fetch(BASE+'/api/season1/commit',{method:'POST',headers:H,body:JSON.stringify(body)});const t2=await r2.text();const sc=r2.headers.get('set-cookie')||'';
console.log(ts(),'commit2 same attempt',r2.status,t2,'set-cookie s1_order',/s1_order=/.test(sc));
const ck=(sc.match(/s1_order=[^;]+/)||[])[0];
if(ck){for(let i=0;i<3;i++){const w=await fetch(BASE+'/season1/join/welcome',{headers:{cookie:ck}});const t=await w.text();console.log(ts(),'welcome',w.status,(t.match(/<title>([^<]*)/)||[])[1],/Pellanor/.test(t)?'kid shown':'',/You're in/.test(t)?'PAID':'');if(/You're in/.test(t))break;await new Promise(r=>setTimeout(r,3000))}}
console.log('email',email,'order',j1.orderId);
