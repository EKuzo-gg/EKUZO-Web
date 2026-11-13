import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { BETA_PROGRESS_HOOKS, BETA_PROGRESS_JS, BETA_ZONE_LABELS } from "../betaProgressScript";
import { TIME_ZONES } from "../betaWizard";
import { BETA_RESTART_COOKIE, BETA_RESTART_FLAG_COOKIE } from "../betaRestart";

/** The capture script reads Aaron's page; if the page stops carrying what it hooks, this fails before a deploy does. */
const html = fs.readFileSync(path.join(process.cwd(), "app", "season1", "beta", "start", "start.html"), "utf8");

describe("beta progress script: hooks into start.html", () => {
  it("the form, the five steps, the Continue buttons and every field name are on the page", () => {
    assert.match(html, new RegExp(`<form[^>]*id="${BETA_PROGRESS_HOOKS.form}"`));
    assert.equal((html.match(/<[a-z]+[^>]*\sdata-step(=|\s|>)/g) ?? []).length, BETA_PROGRESS_HOOKS.steps);
    assert.ok((html.match(/data-next/g) ?? []).length >= 3);
    for (const n of BETA_PROGRESS_HOOKS.fields) assert.match(html, new RegExp(`name="${n}"`), n);
  });
  it("the page's own gate is still ekuzo.gg only, the rule the script copies", () => {
    assert.ok(html.includes(String.raw`var LIVE=/(^|\.)ekuzo\.gg$/.test(location.hostname)`));
  });
  it("the script parses, cannot close its own script tag, and names no vendor but GA4", () => {
    new vm.Script(BETA_PROGRESS_JS);
    assert.equal(/<\/script/i.test(BETA_PROGRESS_JS), false);
    assert.equal(/fbq|clarity|s1px/.test(BETA_PROGRESS_JS), false);
  });
  it("GA4 calls are the two allowed shapes and nothing else: beta_wizard_step {step} and beta_wizard_resume {step, via}", () => {
    const calls = BETA_PROGRESS_JS.match(/ga\("[a-z_]+",\{[^}]*\}\)/g) ?? [];
    assert.equal((BETA_PROGRESS_JS.match(/\bga\(/g) ?? []).length, calls.length, "every ga( call is one of the matched shapes");
    const step = /^ga\("beta_wizard_step",\{step:NAMES\[[^\]]+\]\}\)$/;
    const resume = /^ga\("beta_wizard_resume",\{step:(NAMES\[[^\]]+\](\|\|"")?|"done"),via:"(device|link)"\}\)$/;
    for (const c of calls) assert.ok(step.test(c) || resume.test(c), c);
    assert.equal(calls.filter((c) => step.test(c)).length, 1);
    assert.equal(calls.filter((c) => c.includes('via:"device"')).length, 1);
    assert.equal(calls.filter((c) => c.includes('via:"link"')).length, 2);
    assert.equal(calls.filter((c) => c.includes('step:"done"')).length, 1);
    assert.equal(/beta_wizard_complete/.test(BETA_PROGRESS_JS), false);
  });
});

