/**
 * Permanent redirect to a bare path on the request's own origin. The query
 * string is dropped on purpose: the old Season 01 prototype links carried kid
 * names (?kid=, ?from=). Origin comes from request.url (what Next derived),
 * never from x-forwarded-host.
 */
export function redirectToBare(request: Request, path: string): Response {
  const origin = new URL(request.url).origin;
  return new Response(null, {
    status: 301,
    headers: {
      location: `${origin}${path}`,
      "cache-control": "no-store",
      "x-robots-tag": "noindex",
      "referrer-policy": "no-referrer",
    },
  });
}
