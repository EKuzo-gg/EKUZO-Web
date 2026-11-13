import { isRestartTokenShape, restartSetCookies } from "@/lib/season1/betaRestartCookies";

/**
 * The beta restart link, /season1/beta/r/<token> (docs/beta-restart-link-2026-11/02-frozen-spec.md).
 * Arms two cookies and sends the parent to the wizard. No HTML, no vendor tag, no database call, so the
 * token never sits in the address of a page that loads GA4, Pixel or Clarity. The Location is relative
 * and carries nothing. A token of the wrong shape sets nothing and still lands on the wizard.
 *
 * Rollback rule: this file depends on lib/season1/betaRestartCookies.ts alone. A revert of the rest of
 * the feature keeps both, so a link already in someone's inbox never meets a 404 page that loads tags.
 */
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  let token = "";
  try {
    token = (await ctx.params).token;
  } catch {
    token = "";
  }
  const headers = new Headers({
    Location: "/season1/beta/start",
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    "X-Robots-Tag": "noindex",
  });
  if (isRestartTokenShape(token)) for (const c of restartSetCookies(token)) headers.append("Set-Cookie", c);
  return new Response(null, { status: 302, headers });
}
