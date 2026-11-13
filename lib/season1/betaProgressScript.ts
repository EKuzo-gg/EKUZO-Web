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
 *  - Restart link (docs/beta-restart-link-2026-11/02-frozen-spec.md): /season1/beta/r/<token> sets the flag cookie
 *    ekuzo_brf and sends the parent here. With the flag present the script asks POST /api/season1-beta/restore
 *    (any host: it only reads). A saved run in this browser wins over the link. Otherwise: "resume" shows a panel
 *    (masked email, "Pick up where I left off" or "Start fresh") and loads nothing until the tap; "done" shows the
 *    page's own end screen; "none" shows one line. A link restore sends no progress post and no step event.
 *  - Time zone: guesses the select from the table BETA_ZONE_LABELS (US and Canadian zones); a saved zone is
 *    restored only when the parent chose it by hand (tzSet), and a link restore never sets it.
 *  - GA4: `beta_wizard_step {step}` once per step per wizard run and `beta_wizard_resume {step, via}`
 *    (via "device" or "link"; step "done" for a finished family), for the drop-off funnel. Step names only: never the
 *    email, the player's name or any answer. Nothing goes to Meta.
 * It never blocks or changes the page's own flow: every call is wrapped, and a failure is silent.
 */
export const BETA_PROGRESS_HOOKS = {
  form: "wiz",
  fields: ["email", "pname", "age", "plays", "sports", "power", "fact", "vow", "tz", "times", "note"],
  steps: 5,
} as const;

type ZoneLabel = "Eastern" | "Central" | "Mountain" | "Pacific" | "Alaska" | "Hawaii" | "Other";
const zones = (label: ZoneLabel, names: string[]): [string, ZoneLabel][] => names.map((n) => [n, label]);

/**
 * Browser IANA zone to the wizard's time zone option, by winter UTC offset: 5 Eastern, 6 Central, 7 Mountain,
 * 8 Pacific, 9 Alaska, 10 Hawaii. Every US and Canadian zone and the `US/` and `Canada/` aliases. The page has
 * no Atlantic or Newfoundland option yet, so those read Other (it shows as "Outside the US"). Any other zone that
 * starts America/, US/ or Canada/ reads Other too (the script's rule); a zone from elsewhere is left as the page
 * set it. Written into the script from this one object.
 */
export const BETA_ZONE_LABELS: Record<string, ZoneLabel> = Object.fromEntries([
  ...zones("Eastern", [
    "America/New_York", "America/Detroit", "America/Toronto", "America/Montreal", "America/Nipigon", "America/Thunder_Bay",
    "America/Iqaluit", "America/Pangnirtung", "America/Atikokan", "America/Coral_Harbour",
    "America/Kentucky/Louisville", "America/Kentucky/Monticello", "America/Louisville",
    "America/Indiana/Indianapolis", "America/Indiana/Vincennes", "America/Indiana/Winamac", "America/Indiana/Marengo",
    "America/Indiana/Petersburg", "America/Indiana/Vevay", "America/Indianapolis", "America/Fort_Wayne",
    "US/Eastern", "US/Michigan", "US/East-Indiana", "Canada/Eastern",
  ]),
  ...zones("Central", [
    "America/Chicago", "America/Menominee", "America/Indiana/Tell_City", "America/Indiana/Knox", "America/Knox_IN",
    "America/North_Dakota/Center", "America/North_Dakota/New_Salem", "America/North_Dakota/Beulah",
    "America/Winnipeg", "America/Rainy_River", "America/Rankin_Inlet", "America/Resolute", "America/Regina", "America/Swift_Current",
    "US/Central", "US/Indiana-Starke", "Canada/Central", "Canada/Saskatchewan",
  ]),
  ...zones("Mountain", [
    "America/Denver", "America/Boise", "America/Phoenix", "America/Shiprock", "America/Edmonton", "America/Cambridge_Bay",
    "America/Inuvik", "America/Yellowknife", "America/Creston", "America/Dawson_Creek", "America/Fort_Nelson",
    "America/Whitehorse", "America/Dawson",
    "Navajo", "US/Mountain", "US/Arizona", "Canada/Mountain", "Canada/Yukon",
  ]),
  ...zones("Pacific", ["America/Los_Angeles", "America/Vancouver", "US/Pacific", "Canada/Pacific"]),
  ...zones("Alaska", [
    "America/Anchorage", "America/Juneau", "America/Sitka", "America/Metlakatla", "America/Yakutat", "America/Nome", "US/Alaska",
  ]),
  ...zones("Hawaii", ["Pacific/Honolulu", "Pacific/Johnston", "America/Adak", "America/Atka", "US/Hawaii", "US/Aleutian"]),
  ...zones("Other", [
    "America/Halifax", "America/Glace_Bay", "America/Moncton", "America/Goose_Bay", "America/Blanc-Sablon", "America/St_Johns",
    "America/Puerto_Rico", "America/St_Thomas", "America/Virgin", "Canada/Atlantic", "Canada/Newfoundland",
  ]),
]);

