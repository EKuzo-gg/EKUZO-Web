import { JSDOM, CookieJar } from "jsdom";
import fs from "node:fs";
const page = fs.readFileSync(process.env.HOME + "/work/ekuzo-web/app/season1/beta/start/start.html", "utf8").replace("{{TAGS}}", "").replace("{{BUILD}}", "x");
const script = fs.readFileSync("/tmp/jsd/script.js", "utf8");
const shim = `<script>(function(){var f=document.getElementById("wiz");["email","pname","age","fact","tz","note","plays","power","times","vow"].forEach(function(n){Object.defineProperty(f,n,{get(){return this.elements[n]}})});Object.defineProperty(f,"sports",{get(){return {value:(this.querySelector("[name=sports]:checked")||{}).value||""}}})})()</script>`;
const html = page.replace("</main>", "</main>"+shim).replace("</body>", () => `<script>${script}</script>\n</body>`);

async function load({ tz = "America/New_York", cookie = "ekuzo_brf=1", local = null, responses = {}, host = "ekuzo.gg" }) {
  process.env.TZ = tz;
  const jar = new CookieJar();
  const url = `https://${host}/season1/beta/start`;
  if (cookie) jar.setCookieSync(cookie + "; Path=/season1/beta; Secure", url);
  const calls = [], gtags = [];
  const dom = new JSDOM(html, {
    url, runScripts: "dangerously", pretendToBeVisual: true, cookieJar: jar,
    beforeParse(w) {
      w.Element.prototype.scrollIntoView = function () {};
      w.matchMedia = () => ({ matches: false });
      w.gtag = (...a) => gtags.push(a);
      if (local) w.localStorage.setItem("ekz_beta_wiz", JSON.stringify(local));
      w.fetch = async (u, init) => {
        const body = init && init.body ? JSON.parse(init.body) : null;
        calls.push({ u, body });
        let r = null;
        if (u === "/api/season1-beta/restore") {
          const q = responses.queue ? responses.queue.shift() : null;
          r = q || (body && body.clear ? { s: 200, j: { ok: true, state: "none" } } : body && body.confirm ? responses.confirm : responses.ask);
        }
        if (!r) r = { s: 200, j: { ok: true } };
        if (r === "network") throw new Error("net");
        return { status: r.s, json: async () => r.j };
      };
    },
  });
  return { dom, w: dom.window, d: dom.window.document, calls, gtags, jar };
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const visible = (d) => [...d.querySelectorAll("[data-step]")].map((s, i) => (s.hidden ? "" : i)).join("");
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log("FAIL", m); } else console.log("ok  ", m); };

