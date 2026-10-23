import fs from "fs";
import path from "path";

// Season 01 sign-up form (prototype), /season1/early-access/signup. ?from=Name when a friend joins through a crew link.
// Static HTML served by a route handler, OUTSIDE app/layout.tsx, so no Meta
// Pixel fires (same pattern as /season1 and /season1/thanks). GA only.
// Prototype: payments are not connected; the page says so in a banner.
export const dynamic = "force-static";

export function GET() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "app", "season1", "early-access", "signup", "signup.html"),
    "utf8",
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
