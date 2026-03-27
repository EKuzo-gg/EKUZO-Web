# Torn Paper Divider Challenge — Cross-LLM Collaboration Brief

## The Problem

We need torn paper section dividers that look like **actual ripped paper** — organic, highly detailed, dramatic edges with micro-texture. What we currently have looks like a gentle sine wave with sharp corners. The difference is night and day.

## Visual Reference

**What we have** (current SVG paths): Gentle undulation with ~66 evenly-spaced points across 2400px. Y values range from ~36–76 out of a 100-unit viewBox. Looks like a mountain range drawn by connecting dots on graph paper.

**What we need** (original PNG assets from Framer): Rich, organic torn paper edges with hundreds of micro-features — tiny fibers, irregular rips, deep tears next to shallow ones, dramatic peaks and valleys. The kind of edge you'd get if you actually tore a piece of construction paper.

The original PNGs are at:
- `public/images/torn-paper-red-1.png` (4320×600, 25KB)
- `public/images/torn-paper-black-1.png` (5760×800, 39KB)
- `public/images/torn-paper-black-2.png` (4320×744, 26KB)
- `public/images/torn-paper-white-1.png` (4320×600, 25KB)

## Root Cause Analysis

The current SVG paths in `TornPaperDivider.tsx` are **low-fidelity approximations**, not traces of the original assets. Here's the data:

| Metric | Current SVGs | What's needed |
|--------|-------------|---------------|
| Control points | ~66 per path | 500–2000+ per path |
| Point spacing | Even 36px intervals | Irregular, clustered at detail areas |
| Y-value range | 34px (41–75 of 100) | 60–80px of 100 (dramatic peaks/valleys) |
| Edge character | Geometric zigzag | Organic, fibrous, irregular |
| Micro-detail | None | Tiny spurs, fiber-like protrusions |

The paths were hand-written with evenly spaced L (line-to) commands. They capture the general wave shape but none of the organic texture that makes torn paper look like torn paper.

## Constraints

1. **Must be inline SVG** — We tried `<img>` and `background-image` approaches with the PNGs. The browser rasterizes them, which causes interpolation smoothing at non-native sizes. Inline SVG rendered by the browser's vector engine gives the crispest result at any size.

2. **Color flexibility** — We need the same torn edge in 5 colors (black, red, white, grey `#EFEEED`, purple `#AE2CF2`). PNGs are baked to one color. SVGs let us change `fill`.

3. **Performance** — Path data lives in the component as a JS string. ~2000 points × 5 colors is ~50KB of path data. That's fine — it's less than a single PNG.

4. **Rendering** — `preserveAspectRatio="none"` stretches the SVG to fill container width. Height is `clamp(50px, 6vw, 100px)`. Negative margins overlap adjacent sections.

5. **No external dependencies** — Can't use Inkscape/Illustrator/Potrace at build time. Solution must produce static path strings that get embedded in the component.

## Current Component

```tsx
// components/ui/TornPaperDivider.tsx
type TornPaperDividerColor = "red" | "black" | "white" | "grey" | "purple";

const fillMap: Record<TornPaperDividerColor, string> = {
  black: "#000000",
  red: "#F92524",
  white: "#ffffff",
  grey: "#EFEEED",
  purple: "#AE2CF2",
};

const pathMap: Record<TornPaperDividerColor, string> = {
  black: "M0,0 H2400 V65 L2364,64 L2328,55 ...(~66 points)... L0,57 Z",
  red:   "M0,0 H2400 V57 L2364,55.5 ...(~66 points)... L0,63 Z",
  white: "M0,0 H2400 V52 L2364,54 ...(~66 points)... L0,67 Z",
  grey:  "M0,0 H2400 V55 L2364,57 ...(~66 points)... L0,69 Z",
  purple:"M0,0 H2400 V59 L2364,60 ...(~66 points)... L0,37 Z",
};

export default function TornPaperDivider({
  color = "black",
  flip = false,
}: { color?: TornPaperDividerColor; flip?: boolean }) {
  return (
    <div
      className="relative w-full pointer-events-none select-none"
      style={{
        height: "clamp(50px, 6vw, 100px)",
        marginTop: "calc(-1 * clamp(25px, 3vw, 50px))",
        marginBottom: "calc(-1 * clamp(25px, 3vw, 50px))",
        zIndex: 10,
        ...(flip ? { transform: "scaleY(-1)" } : {}),
      }}
      aria-hidden="true"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 2400 100"
        preserveAspectRatio="none"
        fill="none"
        style={{ display: "block", width: "100%", height: "100%" }}
      >
        <path fill={fillMap[color]} d={pathMap[color]} />
      </svg>
    </div>
  );
}
```

## What Needs to Happen

Replace the 5 path strings in `pathMap` with high-fidelity torn paper edge paths. Each path should:

1. **Start with** `M0,0 H2400 V{startY}` — fills from top-left across, then drops to the torn edge start
2. **Trace the torn edge** left-to-right with L commands (line-to) or a mix of L and small C/Q curves for organic flow
3. **End with** `L0,{endY} Z` — closes back to origin

