import fs from "fs";
import path from "path";
import { fillTags, renderStaticTags } from "@/lib/season1/tags";

// Season 01 ad landing page, served natively at /season1.
// It is a route handler (not a page.tsx) because the page is a self-contained
// static HTML file that Aaron designs directly (own head, pixel, fonts, script),
// and it must stay outside app/layout.tsx. The file sits next to this handler,
// not under public/, so there is no second public address and no rewrite or
// redirect is needed. The query string (?ad=, utm_*) is read client-side by the
// page's own script, so a static response is correct for every query.
// Head tags (GA4, Pixel, Clarity) come from lib/season1/tags.ts and decide live
// versus QA from location.hostname in the browser (analytics C12), since a
// force-static page never sees the request Host.
export const dynamic = "force-static";

export function GET() {
  const html = fillTags(
    fs.readFileSync(path.join(process.cwd(), "app", "season1", "landing.html"), "utf8"),
    "",
    renderStaticTags("landing"),
  );
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
