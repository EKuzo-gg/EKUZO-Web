#!/usr/bin/env node
/**
 * trace-torn-paper.js
 *
 * Traces the torn edge from a PNG image and outputs a high-fidelity SVG path.
 *
 * The original torn paper PNGs (from Framer) are 4320×600 with transparency.
 * The colored region is opaque; the background is transparent.
 * We scan each column to find the BOTTOM edge of the colored region
 * (last opaque pixel from top), then map those coordinates to a 2400×100 viewBox.
 *
 * Usage:
 *   npm install sharp  (if not installed)
 *   node scripts/trace-torn-paper.js public/images/torn-paper-red-1.png "#F92524"
 *
 * Output: prints an SVG path `d` attribute string to stdout.
 */

const sharp = require("sharp");
const path = require("path");

const [, , inputFile, fillColor = "#000000"] = process.argv;

if (!inputFile) {
  console.error("Usage: node trace-torn-paper.js <png-file> [fill-color]");
  process.exit(1);
}

// Target viewBox dimensions
const VIEW_W = 2400;
const VIEW_H = 100;

// Minimum alpha to consider a pixel "opaque"
const ALPHA_THRESHOLD = 128;

// Adaptive sampling: keep points where the slope changes significantly.
// This reduces point count in smooth areas while preserving detail in jagged areas.
const SLOPE_THRESHOLD = 0.3; // radians — smaller = more points kept
const MAX_GAP = 8; // max viewBox-X units between points (forces points even in smooth areas)
const MIN_GAP = 0.5; // min gap to avoid redundant points

async function trace(file) {
  const img = sharp(path.resolve(file));
  const metadata = await img.metadata();
  const { width, height } = metadata;

  console.error(`Image: ${width}×${height}`);

  // Extract raw RGBA pixel data
  const { data } = await img.raw().ensureAlpha().toBuffer({ resolveWithObject: true });

  // For each column, find the bottom-most opaque pixel (the torn edge)
  // The PNG fills from top; the torn edge is where opacity ends.
  const rawEdge = [];

  for (let x = 0; x < width; x++) {
    let bottomY = 0;
    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      if (alpha >= ALPHA_THRESHOLD) {
        bottomY = y;
      }
    }
    rawEdge.push({ x, y: bottomY });
  }

  console.error(`Raw edge points: ${rawEdge.length}`);

  // Map to viewBox coordinates
  const mapped = rawEdge.map((p) => ({
    x: (p.x / width) * VIEW_W,
    y: (p.y / height) * VIEW_H,
  }));

  // Adaptive simplification using Ramer-Douglas-Peucker algorithm
  const simplified = rdp(mapped, 0.15); // tolerance in viewBox units — lower = more detail

  console.error(`Simplified to ${simplified.length} points`);

  // Ensure we don't exceed a reasonable point count (cap at ~2000)
  // If still too many, increase tolerance
  let finalPoints = simplified;
  if (finalPoints.length > 2000) {
    finalPoints = rdp(mapped, 0.3);
    console.error(`Re-simplified to ${finalPoints.length} points (tolerance 0.3)`);
  }
  if (finalPoints.length > 2000) {
    finalPoints = rdp(mapped, 0.5);
    console.error(`Re-simplified to ${finalPoints.length} points (tolerance 0.5)`);
  }

  // Build SVG path
  // Start: fill from top-left, across top, down to first edge point
  const first = finalPoints[0];
  const last = finalPoints[finalPoints.length - 1];

  let d = `M0,0 H${VIEW_W} V${round(first.y)}`;

  // Trace edge from right to left (our points go left to right, but SVG path
  // should go right to left since we start at top-right after H2400)
  // Actually, let's reverse: start from x=2400, trace leftward
  const reversed = [...finalPoints].reverse();

  for (let i = 0; i < reversed.length; i++) {
    const p = reversed[i];
    d += ` L${round(p.x)},${round(p.y)}`;
  }

  d += " Z";

  // Output
  console.log(d);

  // Also output a complete SVG for testing
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" preserveAspectRatio="none" fill="none">
  <path fill="${fillColor}" d="${d}"/>
</svg>`;

  // Write test SVG
  const outName = path.basename(file, ".png") + "-traced.svg";
  const outPath = path.join(path.dirname(file), outName);
  require("fs").writeFileSync(outPath, svg);
  console.error(`Wrote test SVG: ${outPath}`);
}

/**
 * Ramer-Douglas-Peucker line simplification
 * Removes points that are within `tolerance` distance of the line between their neighbors.
 */
function rdp(points, tolerance) {
  if (points.length <= 2) return points;

  // Find the point with the maximum distance from the line between first and last
  let maxDist = 0;
  let maxIdx = 0;

  const first = points[0];
  const last = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], first, last);
    if (d > maxDist) {
      maxDist = d;
      maxIdx = i;
    }
  }

  if (maxDist > tolerance) {
    // Recurse on both halves
    const left = rdp(points.slice(0, maxIdx + 1), tolerance);
    const right = rdp(points.slice(maxIdx), tolerance);
    return [...left.slice(0, -1), ...right];
  } else {
    // All points between first and last are within tolerance — discard them
    return [first, last];
  }
}

function perpendicularDistance(point, lineStart, lineEnd) {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    // lineStart and lineEnd are the same point
    const ex = point.x - lineStart.x;
    const ey = point.y - lineStart.y;
    return Math.sqrt(ex * ex + ey * ey);
  }

  const num = Math.abs(dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x);
  return num / Math.sqrt(lenSq);
}

function round(n) {
  return Math.round(n * 10) / 10;
}

trace(inputFile).catch((err) => {
  console.error(err);
  process.exit(1);
});