### Approach A: Trace the Original PNGs (Recommended)

Write a script (Node.js or Python) that:
1. Loads each original PNG (e.g., `torn-paper-red-1.png`, 4320×600)
2. Scans each column (or every Nth column) to find the top edge of the colored region (first non-transparent pixel from top)
3. Outputs an SVG path `d` string with those edge coordinates, mapped to a 2400×100 viewBox
4. Uses adaptive sampling — more points where the edge changes rapidly, fewer where it's smooth

The PNGs use transparency, so edge detection = finding the alpha boundary.

**Target**: 500–1500 points per path. Enough for micro-detail but not so many that the string is massive.

### Approach B: Procedural Generation

Write a function that generates realistic torn paper paths:
1. **Macro shape**: Perlin/simplex noise at low frequency for broad hills and valleys (amplitude: 30–50 units)
2. **Meso detail**: Medium-frequency noise for mid-size tears (amplitude: 10–20 units)
3. **Micro texture**: High-frequency noise for tiny paper-fiber protrusions (amplitude: 2–5 units)
4. **Irregularity**: Randomize point spacing (not evenly distributed)

Each color gets a different seed so they don't look identical.

### Approach C: Hybrid

Trace the PNGs for the macro shape, then add procedural micro-texture on top.

## Proof of Concept — It Works

We wrote a Python tracer (`scripts/trace-torn-paper.py`) that scans each column of the PNG to find the bottom edge of the opaque region, maps to the 2400×100 viewBox, then simplifies with Ramer-Douglas-Peucker.

Results for `torn-paper-red-1.png`:

| RDP Tolerance | Points | Path chars | Visual quality |
|--------------|--------|-----------|----------------|
| 0.12 | 890 | 11KB | Good — captures macro/meso detail, misses micro-fibers |
| 0.08 | 1588 | ~18KB | Very good — most detail preserved |
| 0.05 | 2096 | 26KB | Excellent — nearly indistinguishable from PNG |

A comparison page at `public/torn-paper-compare.html` shows all 4 versions side-by-side (original PNG, 2096-point trace, 890-point trace, current 66-point hand-written). The difference is dramatic.

**Recommended sweet spot: tolerance 0.05–0.08 (~1500–2000 points).** At the actual display height of 50–100px, the 0.05 trace is indistinguishable from the PNG original.

The hi-fi traced path for red is already in `public/images/torn-paper-red-1-hifi.svg`.

## Key Insight

The fundamental mistake in the previous approach was treating this as a "connect 66 dots" problem. Real torn paper has **fractal-like detail** — texture at every scale. You need hundreds of points to capture that, and the Y-value range needs to be dramatic (using 60–80% of the viewBox height, not 34%).

## Files to Modify

Only one file needs to change: `components/ui/TornPaperDivider.tsx`

Specifically, replace the 5 strings in `pathMap` with the new high-fidelity paths. Everything else (the component structure, the fillMap, the CSS, how it's used in pages) stays the same.

## Testing

After generating new paths, verify by:
1. Opening `localhost:3001/ekuzocamps-seasonal`
2. Scrolling through all 7 torn paper dividers
3. Comparing the edge quality against the original PNGs viewed at `localhost:3001/images/torn-paper-red-1.png`

The edges should have visible micro-texture — tiny spurs, irregular tears, fibrous protrusions — not just smooth zigzag lines.

## Remaining Work

1. **Trace all 4 base PNGs** using `scripts/trace-torn-paper.py` at tolerance 0.05:
   - `torn-paper-red-1.png` → red path (done, in `torn-paper-red-1-hifi.svg`)
   - `torn-paper-black-2.png` → black path
   - `torn-paper-white-1.png` → white path
   - `torn-paper-black-1.png` → could be a 2nd black variant or basis for grey/purple

2. **Generate color variants**: grey and purple don't have their own PNGs. Options:
   - Reuse one of the black traces with a different fill color (simplest)
   - Trace `torn-paper-black-1.png` for grey, `torn-paper-black-2.png` for purple (gives unique edges)

3. **Update `TornPaperDivider.tsx`**: Replace the 5 path strings in `pathMap` with the traced paths.

4. **Verify on the camps page**: All 7 dividers should now have the organic torn paper feel.

5. **Performance check**: ~2000 points × 5 colors = ~130KB of path strings in JS. This is fine — it's less than the PNGs they replace and gets tree-shaken if unused colors aren't referenced.

## Original PNG Edge for Reference

If you load `public/images/torn-paper-red-1.png` (4320×600), you'll see the target quality. The torn edge has:
- Deep V-shaped rips alternating with shallow wavering sections
- Tiny fiber-like protrusions (1–3px at original scale) along the entire edge
- Asymmetric peaks — some sharp, some rounded, some with secondary tears
- Overall Y amplitude using roughly 60% of the image height
- Irregular rhythm — clusters of detail followed by smoother stretches

This is the bar. The current 66-point paths don't come close.
