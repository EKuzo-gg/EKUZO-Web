import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

/**
 * s1-cls-field Slice 2: the landing page's head bootstrap holds the ad tables the body scripts read
 * (one source) and, per ad, preloads the hero images and requests only the fonts that ad paints.
 * These tests derive the truth from the page itself (D, T, the CSS) and check the head tables.
 */
const html = fs.readFileSync(path.join(process.cwd(), "app", "season1", "landing.html"), "utf8");
const head = html.slice(0, html.indexOf("</head>"));
const bootSrc = /<script>\n\/\/ Season 01 head bootstrap[\s\S]*?<\/script>/.exec(head)?.[0].slice(8, -9) ?? "";
const bigStart = html.indexOf("<script>\nconst IMG = ");
const big = html.slice(bigStart);
const css = (/<style>\n([\s\S]*?)<\/style>/.exec(html)?.[1] ?? "").replace(/\/\*[\s\S]*?\*\//g, "");

type S1 = {
  AD_HERO: Record<string, string | string[]>;
  HERO_KEYS: string[];
  IMG: Record<string, string>;
  HERO_IMG: Record<string, string[]>;
  FAM: string[];
  FONT_BASE: string[];
  FONTS: Record<string, string[]>;
};

function runBoot(search: string, innerWidth = 412, extra: Record<string, unknown> = {}) {
  const written: string[] = [];
  const win: Record<string, unknown> = {};
  const ctx = vm.createContext({
    window: win,
    location: { search },
    innerWidth,
    URLSearchParams,
    document: { write: (s: string) => written.push(s) },
    ...extra,
  });
  vm.runInContext(bootSrc, ctx);
  const out = written.join("");
  const preloads = [...out.matchAll(/<link rel="preload" as="image" href="([^"]+)"( fetchpriority="high")?>/g)].map((m) => [m[1], !!m[2]] as const);
  const fonts = /<link id="s1-fonts" rel="stylesheet" href="([^"]+)">/.exec(out)?.[1] ?? "";
  const rest = /<link rel="stylesheet" href="([^"]+)" media="print" onload="this.media='all'">/.exec(out)?.[1] ?? "";
  // JSON round trip: plain objects of this realm, so deepEqual compares values, not vm prototypes.
  return { S1: JSON.parse(JSON.stringify(win.S1)) as S1, out, preloads, fonts, rest };
}

const S1 = runBoot("").S1;
const famName = (t: string) => t.split(":")[0].replace(/\+/g, " ");

// D and T, evaluated with the head's IMG, exactly as the big script builds them.
const dSrc = big.slice(big.indexOf("const D = ["), big.indexOf("// Per ad:"));
const tSrc = big.slice(big.indexOf("const T = {"), big.indexOf("const qs = "));
const page = vm.createContext({ IMG: S1.IMG, logo: () => "" });
vm.runInContext(`${dSrc.replace("const D", "var D")}\n${tSrc.replace("const T", "var T")}`, page);
type Ad = { id: string; tpl?: string; cls?: string; bgs?: { cls?: string }[]; art: (k: string) => string };
const D = [...(page.D as Ad[])]; // copied into this realm so array comparisons are by value
const T = page.T as Record<string, { font: string; mod?: string; k: string; h: string; p: string }>;

const classesIn = (h: string) => new Set([...h.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/)));
const quoted = (s: string) => [...s.matchAll(/"([A-Z][A-Za-z ]+)"/g)].map((m) => m[1]);
const fam = new Set(S1.FAM.map(famName));

// CSS rules: [selector list, declarations]; innermost rules only, so @media wrappers drop out.
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => [m[1].trim(), m[2]] as const);
const selClasses = (sel: string) =>
  sel.split(",").map((s) => [...s.replace(/:[a-z-]+(\([^)]*\))?/g, "").matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]));