describe("beta progress script: restart link (docs/beta-restart-link-2026-11)", () => {
  it("builds its DOM with createElement and textContent: no innerHTML, outerHTML, insertAdjacentHTML or document.write", () => {
    for (const bad of ["innerHTML", "outerHTML", "insertAdjacentHTML", "document.write", "eval(", "new Function"]) assert.equal(BETA_PROGRESS_JS.includes(bad), false, bad);
    assert.ok(BETA_PROGRESS_JS.includes("createElement"));
    assert.ok(BETA_PROGRESS_JS.includes("textContent"));
  });
  it("reads the flag cookie only, never the HttpOnly token cookie, and calls only the restore endpoint", () => {
    assert.ok(BETA_PROGRESS_JS.includes(BETA_RESTART_FLAG_COOKIE + "=1"));
    assert.equal(BETA_PROGRESS_JS.includes(BETA_RESTART_COOKIE), false);
    assert.ok(BETA_PROGRESS_JS.includes('RESTORE="/api/season1-beta/restore"'));
    const posts = BETA_PROGRESS_JS.match(/fetch\("[^"]+"|fetch\(RESTORE/g) ?? [];
    assert.deepEqual([...new Set(posts)].sort(), ['fetch("/api/season-one"', "fetch(RESTORE"].sort());
  });
  it("the progress posts stay ekuzo.gg only; the restore call is not gated on the host", () => {
    assert.ok(BETA_PROGRESS_JS.includes("if(!LIVE||stage<0||stage>2) return;"));
    const ask = BETA_PROGRESS_JS.slice(BETA_PROGRESS_JS.indexOf("var ask="), BETA_PROGRESS_JS.indexOf("var good="));
    assert.equal(/LIVE/.test(ask), false);
  });
  it("the three new strings are on the page script, spelled as in the decision log (D3)", () => {
    for (const t of ["Welcome back.", "Your answers are saved under ", ". Pick up where you left off?", "Pick up where I left off", "Start fresh", "That link has run out. Start below and your answers will save as you go."]) {
      assert.ok(BETA_PROGRESS_JS.includes(t), t);
    }
    assert.equal(/[\u2013\u2014]/.test(BETA_PROGRESS_JS), false, "no em or en dashes");
    assert.ok(BETA_PROGRESS_JS.includes('role'));
  });
  it("a link restore sends no progress post and no step event: the walk runs with restoring set, and pickUp never calls post( or beta_wizard_step", () => {
    const pick = BETA_PROGRESS_JS.slice(BETA_PROGRESS_JS.indexOf("var pickUp="), BETA_PROGRESS_JS.indexOf("var offer="));
    assert.equal(/\bpost\(/.test(pick), false);
    assert.equal(/beta_wizard_step/.test(pick), false);
    assert.ok(pick.includes("refill(a,stage,false)"), "the link never sets the time zone");
    const done = BETA_PROGRESS_JS.slice(BETA_PROGRESS_JS.indexOf("var finish="), BETA_PROGRESS_JS.indexOf("var runOut="));
    assert.equal(/\bpost\(/.test(done), false);
  });
  it("the page's own end-screen steps are matched: last section only, dots on, aria-current removed", () => {
    const done = BETA_PROGRESS_JS.slice(BETA_PROGRESS_JS.indexOf("var finish="), BETA_PROGRESS_JS.indexOf("var runOut="));
    assert.ok(done.includes("x.hidden=n!==4"));
    assert.ok(done.includes('classList.remove("on")') && done.includes('classList.add("was")') && done.includes('removeAttribute("aria-current")'));
    // The page's show() still does what finish() copies.
    assert.ok(html.includes('d.classList.toggle("on",n===i-1);d.classList.toggle("was",n<i-1||i===4)'));
    assert.ok(html.includes('d.removeAttribute("aria-current")'));
    assert.ok(html.includes("steps.forEach(function(s,n){s.hidden=n!==i})"));
  });
});

describe("beta progress script: time zone guess (BETA_ZONE_LABELS)", () => {
  /** Runs the real script against a stub page whose only live part is the time zone select; returns the select's value. */
  function zoneFor(tz: string, initial = "Eastern"): string {
    const prev = process.env.TZ;
    process.env.TZ = tz;
    try {
      const sel = { value: initial, querySelector: () => ({}), addEventListener() {} };
      const steps = [0, 1, 2, 3, 4].map(() => ({ hidden: false, querySelector: () => null }));
      steps.slice(1).forEach((x) => { x.hidden = true; });
      const form = { elements: { tz: sel }, querySelectorAll: (q: string) => (q === "[data-step]" ? steps : []), addEventListener() {} };
      const ctx = {
        window: {}, document: { getElementById: (id: string) => (id === "wiz" ? form : null), querySelectorAll: () => [], cookie: "" },
        location: { hostname: "localhost", search: "", pathname: "/season1/beta/start" },
        localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
      };
      vm.runInNewContext(BETA_PROGRESS_JS, ctx);
      return sel.value;
    } finally {
      if (prev === undefined) delete process.env.TZ; else process.env.TZ = prev;
    }
  }
  it("maps the Canadian and US zones the page missed", () => {
    const want: Record<string, string> = {
      "America/Toronto": "Eastern", "America/Winnipeg": "Central", "America/Regina": "Central", "America/Edmonton": "Mountain",
      "America/Vancouver": "Pacific", "America/Whitehorse": "Mountain", "America/Halifax": "Other", "America/St_Johns": "Other",
      "America/Boise": "Mountain", "America/Indiana/Indianapolis": "Eastern", "America/Indiana/Tell_City": "Central",
      "America/Kentucky/Louisville": "Eastern", "America/Phoenix": "Mountain", "Pacific/Honolulu": "Hawaii", "America/Anchorage": "Alaska",
      "America/Puerto_Rico": "Other", "US/Pacific": "Pacific", "Canada/Saskatchewan": "Central",
      "America/New_York": "Eastern", "America/Chicago": "Central", "America/Denver": "Mountain", "America/Los_Angeles": "Pacific",
    };
    for (const [tz, label] of Object.entries(want)) assert.equal(zoneFor(tz, label === "Pacific" ? "Eastern" : "Pacific"), label, tz);
  });
  it("any other America/, US/ or Canada/ zone reads Other; a zone from elsewhere is left as the page set it", () => {
    for (const tz of ["America/Mexico_City", "America/Bogota", "America/Sao_Paulo"]) assert.equal(zoneFor(tz, "Eastern"), "Other", tz);
    assert.equal(zoneFor("Europe/London", "Other"), "Other");
    assert.equal(zoneFor("Asia/Tokyo", "Central"), "Central"); // untouched: whatever the page chose
  });
  it("the table is written into the script from the one exported object, and every label is a server option", () => {
    assert.ok(BETA_PROGRESS_JS.includes(JSON.stringify(BETA_ZONE_LABELS)));
    const labels = new Set(Object.values(BETA_ZONE_LABELS));
    for (const l of labels) assert.ok((TIME_ZONES as readonly string[]).includes(l), l);
    for (const l of ["Eastern", "Central", "Mountain", "Pacific", "Alaska", "Hawaii", "Other"]) assert.ok(labels.has(l as never), l);
  });
  it("the table covers the named zones, with the US/ and Canada/ aliases, and the lookup ignores inherited names", () => {
    for (const k of ["America/Toronto", "America/Winnipeg", "America/Regina", "America/Edmonton", "America/Vancouver", "America/Whitehorse", "America/Halifax", "America/St_Johns", "America/Boise", "America/Indiana/Indianapolis", "America/Indiana/Tell_City", "America/Kentucky/Louisville", "America/Phoenix", "Pacific/Honolulu", "America/Anchorage", "America/Puerto_Rico", "US/Pacific", "Canada/Saskatchewan"]) {
      assert.ok(k in BETA_ZONE_LABELS, k);
    }
    for (const k of Object.keys(BETA_ZONE_LABELS)) assert.match(k, /^(America|US|Canada|Pacific)\/|^Navajo$/);
    assert.ok(BETA_PROGRESS_JS.includes("Object.prototype.hasOwnProperty.call(ZL,zn)"), "lookup ignores inherited names");
  });
  it("tzSet is recorded only from a change event, and a restored zone is used only when it is set", () => {
    assert.ok(BETA_PROGRESS_JS.includes('tzEl.addEventListener("change",function(){ st.tzSet=true; keep(); })'));
    assert.ok(BETA_PROGRESS_JS.includes('if(tzToo) set("tz",a.timeZone)'));
    assert.ok(BETA_PROGRESS_JS.includes("refill(st.a,st.stage,!!st.tzSet)"));
  });
});
