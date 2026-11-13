import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { BETA_PROGRESS_HOOKS, BETA_PROGRESS_JS } from "../betaProgressScript";

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
  it("GA4 events carry a step name only", () => {
    const calls = BETA_PROGRESS_JS.match(/ga\("[a-z_]+",\{[^}]*\}\)/g) ?? [];
    assert.equal(calls.length, 2);
    for (const c of calls) assert.match(c, /^ga\("beta_wizard_(step|resume)",\{step:NAMES\[[^\]]+\](\|\|"")?\}\)$/);
  });
});
