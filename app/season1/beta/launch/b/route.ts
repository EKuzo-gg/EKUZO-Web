import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fillTags, renderStaticTags } from "@/lib/season1/tags";

// OPTION B of the BETA launch page, served at /season1/beta/launch/b. The working copy
// Aaron keeps changing; /season1/beta/launch is the version sent to the team to go live.
// Same static-HTML pattern, no form, every button links to /season1/beta/start.
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
    fs.readFileSync(path.join(process.cwd(), "app", "season1", "beta", "launch", "b", "launch-b.html"), "utf8"),
    "",
    renderStaticTags("landing"),
  ).split("{{BUILD}}").join(buildRef());
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
