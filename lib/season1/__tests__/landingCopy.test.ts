import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * s1-fast-track Part B: Aaron's v2 additions ported onto the live landing (his copy, verbatim).
 * String checks on app/season1/landing.html: the three fast-track links, the relabelled forms and
 * hero buttons, and the waitlist-era labels that must be gone.
 */
const html = fs.readFileSync(path.join(process.cwd(), "app", "season1", "landing.html"), "utf8");
const body = html.slice(html.indexOf("<body>"));

const joins = [...body.matchAll(/<a class="(ready|lock-btn)" href="([^"]+)" data-join="([^"]+)">([\s\S]*?)<\/a>/g)].map(
  (m) => ({ cls: m[1], href: m[2], where: m[3], label: m[4] }),
);

describe("landing fast-track links (Part B)", () => {
  it("has exactly three [data-join] elements: top, bottom, confirm", () => {
    assert.equal(countJoinAttrs(), 3);
    assert.deepEqual(
      joins.map((j) => j.where),
      ["top", "bottom", "confirm"],
    );
  });

  it("each link keeps the static no-JS href /season1/join?src=ad", () => {
    for (const j of joins) assert.equal(j.href, "/season1/join?src=ad", j.where);
  });

  it("the form links read Aaron's label and the confirm button reads his", () => {
    const ready = 'Ready now? <span>Save their spot for&nbsp;$100&nbsp;→</span>';
    assert.equal(joins[0].cls, "ready");
    assert.equal(joins[0].label, ready);
    assert.equal(joins[1].cls, "ready");
    assert.equal(joins[1].label, ready);
    assert.equal(joins[2].cls, "lock-btn");
    assert.equal(joins[2].label, "Save their spot · $100");
  });

  it("each form link is followed by its note and sits after its form, inside form-wrap", () => {
    for (const where of ["top", "bottom"]) {
      const re = new RegExp(
        `</form>\\n\\s*<a class="ready" href="/season1/join\\?src=ad" data-join="${where}">[^\\n]*</a><p class="ready-note">Covers January\\. Fully refundable until Dec&nbsp;31\\.</p>\\n\\s*</div>`,
      );
      assert.match(body, re, where);
    }
  });

  it("the lock card sits in the confirmation dialog, before the Text Karlin card", () => {
    const conf = body.slice(body.indexOf('<div class="conf" id="conf"'));
    assert.ok(conf.indexOf('<div class="lock">') > 0);
    assert.ok(conf.indexOf('<div class="lock">') < conf.indexOf('<div class="tk" id="tk"'));
    assert.match(conf, /<span class="kick">Details on the way<\/span>/);
    assert.match(conf, /<h3>Questions first\?<\/h3>/);
  });

  it("no data-ready attribute or handler remains", () => {
    assert.equal(/data-ready|dataset\.ready|\[data-ready\]/.test(html), false);
  });
});

function countJoinAttrs() {
  return (body.match(/ data-join="[a-z]+"/g) ?? []).length;
}

describe("landing copy relabel (Part B)", () => {
  it("the waitlist-era labels are gone", () => {
    for (const old of ["Save their spot for season&nbsp;one.", "Save their spot for season one.", "Get them on the&nbsp;list.", "Get them on the list.", "Join the Season&nbsp;01 list.", "You’re on the list", "Chat with our founder"]) {
      assert.equal(html.includes(old), false, old);
    }
  });

  it("both form buttons, the CTA default and the sticky bar use the new labels", () => {
    assert.equal((body.match(/<button type="submit">Send me the details<\/button>/g) ?? []).length, 2);
    assert.match(body, /const CTA = \(qs\.get\("cta"\)\|\|"Send me the details"\)\.slice\(0,40\);/);
    assert.match(body, /<div class="sticky" id="sticky"><button type="button" data-go>Get the details<\/button><\/div>/);
  });

  it("hero buttons on d6, d9, d11, d13, d14 and d19 to d21 read Get the details", () => {
    const entry = (id: string) => {
      const s = body.indexOf(`{id:"${id}",`);
      assert.ok(s > 0, id);
      const e = body.indexOf("\n {id:", s + 1);
      return body.slice(s, e > 0 ? e : body.indexOf("\n];", s));
    };
    for (const id of ["d6", "d9", "d11", "d13", "d14", "d19", "d20", "d21"]) {
      assert.match(entry(id), /<span class="cta">Get the details →<\/span>/, id);
      assert.equal(entry(id).includes("Save their spot →"), false, id);
    }
  });

  it("the header mini button reads Get the details", () => {
    assert.match(body, /<button class="mini-cta" type="button" data-go>Get the details<\/button><\/header>|class="mini-cta" type="button" data-go>Get the details<\/button><\/header>/);
    assert.equal(html.includes("data-go>Join the list</button>"), false);
  });

  it("no hero template (the D array) contains Save their spot", () => {
    const s = body.indexOf("const D = [");
    const e = body.indexOf("\n];", s);
    assert.ok(s > 0 && e > s);
    const D = body.slice(s, e);
    assert.ok((D.match(/\{id:"d\d+"/g) ?? []).length >= 21);
    assert.equal(D.includes("Save their spot"), false);
    assert.equal(D.includes("Save their"), false);
  });
});
