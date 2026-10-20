import fs from "fs";
import path from "path";

// Landing page for the Day 0 email's "What do they play most?" tap answers,
// served at /season1/thanks?play=fortnite|minecraft|roblox|other.
// Same pattern as /season1: a self-contained static HTML file served by a
// route handler so it stays OUTSIDE app/layout.tsx. That is deliberate: the
// layout fires the Meta Pixel PageView, and the answer in ?play= must stay in
// Klaviyo (recorded as the email click) and never reach Meta. GA only.
// The page reads ?play= client-side, so a static response is correct.
export const dynamic = "force-static";

export function GET() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "app", "season1", "thanks", "thanks.html"),
    "utf8",
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