function adClasses(d: Ad) {
  const t = T[d.id];
  const c = classesIn(d.art("feed") + (t.mod ?? ""));
  ["art", "k-feed", d.tpl ?? d.id, ...(d.cls ? d.cls.split(" ") : []), ...(d.bgs?.[0]?.cls ? [d.bgs[0].cls] : [])].forEach((x) => c.add(x));
  return c;
}
function familiesFor(d: Ad) {
  const c = adClasses(d);
  const out = new Set<string>(quoted(T[d.id].font));
  for (const [sel, body] of rules) {
    if (selClasses(sel).some((cl) => cl.length > 0 && cl.every((x) => c.has(x)))) quoted(body).forEach((f) => out.add(f));
  }
  quoted(d.art("feed")).forEach((f) => out.add(f));
  return [...out].filter((f) => fam.has(f));
}

describe("landing head bootstrap: one source for the ad tables", () => {
  it("compiles and defines window.S1 with every D id", () => {
    assert.ok(bootSrc.length > 0);
    const ids = D.map((d) => String(d.id)).sort();
    assert.deepEqual(Object.keys(S1.HERO_IMG).sort(), ids);
    assert.deepEqual(Object.keys(S1.FONTS).sort(), ids);
  });

  it("(a) every D entry's art images, in template order, equal HERO_IMG[id]", () => {
    for (const d of D) {
      const srcs = [...(d.art("feed").matchAll(/<img\b[^>]*?\bsrc="([^"]+)"/g) as Iterable<RegExpMatchArray>)].map((m) => m[1]);
      assert.ok(srcs.length > 0, d.id);
      assert.deepEqual(S1.HERO_IMG[d.id], srcs, d.id);
      for (const s of srcs) assert.ok(fs.existsSync(path.join(process.cwd(), "public", s)), s);
    }
  });

  it("(b) every family an ad paints (T font, template CSS, module CSS, art) is in FONT_BASE + FONTS[id]", () => {
    for (const d of D) {
      const have = new Set([...S1.FONT_BASE, ...S1.FONTS[d.id]]);
      for (const f of familiesFor(d)) assert.ok(have.has(f), `${d.id} paints ${f}`);
    }
    // No CSS rule names a non-base family that no ad is credited with (a new family would be caught here).
    const credited = new Set(D.flatMap((d) => S1.FONTS[d.id]).concat(S1.FONT_BASE));
    for (const [, body] of rules) for (const f of quoted(body)) if (fam.has(f)) assert.ok(credited.has(f), f);
    // The page-wide families come through --ui and --mono.
    assert.match(css, /--ui:"Inter Tight"/);
    assert.match(css, /--mono:"JetBrains Mono"/);
    for (const f of [...S1.FONT_BASE, ...Object.values(S1.FONTS).flat()]) assert.ok(fam.has(f), f);
  });

  it("(c) the small script no longer defines its own AD_HERO or HERO_KEYS, and the big script reads IMG from the head", () => {
    const body = html.slice(html.indexOf("<body>"));
    assert.doesNotMatch(body, /const AD_HERO=\{/);
    assert.doesNotMatch(body, /const HERO_KEYS=\[/);
    assert.match(body, /const AD_HERO=window\.S1\.AD_HERO;/);
    assert.match(body, /const IMG = window\.S1\.IMG;/);
    assert.doesNotMatch(body, /IMG\["[\w-]+"\]=/);
  });

  it("the noscript all-families stylesheet names exactly FAM, and no blocking stylesheet is left in the markup", () => {
    const full = "https://fonts.googleapis.com/css2?family=" + S1.FAM.join("&family=") + "&display=swap";
    const body = html.slice(html.indexOf("<body>"));
    assert.ok(body.includes(`<noscript><link rel="stylesheet" href="${full}"></noscript>`));
    assert.equal((body.replace(/<noscript>[\s\S]*?<\/noscript>/g, "").match(/<link rel="stylesheet"/g) ?? []).length, 0);
    assert.ok(head.indexOf("<script>") < head.indexOf("{{TAGS}}"));
    assert.equal((head.replace(bootSrc, "").match(/rel="stylesheet"/g) ?? []).length, 0, "no static stylesheet in the head");
  });

  it("only shortlist is a custom (imageless) interactive hero, as the bootstrap assumes", () => {
    const custom = [...big.matchAll(/\n (\w+):\{[^\n]*custom:true/g)].map((m) => m[1]);
    assert.deepEqual(custom, ["shortlist"]);
  });
});

describe("landing head bootstrap: per-ad preloads and fonts", () => {
  const url = (fams: string[]) =>
    "https://fonts.googleapis.com/css2?family=" + S1.FAM.filter((f) => fams.includes(famName(f))).join("&family=") + "&display=swap";
  const IMG = S1.IMG;

  it("page A photo heroes preload their images, the first at high priority", () => {
    let r = runBoot("?ad=d19&utm_source=fb");
    assert.deepEqual(r.preloads, [[IMG["team-walk-hd"], true], [IMG["southie-back"], false]]);
    assert.equal(r.fonts, url(["Inter Tight", "JetBrains Mono", "Rubik"]));
    r = runBoot("?ad=d18");
    assert.deepEqual(r.preloads, [[IMG["laughing"], true]]);
    assert.equal(r.fonts, url(["Inter Tight", "JetBrains Mono"]));
    assert.deepEqual(runBoot("?ad=D019").preloads[0], [IMG["team-walk-hd"], true]);
  });

  it("no ad or an unknown ad is d1 page A", () => {
    for (const s of ["", "?ad=zz", "?ad="]) {
      const r = runBoot(s);
      assert.deepEqual(r.preloads, [[IMG["mc-blocks"], true]], s);
      assert.equal(r.fonts, url(["Inter Tight", "JetBrains Mono", "Space Grotesk"]), s);
    }
  });

  it("interactive heroes on phones: first image only, nothing for shortlist; desktop keeps the page A rule", () => {
    assert.deepEqual(runBoot("?ad=d2").preloads, [[IMG["couch"], true]]);
    assert.equal(runBoot("?ad=d2").fonts, url(["Inter Tight", "JetBrains Mono", "Archivo", "Archivo Black"]));
    assert.deepEqual(runBoot("?ad=d8").preloads, [[IMG["couch"], true]]);
    assert.deepEqual(runBoot("?ad=d10").preloads, [[IMG["kid-couch"], true]]);
    assert.deepEqual(runBoot("?ad=d4").preloads, []);
    assert.deepEqual(runBoot("?ad=d18&hero=shortlist").preloads, []);
    assert.deepEqual(runBoot("?ad=d18&hero=games").preloads, [[IMG["laughing"], true]]);
    assert.deepEqual(runBoot("?ad=d2&hero=none").preloads, [[IMG["couch"], true]]);
    assert.deepEqual(runBoot("?ad=d8", 1440).preloads, [[IMG["couch"], true], [IMG["laughing"], false]]);
    assert.deepEqual(runBoot("?ad=d4", 1440).preloads, [[IMG["coach-and-mom"], true]]);
  });

  it("the async safety-net stylesheet carries every other family and none of the ad's (no duplicate @font-face)", () => {
    for (const s of ["?ad=d19", "?ad=d2", "", "?ad=d7"]) {
      const r = runBoot(s);
      const a = new URL(r.fonts).searchParams.getAll("family"), b = new URL(r.rest).searchParams.getAll("family");
      assert.deepEqual([...a, ...b].sort(), S1.FAM.map((f) => f.replace(/\+/g, " ")).sort(), s);
      assert.ok(r.out.indexOf("s1-fonts") < r.out.indexOf('media="print"'), s);
    }
  });

  it("preloads come before the fonts stylesheet, and only the chosen ad's images load (X1)", () => {
    const r = runBoot("?ad=d19");
    assert.ok(r.out.lastIndexOf("preload") < r.out.indexOf("s1-fonts"));
    assert.equal((r.out.match(/rel="preload"/g) ?? []).length, 2);
  });

  it("any failure writes the blocking all-families stylesheet, the page as it was (X17)", () => {
    const r = runBoot("?ad=d19", 412, { URLSearchParams: undefined });
    const full = "https://fonts.googleapis.com/css2?family=" + r.S1.FAM.join("&family=") + "&display=swap";
    assert.equal(r.out, `<link rel="stylesheet" href="${full}">`);
    assert.ok(r.S1.AD_HERO && r.S1.IMG, "tables still defined for the body scripts");
  });
});
