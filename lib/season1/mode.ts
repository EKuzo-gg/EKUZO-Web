export type S1Mode = "off" | "test" | "live";

export const S1_TEST_DB_MARKER = "ep-lively-boat-b4fak1h6";
const LIVE_HOSTS = ["ekuzo.gg", "www.ekuzo.gg"];

function cleanHost(host: string | null | undefined): string {
  return (host ?? "").trim().toLowerCase().replace(/:\d+$/, "");
}

/**
 * Pure mode resolution; fails closed to "off".
 *  - envMode unset/empty: "test" if the Stripe key starts sk_test_, else "off".
 *  - "live": only on ekuzo.gg / www.ekuzo.gg with an sk_live_ key.
 *  - "test": key must start sk_test_ AND databaseUrl must contain the Neon
 *    test branch endpoint, else "off" (this also applies when test is the
 *    unset default).
 *  - anything else: "off".
 */
export function resolveMode(input: {
  envMode?: string | null;
  stripeKey?: string | null;
  databaseUrl?: string | null;
  host?: string | null;
}): S1Mode {
  const key = input.stripeKey ?? "";
  const raw = (input.envMode ?? "").trim().toLowerCase();
  const requested = raw === "" ? (key.startsWith("sk_test_") ? "test" : "off") : raw;

  if (requested === "live") {
    return LIVE_HOSTS.includes(cleanHost(input.host)) && key.startsWith("sk_live_") ? "live" : "off";
  }
  if (requested === "test") {
    return key.startsWith("sk_test_") && (input.databaseUrl ?? "").includes(S1_TEST_DB_MARKER)
      ? "test"
      : "off";
  }
  return "off";
}
