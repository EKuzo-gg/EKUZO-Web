/**
 * Drop-off capture and same-device restart for the beta sign-up wizard (/season1/beta/start).
 * app/season1/beta/start/route.ts appends this script after the page's own, so Aaron's
 * start.html is not edited. It only reads the page: the form #wiz, its [data-step] sections,
 * the [data-next] buttons and the field names in HOOKS below (a test fails if the page stops
 * carrying any of them).
 *
 * What it does:
 *  - Each time the parent moves forward a step, posts the answers so far to /api/season-one
 *    (step "beta-progress", lib/season1/betaWizard.ts). ekuzo.gg only, the page's own rule.
 *  - Keeps the answers in this browser (localStorage, 14 days). On a return visit the wizard
 *    reopens on the step they left with their answers filled in. Cleared when the wizard is sent.
 *  - GA4 `beta_wizard_step {step}` once per step per wizard run and `beta_wizard_resume {step}`
 *    on a restored visit, for the drop-off funnel. Step names only: never the email, the
 *    player's name or any answer. Nothing goes to Meta.
 * It never blocks or changes the page's own flow: every call is wrapped, and a failure is silent.
 */
export const BETA_PROGRESS_HOOKS = {
  form: "wiz",
  fields: ["email", "pname", "age", "plays", "sports", "power", "fact", "vow", "tz", "times", "note"],
  steps: 5,
} as const;

export const BETA_PROGRESS_JS = String.raw`(function(){
  try{
    var f=document.getElementById("wiz"); if(!f) return;
    var steps=[].slice.call(f.querySelectorAll("[data-step]")); if(steps.length<5) return;
    var KEY="ekz_beta_wiz", TTL=14*864e5, LIVE=/(^|\.)ekuzo\.gg$/.test(location.hostname);
    var NAMES=["email","expectations","player_card"];
    var cur=function(){for(var i=0;i<steps.length;i++){if(!steps[i].hidden)return i}return 0};
    var vals=function(n){return [].map.call(f.querySelectorAll('[name="'+n+'"]:checked'),function(x){return x.value})};
    var v=function(n){var e=f.elements[n];return e&&typeof e.value==="string"?e.value.trim():""};
    var snap=function(){var age=parseInt(v("age"),10);return {email:v("email"),playerName:v("pname"),playerAge:age>=9&&age<=18?age:null,playsOn:vals("plays"),teamSports:(f.querySelector('[name="sports"]:checked')||{}).value||"",superpowers:vals("power"),funFact:v("fact"),expectations:vals("vow"),timeZone:v("tz"),times:vals("times"),note:v("note")}};
    var newId=function(){return (window.crypto&&crypto.randomUUID)?crypto.randomUUID():Date.now()+"-"+Math.random().toString(36).slice(2,12)};
    var st=null; try{var o=JSON.parse(localStorage.getItem(KEY)||"null"); if(o&&o.v===1&&typeof o.sid==="string"&&Date.now()-o.at<TTL) st=o}catch(_){}
    var fresh=!st; if(!st) st={v:1,at:Date.now(),sid:newId(),stage:-1,a:{},g:[]};
    if(!st.g||!st.g.push) st.g=[];
    var keep=function(){try{st.a=snap();st.at=Date.now();localStorage.setItem(KEY,JSON.stringify(st))}catch(_){}};
    var qs; try{qs=new URLSearchParams(location.search)}catch(_){qs={get:function(){return null}}}
    var utm=function(){var o={};["utm_source","utm_medium","utm_campaign","utm_content","utm_term"].forEach(function(k){o[k]=qs.get(k)||""});return o};
    var ga=function(n,p){try{if(LIVE&&window.gtag)gtag("event",n,p)}catch(_){}};
    var post=function(stage){
      if(!LIVE||stage<0||stage>2) return;
      try{var a=snap(); if(!a.email) return;
        fetch("/api/season-one",{method:"POST",keepalive:true,headers:{"Content-Type":"application/json"},body:JSON.stringify({step:"beta-progress",email:a.email,sessionId:st.sid,stage:stage,answers:a,attribution:utm(),page:location.pathname,ekz_hp:""})}).catch(function(){});
      }catch(_){}
    };
    var restoring=false, last=cur();
    var tick=function(){
      try{
        var c=cur(); if(c===last) return;
        if(c===4){ last=c; try{localStorage.removeItem(KEY)}catch(_){} st.done=true; return; }
        if(c>last&&!restoring){
          for(var s=last;s<c;s++){ post(s); if(st.g.indexOf(s)<0){ st.g.push(s); ga("beta_wizard_step",{step:NAMES[s]}); } }
        }
        last=c; if(c-1>st.stage) st.stage=c-1; keep();
      }catch(_){}
    };
    if(window.MutationObserver){ var mo=new MutationObserver(tick); steps.forEach(function(s){mo.observe(s,{attributes:true,attributeFilter:["hidden"]})}); }
    else { f.addEventListener("click",function(){setTimeout(tick,0)}); }
    f.addEventListener("input",function(){ if(!restoring&&!st.done&&cur()<4) keep(); });
    // Same-device restart: fill what they entered, then walk forward with the page's own Continue buttons (its checks still apply).
    if(!fresh&&st.stage>=0&&st.a&&st.a.email){
      restoring=true;
      try{
        var a=st.a, set=function(n,x){var e=f.elements[n]; if(e&&typeof x==="string"&&x) e.value=x};
        var tick2=function(n,list){[].forEach.call(f.querySelectorAll('[name="'+n+'"]'),function(x){x.checked=(list||[]).indexOf(x.value)>=0})};
        set("email",a.email); set("pname",a.playerName); if(a.playerAge) set("age",String(a.playerAge)); set("fact",a.funFact); set("tz",a.timeZone); set("note",a.note);
        tick2("plays",a.playsOn); tick2("power",a.superpowers); tick2("vow",a.expectations); tick2("times",a.times); tick2("sports",a.teamSports?[a.teamSports]:[]);
        try{f.dispatchEvent(new Event("input",{bubbles:true}))}catch(_){}
        var want=Math.min(st.stage+1,3);
        for(var i=0;i<want;i++){ var at=cur(), b=steps[at].querySelector("[data-next]"); if(!b) break; b.click(); if(cur()===at) break; }
      }catch(_){}
      last=cur(); restoring=false;
      if(last>0){ ga("beta_wizard_resume",{step:NAMES[last-1]||""}); post(last-1); }
    }
  }catch(_){}
})();`;
