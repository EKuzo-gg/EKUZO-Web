/**
 * Moves a visitor from an old Season 01 prototype URL to a bare new path, with
 * the query string dropped on purpose: the old links carried kid names
 * (?kid=, ?from=). A target may end in one `#fragment` (an on-page anchor such
 * as `#season-01`); the path and the fragment are each stripped to a safe
 * character set, so nothing else can ride along.
 *
 * This is a 200 page that navigates in the browser, not an HTTP 301: Netlify
 * re-appends the incoming query to the Location of a function's redirect
 * (Sentry final D1, 2026-10-27), which would carry the kid name onward. The
 * referrer meta keeps the old URL out of the next page's document.referrer, so
 * GA never sees it. No analytics load on this page.
 */
export function redirectToBare(_request: Request, path: string): Response {
  const hashAt = path.indexOf("#");
  const bare = (hashAt < 0 ? path : path.slice(0, hashAt)).replace(/[^A-Za-z0-9/_-]/g, "");
  const frag = hashAt < 0 ? "" : path.slice(hashAt + 1).replace(/[^A-Za-z0-9_-]/g, "");
  const target = frag ? `${bare}#${frag}` : bare;
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="referrer" content="no-referrer">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0;url=${target}">
<title>EKUZO Season 01</title>
<script>location.replace(${JSON.stringify(target)});</script>
</head><body><p><a href="${target}">Continue to EKUZO Season 01</a></p></body></html>`;
  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex",
      "referrer-policy": "no-referrer",
      "x-frame-options": "DENY",
      "x-content-type-options": "nosniff",
    },
  });
}
