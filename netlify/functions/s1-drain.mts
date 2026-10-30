/**
 * Season 01 scheduled outbox drain (analytics C1, P3 default: every 2 minutes).
 *
 * Only a trigger: it POSTs to the Next route /api/season1/drain with the
 * shared secret and logs the HTTP status. All drain logic, and the database
 * guard, live in the route (a function bundled outside Next does not get the
 * inlined S1_DEPLOY_CONTEXT, ops red team 2).
 *
 * Netlify runs schedules on the published production deploy only (branch
 * deploys: "Run now" in the UI). URL is the site's main URL. Needs
 * S1_DRAIN_SECRET in the Production environment (Jamie pastes it); without it
 * the call is skipped and logged.
 */
export default async function s1Drain(): Promise<void> {
  const base = process.env.URL;
  const secret = (process.env.S1_DRAIN_SECRET ?? "").trim();
  if (!base || !secret) {
    console.log(`s1-drain: skipped (${!base ? "no URL" : "no S1_DRAIN_SECRET"})`);
    return;
  }
  try {
    const res = await fetch(`${base}/api/season1/drain`, {
      method: "POST",
      headers: { "x-s1-drain-secret": secret },
      signal: AbortSignal.timeout(20_000),
    });
    console.log(`s1-drain: status ${res.status}`);
  } catch (e) {
    console.log(`s1-drain: failed (${(e as Error)?.name ?? "error"})`);
  }
}

export const config = {
  schedule: "*/2 * * * *",
};
