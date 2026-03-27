#!/usr/bin/env python3
"""
Trace the torn edge from a PNG image and output a high-fidelity SVG path.

The original torn paper PNGs (from Framer) have a colored region with transparency.
We scan each column to find the bottom edge of the opaque region, then map those
coordinates to a 2400×100 SVG viewBox.

Uses Ramer-Douglas-Peucker simplification to keep detail where the edge is complex
while reducing points in smooth areas.

Usage:
    python3 scripts/trace-torn-paper.py public/images/torn-paper-red-1.png "#F92524" > red-path.txt
"""

import sys
import os
import math
from PIL import Image

# Target viewBox
VIEW_W = 2400
VIEW_H = 100

# Alpha threshold
ALPHA_THRESHOLD = 128

# RDP tolerance — lower = more detail, more points
RDP_TOLERANCE = 0.12


def find_bottom_edge(img):
    """For each column, find the bottom-most opaque pixel."""
    width, height = img.size
    pixels = img.load()
    edge = []

    for x in range(width):
        bottom_y = 0
        for y in range(height):
            pixel = pixels[x, y]
            # Handle both RGBA and RGB+palette
            if len(pixel) >= 4:
                alpha = pixel[3]
            else:
                alpha = 255  # fully opaque
            if alpha >= ALPHA_THRESHOLD:
                bottom_y = y
        edge.append((x, bottom_y))

    return edge


def find_top_edge(img):
    """For each column, find the top-most opaque pixel."""
    width, height = img.size
    pixels = img.load()
    edge = []

    for x in range(width):
        top_y = height - 1
        for y in range(height):
            pixel = pixels[x, y]
            if len(pixel) >= 4:
                alpha = pixel[3]
            else:
                alpha = 255
            if alpha >= ALPHA_THRESHOLD:
                top_y = y
                break
        edge.append((x, top_y))

    return edge


def perpendicular_distance(point, line_start, line_end):
    """Distance from point to line defined by line_start and line_end."""
    dx = line_end[0] - line_start[0]
    dy = line_end[1] - line_start[1]
    len_sq = dx * dx + dy * dy

    if len_sq == 0:
        ex = point[0] - line_start[0]
        ey = point[1] - line_start[1]
        return math.sqrt(ex * ex + ey * ey)

    num = abs(dy * point[0] - dx * point[1] +
              line_end[0] * line_start[1] - line_end[1] * line_start[0])
    return num / math.sqrt(len_sq)


def rdp(points, tolerance):
    """Ramer-Douglas-Peucker line simplification."""
    if len(points) <= 2:
        return points

    max_dist = 0
    max_idx = 0
    first = points[0]
    last = points[-1]

    for i in range(1, len(points) - 1):
        d = perpendicular_distance(points[i], first, last)
        if d > max_dist:
            max_dist = d
            max_idx = i

    if max_dist > tolerance:
        left = rdp(points[:max_idx + 1], tolerance)
        right = rdp(points[max_idx:], tolerance)
        return left[:-1] + right
    else:
        return [first, last]


def round_val(n):
    return round(n * 10) / 10


def trace(input_file, fill_color):
    img = Image.open(input_file).convert("RGBA")
    width, height = img.size
    print(f"Image: {width}×{height}", file=sys.stderr)

    # Detect whether this is a top-fill (color at top, torn edge at bottom)
    # or needs special handling. Check a few columns in the middle.
    mid_x = width // 2
    pixels = img.load()

    # Check if top row is opaque (top-fill) or bottom row is opaque (bottom-fill)
    top_alpha = pixels[mid_x, 5][3] if len(pixels[mid_x, 5]) >= 4 else 255
    bot_alpha = pixels[mid_x, height - 5][3] if len(pixels[mid_x, height - 5]) >= 4 else 255

    # Always use bottom edge — the torn paper fills from above,
    # and the torn tear is at the bottom of the opaque region.
    print("Tracing bottom edge of opaque region", file=sys.stderr)
    raw_edge = find_bottom_edge(img)

    print(f"Raw edge points: {len(raw_edge)}", file=sys.stderr)

    # Map to viewBox coordinates
    mapped = [
        (p[0] / width * VIEW_W, p[1] / height * VIEW_H)
        for p in raw_edge
    ]

    # Increase recursion limit for RDP on large point sets
    sys.setrecursionlimit(max(10000, len(mapped) * 2))

    # Simplify with RDP
    simplified = rdp(mapped, RDP_TOLERANCE)
    print(f"Simplified to {len(simplified)} points (tolerance {RDP_TOLERANCE})", file=sys.stderr)

    # If still too many, increase tolerance
    tolerance = RDP_TOLERANCE
    while len(simplified) > 2000:
        tolerance *= 1.5
        simplified = rdp(mapped, tolerance)
        print(f"Re-simplified to {len(simplified)} points (tolerance {tolerance:.3f})", file=sys.stderr)

    # Build SVG path (top-fill: filled from top, torn edge at bottom)
    # Path: M0,0 → H2400 → down to first edge point → trace edge → back to 0,endY → Z
    first = simplified[0]
    last = simplified[-1]

    # The path fills from the top of the viewBox down to the torn edge.
    # We go right-to-left along the edge (since we start at x=2400 after H2400).
    reversed_pts = list(reversed(simplified))

    parts = [f"M0,0 H{VIEW_W} V{round_val(reversed_pts[0][1])}"]

    for pt in reversed_pts[1:]:
        parts.append(f"L{round_val(pt[0])},{round_val(pt[1])}")

    parts.append("Z")
    d = " ".join(parts)

    # Print the d attribute
    print(d)

    # Also write a test SVG file
    out_name = os.path.splitext(os.path.basename(input_file))[0] + "-traced.svg"
    out_dir = os.path.dirname(input_file)
    out_path = os.path.join(out_dir, out_name)

    svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {VIEW_W} {VIEW_H}" preserveAspectRatio="none" fill="none">
  <path fill="{fill_color}" d="{d}"/>
</svg>"""

    with open(out_path, "w") as f:
        f.write(svg)
    print(f"Wrote test SVG: {out_path}", file=sys.stderr)
    print(f"Path length: {len(d)} chars", file=sys.stderr)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 trace-torn-paper.py <png-file> [fill-color]", file=sys.stderr)
        sys.exit(1)

    input_file = sys.argv[1]
    fill_color = sys.argv[2] if len(sys.argv) > 2 else "#000000"
    trace(input_file, fill_color)
