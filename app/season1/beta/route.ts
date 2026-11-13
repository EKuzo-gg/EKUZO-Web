import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fillTags, renderStaticTags } from "@/lib/season1/tags";

// BETA join page, served at /season1/beta: the free 2-week beta before Season 01.
// Built like the Join page (app/season1/join/jersey: hero with the offer card, torn-paper
// bands, coaches, FAQ, sticky bar) with one ask: the parent's email. The form posts to
// /api/season-one exactly as the ad landing does (the payload's `page` is /season1/beta).
// beta-ad-landing.html in this folder is the earlier version, a copy of the ad landing;
// it is kept for reference and is not served. Original header:
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

// Build marker (OR7): <meta name="s1-build"> carries the commit this page was built from, so a
// harness run or a phone check can tell a stale deploy from this one. Netlify sets COMMIT_REF;
// a local build asks git. Read once, at build time (force-static).
function buildRef(): string {
  if (process.env.COMMIT_REF) return process.env.COMMIT_REF.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim() || "dev";
  } catch {
    return "dev";
  }
}

export function GET() {
  const html = fillTags(
    fs.readFileSync(path.join(process.cwd(), "app", "season1", "beta", "beta.html"), "utf8"),
    "",
    renderStaticTags("landing"),
  ).split("{{BUILD}}").join(buildRef());
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