// A: zones
for (const [tz, want] of [["America/Vancouver", "Pacific"], ["America/Toronto", "Eastern"], ["America/Winnipeg", "Central"], ["America/Regina", "Central"], ["America/Edmonton", "Mountain"], ["America/Boise", "Mountain"], ["America/Indiana/Tell_City", "Central"], ["America/Kentucky/Louisville", "Eastern"], ["America/Phoenix", "Mountain"], ["Pacific/Honolulu", "Hawaii"], ["America/Anchorage", "Alaska"], ["America/Halifax", "Other"], ["America/St_Johns", "Other"], ["America/Puerto_Rico", "Other"], ["America/Mexico_City", "Other"], ["America/Bogota", "Other"], ["Europe/London", "Other"], ["US/Pacific", "Pacific"], ["Canada/Saskatchewan", "Central"], ["America/Whitehorse", "Mountain"]]) {
  const { d } = await load({ tz, cookie: null });
  ok(d.getElementById("tz").value === want, `zone ${tz} -> ${d.getElementById("tz").value} (want ${want})`);
}
{ // hand pick recorded
  const { w, d } = await load({ tz: "America/Vancouver", cookie: null });
  const tz = d.getElementById("tz"); tz.value = "Eastern"; tz.dispatchEvent(new w.Event("change", { bubbles: true }));
  ok(JSON.parse(w.localStorage.getItem("ekz_beta_wiz")).tzSet === true, "tzSet recorded on hand change");
}
// F: no flag => no restore call (M8)
{ const { calls } = await load({ cookie: null }); await wait(50); ok(calls.filter((c) => c.u.includes("restore")).length === 0, "no flag, no restore call"); }
const ANS = { playerName: "Maya", playerAge: 12, playsOn: ["Console"], teamSports: "Loves them", superpowers: ["Quick thinker"], funFact: "Knows flags", expectations: ["No toxicity", "Positive mindset", "Winning attitude"] };
// B: resume
{
  const { w, d, calls, gtags } = await load({ tz: "America/Vancouver", responses: { ask: { s: 200, j: { ok: true, state: "resume", emailMask: "j•••@gmail.com", step: 3 } }, confirm: { s: 200, j: { ok: true, state: "resume", email: "jamie@example.com", sessionId: "sess-777", stage: 1, answers: ANS } } } });
  await wait(50);
  const box = d.querySelector('[role=status]');
  ok(!!box && box.textContent.includes("saved under j•••@gmail.com"), "panel shown with mask: " + (box && box.textContent));
  ok(box && box.parentNode === d.querySelector('[data-step="start"]') && box.nextElementSibling.tagName === "H2", "panel above the first screen's content");
  ok(d.cookie.includes("ekuzo_brf") === false, "flag deleted after 200");
  ok(d.getElementById("wiz").elements.email.value === "", "nothing filled before the tap");
  ok(w.localStorage.getItem("ekz_beta_wiz") === null, "nothing stored before the tap");
  ok(box.innerHTML.indexOf("<script") < 0, "no injected markup");
  [...box.querySelectorAll("button")].find((b) => b.textContent === "Pick up where I left off").click();
  await wait(100);
  ok(visible(d) === "2", "landed on player card, visible=" + visible(d));
  ok(d.getElementById("wiz").elements.email.value === "jamie@example.com", "email filled");
  ok(d.getElementById("wiz").elements.pname.value === "Maya" && d.getElementById("wiz").elements.age.value === "12", "player filled");
  ok(d.getElementById("tz").value === "Pacific", "tz stays at the guess");
  ok(!d.querySelector('[role=status]'), "panel gone");
  ok(calls.filter((c) => c.u === "/api/season-one").length === 0, "no progress post: " + JSON.stringify(calls.map((c) => c.u + JSON.stringify(c.body))));
  ok(JSON.stringify(gtags) === JSON.stringify([["event", "beta_wizard_resume", { step: "expectations", via: "link" }]]), "ga: " + JSON.stringify(gtags));
  const st = JSON.parse(w.localStorage.getItem("ekz_beta_wiz"));
  ok(st.sid === "sess-777" && st.stage === 1 && st.tzSet === false, "stored run uses the same session: " + JSON.stringify({ sid: st.sid, stage: st.stage, g: st.g }));
  ok(d.activeElement && d.activeElement.id === "pname", "focus on first field of step: " + (d.activeElement && d.activeElement.id));
  // continue forward: a later step posts normally with the same session and counts only new steps
  d.getElementById("wiz").querySelector('[data-step="1"] [data-next]').click(); await wait(80);
  ok(visible(d) === "3", "forward to availability");
  const posts = calls.filter((c) => c.u === "/api/season-one");
  ok(posts.length === 1 && posts[0].body.stage === 2 && posts[0].body.sessionId === "sess-777", "one post for the new step, same session: " + JSON.stringify(posts.map((p) => p.body && [p.body.stage, p.body.sessionId])));
  ok(gtags.filter((g) => g[1] === "beta_wizard_step").length === 1 && gtags.find((g) => g[1] === "beta_wizard_step")[2].step === "player_card", "only the new step event");
}
// Start fresh
{
  const { d, calls } = await load({ responses: { ask: { s: 200, j: { ok: true, state: "resume", emailMask: "j•••@gmail.com", step: 2 } } } });
  await wait(50);
  [...d.querySelectorAll("button")].find((b) => b.textContent === "Start fresh").click(); await wait(30);
  ok(!d.querySelector('[role=status]') && calls.some((c) => c.body && c.body.clear === true), "start fresh clears and removes panel");
  ok(visible(d) === "0", "still first screen");
}
// typed before response: panel not shown
{
  const { d } = await load({ responses: { ask: { s: 200, j: { ok: true, state: "resume", emailMask: "j•••@gmail.com", step: 2 } } } });
  d.getElementById("email").value = "x@y.co"; d.getElementById("wiz").dispatchEvent(new d.defaultView.Event("input", { bubbles: true }));
  await wait(50);
  ok(!d.querySelector('[role=status]'), "typed -> no panel");
}
// panel dismissed when the parent types
{
  const { d, w } = await load({ responses: { ask: { s: 200, j: { ok: true, state: "resume", emailMask: "j•••@gmail.com", step: 2 } } } });
  await wait(50); ok(!!d.querySelector('[role=status]'), "panel up");
  d.getElementById("email").value = "x@y.co"; d.getElementById("wiz").dispatchEvent(new w.Event("input", { bubbles: true }));
  ok(!d.querySelector('[role=status]'), "typing dismisses the panel");
}
// C: done
{
  const { d, w, calls, gtags } = await load({ responses: { ask: { s: 200, j: { ok: true, state: "done" } } } });
  await wait(60);
  ok(visible(d) === "4", "done: last step only, visible=" + visible(d));
  const dots = [...d.querySelectorAll("#dots li")];
  ok(dots.every((x) => x.classList.contains("was") && !x.classList.contains("on") && !x.hasAttribute("aria-current")), "dots final state");
  ok(d.activeElement && d.activeElement.id === "doneh", "heading focused");
  ok(calls.filter((c) => c.u === "/api/season-one").length === 0, "done: no posts");
  ok(JSON.stringify(gtags) === JSON.stringify([["event", "beta_wizard_resume", { step: "done", via: "link" }]]), "ga done: " + JSON.stringify(gtags));
  ok(d.getElementById("pc2").textContent === "" && d.getElementById("doneh").textContent === "Got it.", "generic end screen");
}
// D: none
{
  const { d } = await load({ responses: { ask: { s: 200, j: { ok: true, state: "none" } } } });
  await wait(50);
  const b = d.querySelector('[role=status]');
  ok(b && b.textContent === "That link has run out. Start below and your answers will save as you go.", "none line");
  ok(visible(d) === "0", "first screen");
}
// E: saved run wins
{
  const local = { v: 1, at: Date.now(), sid: "sess-local", stage: 0, a: { email: "local@example.com", playerName: "", timeZone: "Pacific", times: [], playsOn: [], superpowers: [], expectations: [], teamSports: "", funFact: "", note: "", playerAge: null }, g: [0] };
  const { d, calls, gtags } = await load({ local, tz: "America/New_York", responses: { ask: { s: 200, j: { ok: true, state: "resume", emailMask: "a•••@b.co", step: 2 } } } });
  await wait(60);
  ok(calls.filter((c) => c.u.includes("restore")).length === 1 && calls.find((c) => c.u.includes("restore")).body.clear === true, "saved run wins: only a clear call");
  ok(!d.querySelector('[role=status]') && d.getElementById("email").value === "local@example.com", "local answers kept");
  ok(gtags.some((g) => g[2].via === "device"), "device resume event");
  ok(d.getElementById("tz").value === "Eastern", "no tzSet: guess, not the stored zone");
}
// tzSet restored
{
  const local = { v: 1, at: Date.now(), sid: "sess-local", stage: 0, tzSet: true, a: { email: "local@example.com", playerName: "", timeZone: "Central", times: [], playsOn: [], superpowers: [], expectations: [], teamSports: "", funFact: "", note: "", playerAge: null }, g: [0] };
  const { d } = await load({ local, cookie: null, tz: "America/New_York" });
  ok(d.getElementById("tz").value === "Central", "tzSet true: stored zone restored over the guess");
}
// G: 503 then 200
{
  const { d, calls } = await load({ responses: { queue: [{ s: 503, j: { ok: false } }, { s: 200, j: { ok: true, state: "resume", emailMask: "j•••@gmail.com", step: 2 } }] } });
  await wait(1700);
  ok(calls.filter((c) => c.u.includes("restore")).length === 2 && !!d.querySelector('[role=status]'), "503 retried once then panel");
}
{ // network error twice: flag stays
  const { d, calls } = await load({ responses: { queue: ["network", "network"] } });
  await wait(1700);
  ok(calls.length === 2 && d.cookie.includes("ekuzo_brf=1") && !d.querySelector('[role=status]'), "two failures: flag stays, silent");
}
{ // non-ekuzo host still reads
  const { calls } = await load({ host: "deploy-preview-3--ekuzo.netlify.app", responses: { ask: { s: 200, j: { ok: true, state: "none" } } } });
  await wait(40); ok(calls.some((c) => c.u.includes("restore")), "restore call on a preview host");
}
console.log(fails ? "FAILS " + fails : "ALL OK"); process.exit(fails ? 1 : 0);
