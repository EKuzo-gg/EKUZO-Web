export type S1Mode = "off" | "test" | "live";

export const S1_TEST_DB_MARKER = "ep-lively-boat-b4fak1h6";
const LIVE_HOSTS = ["ekuzo.gg", "www.ekuzo.gg"];

/**
 * L5: true only when the URL's hostname is the Neon test endpoint (its first
 * label is the endpoint id, or the id plus a suffix such as "-pooler"). The
 * marker anywhere else (password, path, query) does not count.
 */
export function isTestDbUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  let hostname: string;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return false;
  }
  const label = hostname.split(".")[0];
  return label === S1_TEST_DB_MARKER || label.startsWith(`${S1_TEST_DB_MARKER}-`);
}

function cleanHost(host: string | null | undefined): string {
  return (host ?? "").trim().toLowerCase().replace(/:\d+$/, "");
}

/** True when the raw Host header is ekuzo.gg or www.ekuzo.gg (port ignored). Missing host: false. */
export function isLiveHost(host: string | null | undefined): boolean {
  return LIVE_HOSTS.includes(cleanHost(host));
}

/**
 * Netlify deploy context. Reads S1_DEPLOY_CONTEXT first (the lead can inline
 * it at build time from CONTEXT via next.config `env`, since CONTEXT does not
 * reliably reach the function runtime), then the runtime CONTEXT. Literal
 * process.env reads so build-time inlining works. Empty when unknown.
 */
export function deployContext(env?: Record<string, string | undefined>): string {
  if (env) return (env.S1_DEPLOY_CONTEXT || env.CONTEXT || "").trim();
  return (process.env.S1_DEPLOY_CONTEXT || process.env.CONTEXT || "").trim();
}

/**
 * Pure mode resolution; fails closed to "off". Mode gates PaymentIntent
 * creation and the signup page only (RT10); the webhook and welcome fulfil
 * always run.
 *  - envMode unset/empty: "test" if the Stripe key starts sk_test_, else "off".
 *  - "live" (RT17): needs ALL of sk_live_ key, pk_live_ publishable key, a
 *    DATABASE_URL without the test endpoint, S1_STRIPE_WEBHOOK_SECRET set,
 *    deploy context "production", and the raw host header ekuzo.gg or
 *    www.ekuzo.gg. Any miss: "off".
 *  - "test": key must start sk_test_ AND databaseUrl's host must be the Neon
 *    test branch endpoint, else "off" (also when test is the unset default).
 *  - anything else: "off".
 */
export function resolveMode(input: {
  envMode?: string | null;
  stripeKey?: string | null;
  databaseUrl?: string | null;
  /** The raw `host` request header (never x-forwarded-host). */
  host?: string | null;
  publishableKey?: string | null;
  webhookSecret?: string | null;
  context?: string | null;
}): S1Mode {
  const key = input.stripeKey ?? "";
  const raw = (input.envMode ?? "").trim().toLowerCase();
  const requested = raw === "" ? (key.startsWith("sk_test_") ? "test" : "off") : raw;

  if (requested === "live") {
    const db = input.databaseUrl ?? "";
    const ok =
      key.startsWith("sk_live_") &&
      (input.publishableKey ?? "").startsWith("pk_live_") &&
      db !== "" &&
      !isTestDbUrl(db) &&
      (input.webhookSecret ?? "").trim() !== "" &&
      (input.context ?? "").trim() === "production" &&
      LIVE_HOSTS.includes(cleanHost(input.host));
    return ok ? "live" : "off";
  }
  if (requested === "test") {
    return key.startsWith("sk_test_") && isTestDbUrl(input.databaseUrl)
      ? "test"
      : "off";
  }
  return "off";
}

/**
 * resolveMode fed from process.env. Pass the RAW `host` request header
 * (request.headers.get("host")), never x-forwarded-host.
 */
export function currentMode(rawHost: string | null | undefined): S1Mode {
  return resolveMode({
    envMode: process.env.S1_COMMIT_MODE,
    stripeKey: process.env.STRIPE_SECRET_KEY,
    databaseUrl: process.env.DATABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.S1_STRIPE_WEBHOOK_SECRET,
    context: deployContext(),
    host: rawHost,
  });
}
