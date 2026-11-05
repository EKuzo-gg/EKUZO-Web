import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * /season1/join is a clone of /season1/join/b (decision D10): one template,
 * two route files. B's route file is protected, so /join keeps its own copy of
 * the handler. R2-D5: /join is indexable only on the live host in live mode, so
 * the one allowed code difference is the `const indexable = ...` line. The
 * rendered pages may differ only inside the <!--SEO:start-->...<!--SEO:end-->
 * block, and the headers only by x-robots-tag. Anything else fails.
 */
const root = path.join(process.cwd(), "app", "season1", "join");
const INDEXABLE_LINE = /^\s*const indexable = /;
const code = (file: string) =>
  fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter((l) => !l.trimStart().startsWith("//") && !INDEXABLE_LINE.test(l))
    .join("\n");

const SEO_RE = /<!--SEO:start-->[\s\S]*?<!--SEO:end-->/;
const stripSeo = (html: string) => html.replace(SEO_RE, "<!--SEO-->");
const headerPairs = (r: Response, drop: string[] = []) => [...r.headers].filter(([k]) => !drop.includes(k)).sort();

const ENVS = ["S1_COMMIT_MODE", "STRIPE_SECRET_KEY", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "DATABASE_URL", "S1_STRIPE_WEBHOOK_SECRET", "S1_DEPLOY_CONTEXT", "CONTEXT"] as const;
const MODE_ENV: Record<"live" | "test" | "off", Record<string, string>> = {
  live: {
    S1_COMMIT_MODE: "live",
    STRIPE_SECRET_KEY: "sk_live_x",
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_live_x",
    DATABASE_URL: "postgres://u:p@ep-prod-1.neon.tech/db",
    S1_STRIPE_WEBHOOK_SECRET: "whsec_x",
    S1_DEPLOY_CONTEXT: "production",
  },
  test: {
    S1_COMMIT_MODE: "test",
    STRIPE_SECRET_KEY: "sk_test_x",
    DATABASE_URL: "postgres://u:p@ep-lively-boat-b4fak1h6.neon.tech/db",
  },
  off: { S1_COMMIT_MODE: "off" },
};