export const BETA_PROGRESS_JS = String.raw`(function(){
  try{
    var f=document.getElementById("wiz"); if(!f) return;
    var steps=[].slice.call(f.querySelectorAll("[data-step]")); if(steps.length<5) return;
    var KEY="ekz_beta_wiz", TTL=14*864e5, LIVE=/(^|\.)ekuzo\.gg$/.test(location.hostname);
    var NAMES=["email","expectations","player_card"];
    var ZL=${JSON.stringify(BETA_ZONE_LABELS)}, RESTORE="/api/season1-beta/restore";
    var dots=[].slice.call(document.querySelectorAll("#dots li")), pane=null;
    var cur=function(){for(var i=0;i<steps.length;i++){if(!steps[i].hidden)return i}return 0};
    var vals=function(n){return [].map.call(f.querySelectorAll('[name="'+n+'"]:checked'),function(x){return x.value})};
    var v=function(n){var e=f.elements[n];return e&&typeof e.value==="string"?e.value.trim():""};
    var snap=function(){var age=parseInt(v("age"),10);return {email:v("email"),playerName:v("pname"),playerAge:age>=9&&age<=18?age:null,playsOn:vals("plays"),teamSports:(f.querySelector('[name="sports"]:checked')||{}).value||"",superpowers:vals("power"),funFact:v("fact"),expectations:vals("vow"),timeZone:v("tz"),times:vals("times"),note:v("note")}};
    var newId=function(){return (window.crypto&&crypto.randomUUID)?crypto.randomUUID():Date.now()+"-"+Math.random().toString(36).slice(2,12)};
    var st=null; try{var o=JSON.parse(localStorage.getItem(KEY)||"null"); if(o&&o.v===1&&typeof o.sid==="string"&&Date.now()-o.at<TTL) st=o}catch(_){}
    var fresh=!st; if(!st) st={v:1,at:Date.now(),sid:newId(),stage:-1,a:{},g:[]};
    if(!st.g||!st.g.push) st.g=[];
    // Time zone guess: our table first (the page's own guess misses Canada and many US zones); a hand pick is recorded as tzSet.
    var tzEl=f.elements.tz;
    try{ var zn=Intl.DateTimeFormat().resolvedOptions().timeZone||"", lab=Object.prototype.hasOwnProperty.call(ZL,zn)?ZL[zn]:(/^(America|US|Canada)\//.test(zn)?"Other":"");
      if(lab&&tzEl&&tzEl.querySelector('option[value="'+lab+'"]')) tzEl.value=lab; }catch(_){}
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
    if(tzEl) tzEl.addEventListener("change",function(){ st.tzSet=true; keep(); });
    var restoring=false, last=cur();
    var tick=function(){
      try{
        if(pane&&cur()!==0) drop();
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
    f.addEventListener("input",function(){ if(!restoring&&pane) drop(); if(!restoring&&!st.done&&cur()<4) keep(); });
    // Fill the saved answers, then walk forward with the page's own Continue buttons (its checks still apply).
    // The time zone is set only when asked (a hand pick was saved); a link never sets it.
    var refill=function(a,stage,tzToo){
      restoring=true;
      try{
        var set=function(n,x){var e=f.elements[n]; if(e&&typeof x==="string"&&x) e.value=x};
        var tick2=function(n,list){[].forEach.call(f.querySelectorAll('[name="'+n+'"]'),function(x){x.checked=(list||[]).indexOf(x.value)>=0})};
        set("email",a.email); set("pname",a.playerName); if(a.playerAge) set("age",String(a.playerAge)); set("fact",a.funFact); if(tzToo) set("tz",a.timeZone); set("note",a.note);
        tick2("plays",a.playsOn); tick2("power",a.superpowers); tick2("vow",a.expectations); tick2("times",a.times); tick2("sports",a.teamSports?[a.teamSports]:[]);
        try{f.dispatchEvent(new Event("input",{bubbles:true}))}catch(_){}
        var want=Math.min(stage+1,3);
        for(var i=0;i<want;i++){ var at=cur(), b=steps[at].querySelector("[data-next]"); if(!b) break; b.click(); if(cur()===at) break; }
      }catch(_){}
      last=cur(); restoring=false;
    };
    // Same-device restart.
    if(!fresh&&st.stage>=0&&st.a&&st.a.email){
      refill(st.a,st.stage,!!st.tzSet);
      if(last>0){ ga("beta_wizard_resume",{step:NAMES[last-1]||"",via:"device"}); post(last-1); }
    }
    // Restart link arrival: /season1/beta/r/<token> set the flag cookie. Nothing is loaded until the parent taps.
    var el=function(tag,cls,txt){var e=document.createElement(tag); if(cls) e.className=cls; if(txt) e.textContent=txt; return e};
    var drop=function(){ if(pane&&pane.parentNode) pane.parentNode.removeChild(pane); pane=null };
    var put=function(node){ steps[0].insertBefore(node,steps[0].firstChild) };
    var untouched=function(){var a=snap(); return cur()===0&&!a.email&&!a.playerName&&!a.playerAge&&!a.funFact&&!a.note&&!a.teamSports&&!a.playsOn.length&&!a.superpowers.length&&!a.expectations.length&&!a.times.length};
    var dropFlag=function(){try{document.cookie="ekuzo_brf=; Path=/season1/beta; Max-Age=0; Secure; SameSite=Lax"}catch(_){}};
    var ask=function(body){
      var once=function(){return fetch(RESTORE,{method:"POST",credentials:"same-origin",cache:"no-store",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}).then(function(r){return r.json().then(function(j){return {s:r.status,j:j}},function(){return {s:r.status,j:null}})},function(){return null})};
      return once().then(function(a){ if(a&&a.s!==503) return a; return new Promise(function(ok){setTimeout(ok,1500)}).then(once) });
    };
    var good=function(a,state){return !!(a&&a.s===200&&a.j&&a.j.ok&&a.j.state===state)};
    // The page's own end screen, as show(4) leaves it: only the last section visible, the three progress dots in their final state.
    var finish=function(){
      try{
        drop();
        steps.forEach(function(x,n){x.hidden=n!==4});
        dots.forEach(function(d){d.classList.remove("on");d.classList.add("was");d.removeAttribute("aria-current")});
        var h=steps[4].querySelector("h2"); if(h) h.focus({preventScroll:true});
        var dl=document.getElementById("dots"); if(dl) dl.scrollIntoView({block:"start",behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth"});
      }catch(_){}
      last=4; try{localStorage.removeItem(KEY)}catch(_){} st.done=true;
      ga("beta_wizard_resume",{step:"done",via:"link"});
    };
    var runOut=function(){
      if(!untouched()) return;
      var box=el("div"); box.setAttribute("role","status"); box.style.cssText="margin-bottom:22px;padding-bottom:22px;border-bottom:2px solid #000";
      box.appendChild(el("p","lede","That link has run out. Start below and your answers will save as you go."));
      put(box);
    };
    var pickUp=function(j){
      var A=j.answers&&typeof j.answers==="object"?j.answers:{}, g=[], stage=Math.max(0,Math.min(2,parseInt(j.stage,10)||0));
      var a={email:j.email,playerName:A.playerName||"",playerAge:A.playerAge||null,playsOn:A.playsOn||[],teamSports:A.teamSports||"",superpowers:A.superpowers||[],funFact:A.funFact||"",expectations:A.expectations||[],timeZone:"",times:[],note:""};
      for(var i=0;i<=stage;i++) g.push(i);
      drop();
      st.sid=String(j.sessionId); st.stage=stage; st.g=g; st.a=a; st.at=Date.now(); st.tzSet=false; st.done=false;
      refill(a,stage,false);
      keep();
      if(last>0) ga("beta_wizard_resume",{step:NAMES[last-1]||"",via:"link"});
      try{ var sec=steps[cur()], fld=sec&&sec.querySelector("input,select,textarea"); if(fld&&fld.focus) fld.focus({preventScroll:true}); }catch(_){}
    };
    var offer=function(mask){
      if(!untouched()) return;
      drop();
      var box=el("div"), head=el("p","sub","Welcome back."), acts=el("div","acts"), start=el("button","btn back","Start fresh"), go=el("button","btn","Pick up where I left off");
      box.setAttribute("role","status"); box.style.cssText="margin-bottom:22px;padding-bottom:22px;border-bottom:2px solid #000"; head.style.marginTop="0";
      start.type="button"; go.type="button";
      box.appendChild(head); box.appendChild(el("p","lede","Your answers are saved under "+String(mask).slice(0,120)+". Pick up where you left off?"));
      acts.appendChild(start); acts.appendChild(go); box.appendChild(acts);
      start.addEventListener("click",function(){
        ask({clear:true}).catch(function(){}); drop();
        try{ var e=f.elements.email; if(e&&e.focus) e.focus({preventScroll:true}); }catch(_){}
      });
      go.addEventListener("click",function(){
        go.disabled=true; start.disabled=true;
        ask({confirm:true}).then(function(a){
          if(good(a,"resume")&&typeof a.j.email==="string"&&typeof a.j.sessionId==="string") return pickUp(a.j);
          if(good(a,"done")) return finish();
          if(good(a,"none")){ drop(); return runOut(); }
          go.disabled=false; start.disabled=false;
        }).catch(function(){ go.disabled=false; start.disabled=false; });
      });
      put(box); pane=box;
    };
    if(/(?:^|;\s*)ekuzo_brf=1(?:;|$)/.test(document.cookie)){
      if(!fresh&&st.stage>=0&&st.a&&st.a.email){
        // This browser already holds a run: it wins. Drop the link's cookies and carry on.
        ask({clear:true}).then(function(a){ if(a&&a.s===200) dropFlag() }).catch(function(){});
      } else {
        ask({}).then(function(a){
          if(!a||a.s!==200||!a.j||!a.j.ok) return;
          dropFlag();
          if(a.j.state==="resume"&&typeof a.j.emailMask==="string") offer(a.j.emailMask);
          else if(a.j.state==="done"){ if(untouched()) finish(); }
          else if(a.j.state==="none") runOut();
        }).catch(function(){});
      }
    }
  }catch(_){}
})();`;
