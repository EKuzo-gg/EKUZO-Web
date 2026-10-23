import fs from "fs";
import path from "path";

// Season 01 waitlist early-access page, /season1/early-access.
// Static HTML served by a route handler, OUTSIDE app/layout.tsx, so no Meta
// Pixel fires (same pattern as /season1 and /season1/thanks). GA only.
// Prototype: payments are not connected; the page says so in a banner.
export const dynamic = "force-static";

export function GET() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "app", "season1", "early-access", "early-access.html"),
    "utf8",
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