async function withEnv<T>(mode: keyof typeof MODE_ENV, fn: () => Promise<T> | T): Promise<T> {
  const saved: Record<string, string | undefined> = {};
  for (const k of ENVS) {
    saved[k] = process.env[k];
    delete process.env[k];
  }
  Object.assign(process.env, MODE_ENV[mode]);
  try {
    return await fn();
  } finally {
    for (const k of ENVS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  }
}

const req = (host: string, qs = "") => new Request(`https://${host}/season1/join${qs}`, { headers: { host } });
const load = async () => ({
  join: await import("../../../app/season1/join/route"),
  b: await import("../../../app/season1/join/b/route"),
  jersey: await import("../../../app/season1/join/jersey/route"),
});

describe("/season1/join matches /season1/join/b outside the SEO block", () => {
  it("route files are identical apart from comments and the indexable line", () => {
    assert.equal(code(path.join(root, "route.ts")), code(path.join(root, "b", "route.ts")));
  });
  it("the indexable line is the only code difference, and /b and /jersey are hard false", () => {
    const line = (f: string) => fs.readFileSync(f, "utf8").split("\n").filter((l) => INDEXABLE_LINE.test(l));
    assert.deepEqual(line(path.join(root, "route.ts")), ['  const indexable = isLiveHost(host) && mode === "live";']);
    assert.deepEqual(line(path.join(root, "b", "route.ts")), ["  const indexable = false;"]);
    assert.deepEqual(line(path.join(root, "jersey", "route.ts")), ["  const indexable = false;"]);
  });
  it("both read the same template path", () => {
    const re = /path\.join\(process\.cwd\(\), "app", "season1", "join", "b", "join-b\.html"\)/;
    assert.match(fs.readFileSync(path.join(root, "route.ts"), "utf8"), re);
    assert.match(fs.readFileSync(path.join(root, "b", "route.ts"), "utf8"), re);
  });
  it("the old A template is gone", () => {
    assert.equal(fs.existsSync(path.join(root, "join.html")), false);
  });
  it("each template has exactly one SEO block, inside <head>", () => {
    for (const f of [path.join(root, "b", "join-b.html"), path.join(root, "jersey", "join-jersey.html")]) {
      const t = fs.readFileSync(f, "utf8");
      assert.equal(t.split("<!--SEO:start-->").length - 1, 1, f);
      assert.equal(t.split("<!--SEO:end-->").length - 1, 1, f);
      assert.ok(t.indexOf("<!--SEO:start-->") > t.indexOf("<head>") && t.indexOf("<!--SEO:end-->") < t.indexOf("</head>"), f);
      assert.ok(!/<meta name="robots"/.test(t), "the robots meta only comes from the SEO block");
    }
  });

  for (const mode of ["live", "test", "off"] as const) {
    for (const host of ["ekuzo.gg", "www.ekuzo.gg", "localhost:3100", "deploy-preview-9--ekuzo.netlify.app", "ekuzo.gg.evil.example"]) {
      for (const qs of ["", "?src=x&utm_source=y"]) {
        const shouldIndex = mode === "live" && (host === "ekuzo.gg" || host === "www.ekuzo.gg");
        it(`mode=${mode} host=${host} qs=${qs || "none"}: ${shouldIndex ? "indexable" : "noindex"}; bodies match outside SEO`, async () => {
          await withEnv(mode, async () => {
            const { join, b, jersey } = await load();
            const [ra, rb, rj] = [join.GET(req(host, qs)), b.GET(req(host, qs)), jersey.GET(req(host, qs))];
            const [ta, tb] = [await ra.text(), await rb.text()];
            assert.equal(ra.status, rb.status);
            assert.deepEqual(headerPairs(ra, ["x-robots-tag"]), headerPairs(rb, ["x-robots-tag"]));
            assert.equal(rb.headers.get("x-robots-tag"), "noindex");
            assert.equal(rj.headers.get("x-robots-tag"), "noindex");
            assert.ok((await rj.text()).includes('<!--SEO:start--><meta name="robots" content="noindex"><!--SEO:end-->'));
            assert.equal(stripSeo(ta).includes("<!--SEO"), true);
            // Bodies equal outside the SEO block, except the host-independent src rewrite which is the same on both.
            assert.equal(stripSeo(ta), stripSeo(tb));
            assert.equal(ta.split("<!--SEO:start-->").length - 1, 1);
            assert.ok(tb.includes('<!--SEO:start--><meta name="robots" content="noindex"><!--SEO:end-->'));
            const seoA = ta.match(SEO_RE)![0];
            if (shouldIndex) {
              assert.equal(ra.headers.get("x-robots-tag"), null);
              assert.ok(!/noindex/i.test(seoA));
              assert.ok(seoA.includes('<link rel="canonical" href="https://ekuzo.gg/season1/join">'), "bare constant canonical, even with ?src and utm");
              assert.ok(!ta.slice(0, ta.indexOf("</head>")).includes("noindex"));
              const json = seoA.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1];
              assert.ok(JSON.parse(json)["@graph"].length === 2);
            } else {
              assert.equal(ra.headers.get("x-robots-tag"), "noindex");
              assert.equal(seoA, '<!--SEO:start--><meta name="robots" content="noindex"><!--SEO:end-->');
              assert.ok(!seoA.includes("canonical"));
            }
          });
        });
      }
    }
  }

  it("mutation check: a price edit outside the SEO block makes the comparison fail", async () => {
    await withEnv("live", async () => {
      const { join, b } = await load();
      const ta = await join.GET(req("ekuzo.gg")).text();
      const tb = (await b.GET(req("ekuzo.gg")).text()).replace("$580", "$581");
      assert.notEqual(stripSeo(ta), stripSeo(tb));
    });
  });
  it("mutation check: a header drift beyond x-robots-tag is detected", async () => {
    await withEnv("live", async () => {
      const { join, b } = await load();
      const ra = join.GET(req("ekuzo.gg"));
      const rb = b.GET(req("ekuzo.gg"));
      rb.headers.set("x-extra", "1");
      assert.notDeepEqual(headerPairs(ra, ["x-robots-tag"]), headerPairs(rb, ["x-robots-tag"]));
    });
  });
});
