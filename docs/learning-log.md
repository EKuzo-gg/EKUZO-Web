# EKUZO Web — Learning Log

Hard-won build lessons extracted from `CLAUDE.md` (2026-06-07) to keep the root file lean.
CLAUDE.md keeps a one-line trigger for each of these; the full explanation lives here.

Entries (each is a scar from a real mistake):

1. [Torn Paper Dividers — Two Systems](#torn-paper-dividers--two-systems)
2. [Never `fs.readFileSync` from `public/` in server code](#never-fsreadfilesync-from-public-in-server-code)
3. [Figma Asset Downloads](#figma-asset-downloads)
4. [Button States](#button-states)
5. [Font Display](#font-display)
6. [Sheets automation: poll, don't trust onChange](#sheets-automation-poll-dont-trust-onchange)

---

## Torn Paper Dividers — Two Systems

**Assets live in:** `public/images/new torn paper/`

There are two types of torn paper dividers. Know which one you need before building.

### 1. One-sided dividers (tops & bottoms) — use `<TornPaperDivider>`
- These are the standard system. Each PNG has texture on ONE edge only (top or bottom).
- Naming: `torn-paper-{color}-top-{style}@2x.png` / `torn-paper-{color}-bottom-{style}@2x.png`
- Colors: white, grey, black, red. Styles: 1, 2.
- Use via `<TornPaperDivider color="grey" variant="top" style={1} />`
- **Placement rule:** The divider must be OUTSIDE the `overflow-clip` section but INSIDE an `overflow-visible` wrapper div. If you put it inside the clipped section, the overlapping half gets cut off and it won't be visible.
- Pattern:
  ```jsx
  <div className="relative overflow-visible">
    <TornPaperDivider color="grey" variant="top" style={1} />
    <section className="bg-[#f0edea] relative overflow-clip">
      ...
    </section>
    <TornPaperDivider color="grey" variant="bottom" style={1} />
  </div>
  ```

### 2. Whole dividers (both edges) — raw background-image div
- These PNGs have paper texture on BOTH the top and bottom edges. They straddle two sections.
- Naming: `torn-paper-{color}-{style}@2x.png` (no "top"/"bottom" suffix)
- **Do NOT use `<TornPaperDivider>` for these.** Use a raw `<div>` with `backgroundImage`.
- The div is positioned absolutely at the bottom of a wrapper, with `translateY(52%)` so it hangs half into the section below.
- **Critical:** The div must be a child of the `overflow-visible` wrapper, NOT inside the `overflow-clip` section. Otherwise the bottom half gets clipped and you won't see it overlap.
- The wrapper needs `zIndex: 1` and the section below needs `zIndex: 0` (or its wrapper does) so the torn paper renders on top.
- The section below should use negative `marginTop` + extra `paddingTop` so its background extends up behind the torn paper.
- Pattern (see methodology hero → How It Works for reference):
  ```jsx
  {/* Section above */}
  <div className="relative overflow-visible" style={{ zIndex: 1 }}>
    <section className="bg-white relative overflow-clip" style={{ paddingBottom: "clamp(160px, 22vw, 300px)" }}>
      ...
    </section>
    {/* Whole torn paper — OUTSIDE section, INSIDE wrapper */}
    <div
      className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none select-none"
      style={{
        height: "clamp(115px, 19vw, 300px)",
        transform: "translateY(52%)",
        backgroundImage: "url(/images/new%20torn%20paper/torn-paper-grey-1@2x.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      aria-hidden="true"
    />
  </div>

  {/* Section below — pulled up behind the torn paper */}
  <div className="relative overflow-visible" style={{ zIndex: 0 }}>
    <section className="bg-[#f0edea] relative"
      style={{ marginTop: "clamp(-60px, -10vw, -150px)", paddingTop: "clamp(140px, 24vw, 294px)" }}>
      ...
    </section>
  </div>
  ```

**Common mistake:** Putting the torn paper div inside the `overflow-clip` section. It will look like the bottom is being cut off / overrun by the section below. Move it outside the section into the `overflow-visible` wrapper to fix.

---

## Never `fs.readFileSync` from `public/` in server code

**What broke:** April 14, 2026. `lib/schema.ts` read testimonial `.txt` captions at module load via `fs.readFileSync(path.join(process.cwd(), "public", "testimonial-videos", ...))` to populate `VideoObject` structured data. Local builds passed. Netlify **deploy** (not build) failed at the function-upload step — the zipped `___netlify-server-handler.zip` exceeded Netlify's 50MB limit because Next.js file tracing pulled the entire `public/testimonial-videos/` directory (420MB of MP4s) into the serverless function bundle.

**Why:** Files under `public/` are normally served from the CDN and never bundled into server functions. But `fs.readFileSync` with a path under `public/` causes Next.js static analysis to trace that directory into the function bundle — it has no way to know you only wanted the `.txt` files, so it grabs everything. The MP4 siblings got swept up.

**Rules:**
1. **Never** `fs.readFileSync` (or any `fs` call) against a path under `public/` from server code. Not in server components, not in route handlers, not at module scope.
2. If you need file content at runtime and it's small and static, inline it as a string literal in a `.ts` module (see `lib/testimonialTranscripts.ts` for the pattern).
3. If you need file content at build time only, read it in a Node script and write out a generated `.ts` file that gets imported.
4. If you genuinely need to read a file at runtime, put it outside `public/` (e.g. `data/`) so file tracing can include just that file.
5. Belt-and-suspenders: `next.config.mjs` now has `outputFileTracingExcludes` to keep `public/testimonial-videos/**` out of all function bundles. Don't remove it — it only costs a line of config and it's a hard guard.
6. `next build` succeeding locally does NOT prove the Netlify deploy will succeed. It only proves the Next.js build compiled. The function-size limit is enforced at deploy time. Check `.next/server` size (`du -sh .next/server`) and `find .next -name "*.mp4"` before pushing anything that touches file I/O.

Fixed in commit `a01929e` ("Fix Netlify deploy: inline testimonial transcripts, exclude videos from trace").

---

## Figma Asset Downloads

- Figma MCP asset URLs are blocked by the VM proxy (exit code 56 from curl). When a Figma asset is needed, ask the user to export it from Figma and drop it into the project. Reference the Figma component name so they know what to export.

---

## Button States

- All interactive buttons should have: `hover:brightness-110 active:scale-[0.97~0.99] active:brightness-90 transition-all duration-150`
- Matches the existing `Button.tsx` variant pattern

---

## Font Display

- Tungsten Narrow is loaded as a local font (not Google Fonts). Weights: Black (900), Bold (700), Semibold (600), Medium (500).
- Global `letter-spacing: 0.02em` on `.font-display` in `globals.css` — do not override per-element unless intentional.
- Remove per-element `letterSpacing` style props on `font-display` elements so the global value applies consistently.

---

## Sheets automation: poll, don't trust onChange
<!-- Added 2026-07-15 from knowledge-base system/loops/lessons-pending/2026-07-15-sheets-polling-over-onchange.md (learning loop 2026-W29, mid-week run) -->

- When reacting to new rows on a sheet that our Apps Script web app writes (ekuzo-purchases, squads, squad_members), do NOT use onChange/onEdit triggers — Google doesn't reliably fire triggers for changes made by Apps Script itself, so the automation passes manual testing (manual row adds fire it) and then silently misses every webhook-written row in production.
- Default pattern: time-based trigger (5 min) + last-processed-row pointer in Script Properties + LockService around the run. Detects rows added by webhook, manual edit, or API identically. Polling cost is negligible at our volume.
- Keep add-on features (notifications, syncs) in their own script file, never inside the payment-path `doPost`. If sub-minute latency ever genuinely matters, emit from the writer itself as a deliberate trade, isolated in try/catch so it can never fail the row write.
- Reference implementation: `docs/apps-script-registration-notifier.gs` (Karlin registration notifier, 2026-07-15).
