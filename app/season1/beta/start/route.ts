import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { BETA_PROGRESS_JS } from "@/lib/season1/betaProgressScript";
import { fillTags, renderStaticTags } from "@/lib/season1/tags";

// BETA sign-up wizard, served at /season1/beta/start. Parents arrive from the wizard invite
// email (after joining on /season1/beta or replying to Karlin). Same pattern as the other
// Season 01 pages: a self-contained static HTML file next to this handler, with the head
// tags from lib/season1/tags.ts. The page's own script posts the answers to /api/season-one
// with step "beta-wizard" on ekuzo.gg only. See docs/beta-wizard-handoff.md.
// This handler also appends the drop-off capture script (Jamie's lane; see betaProgressScript.ts).
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
    fs.readFileSync(path.join(process.cwd(), "app", "season1", "beta", "start", "start.html"), "utf8"),
    "",
    renderStaticTags("landing"),
  ).split("{{BUILD}}").join(buildRef())
    // Drop-off capture and same-device restart (lib/season1/betaProgressScript.ts), appended after the page's own
    // script so start.html stays as Aaron wrote it. A function replacer: the script contains "$" sequences.
    .replace("</body>", () => `<script>${BETA_PROGRESS_JS}</script>\n</body>`);
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
