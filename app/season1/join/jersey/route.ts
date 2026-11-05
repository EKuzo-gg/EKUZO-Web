import fs from "fs";
import path from "path";
import { renderJoin } from "@/lib/season1/joinPage";
import { currentMode, isLiveHost } from "@/lib/season1/mode";
import { SRC_VALUES } from "@/lib/season1/validate";
import { pageSecurityHeaders } from "@/lib/season1/httpGuard";
import { tagsForRequest } from "@/lib/season1/tags";

// Season 01 join, JERSEY variant, /season1/join/jersey: the landing page for the
// Southie jersey ads (d19 to d21). The ad's hero (team walk photo, jersey, same
// headline) sits on top of join B, everything below the hero is join B as is.
// The hero reads ?ad= in the browser (d19 default, d20, d21). Same renderer and
// template vars as /season1/join. Original header:
// Season 01 front door, /season1/join. Cloned from
// /season1/early-access/early-access.html with the deltas in
// docs/season1-commit/02d-spec-slice4.md (C1 to C5, C7, C8, C10, C15, closed
// state). Prices and dates come from lib/season1/offer.ts; the closed state
// from mode and the commit window; the jersey line from the jersey cutoff.
// HTML lives beside this file (literal path, never public/). Served OUTSIDE
// app/layout.tsx: its head tags (GA4, Pixel, Clarity) come from lib/season1/tags.ts.
export const dynamic = "force-dynamic";

const TEMPLATE_PATH = path.join(process.cwd(), "app", "season1", "join", "jersey", "join-jersey.html");

export function GET(request: Request) {
  const host = request.headers.get("host");
  const mode = currentMode(host);
  const indexable = false;
  const srcParam = new URL(request.url).searchParams.get("src");
  const src = srcParam && (SRC_VALUES as readonly string[]).includes(srcParam) ? srcParam : null;
  const tpl = fs.readFileSync(TEMPLATE_PATH, "utf8");
  const html = renderJoin(tpl, { now: new Date(), mode, src, tags: tagsForRequest(request, "join", mode), seo: { indexable } });
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "private, no-store",
      ...(indexable ? {} : { "x-robots-tag": "noindex" }),
      "referrer-policy": "origin",
      ...pageSecurityHeaders(mode),
    },
  });
}
