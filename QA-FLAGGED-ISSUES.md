# QA Flagged Issues — March 26, 2026

Items that couldn't be resolved to pixel-perfect during this QA pass. Review these with a running dev server before launch.

---

## 1. Sticky Mobile CTA Bar
**Scope:** Mobile
**Priority:** High
The Framer site shows a fixed bottom bar with "Enroll my gamer" and "Start a conversation" buttons that persists across all pages while scrolling. CLAUDE.md notes this as a known deferred issue ("had issues in Framer that carried over. Revisit behavior."). Not implemented in this pass — needs a design decision on whether to replicate Framer's behavior or redesign for Next.js.

## 2. Torn Paper Divider Variant Selection & Overlap Tuning
**Scope:** Universal
**Priority:** Medium
The torn paper dividers use PNG/SVG assets with negative margins to overlap sections. Framer uses specific variants at each section transition (white-1 vs white-2, black-1 vs black-2 vs black-3, red-1). The current implementation is structurally correct, but the exact variant choice, overlap size (negative margin), and z-index layering at each transition needs visual verification in a running browser against the Framer reference. Pay special attention to:
- Red hero → grey section (home, programs)
- Black section → white section (how it works → testimonials)
- Grey section → black section (growth → ecosystem)

## 3. Programs Hero Rive Animation
**Scope:** Desktop
**Priority:** Low (cosmetic)
The Framer Programs page hero uses an embedded Rive animation file (`D693XtxMBjnOWB0t8DkBPKck.riv`) that animates the "STRUCTURED LIKE SPORTS" text with interactive brush strokes. Our Next.js build uses a static heading + background image instead. This is by design but means the Programs hero lacks the animated interactivity of the Framer version. Consider embedding the Rive file directly if the animation is important to the brand experience.

## 4. Testimonials Carousel Arrow Styling
**Scope:** Universal
**Priority:** Low
The Framer testimonials section shows left/right navigation arrows (black circles with white chevrons) centered below the video carousel. The implementation exists in `TestimonialsCarousel.tsx` but exact arrow size, spacing, and hover state needs visual verification against Framer. The dot indicators below may also need positioning adjustments.

## 5. Blog Content Gaps
**Scope:** Desktop
**Priority:** Low (content)
Only 2 blog posts exist as static pages. The blog index page and filtering UI are built but only show these 2 posts. The grid layout will look sparse until more content is added. The filter sidebar categories may also need updating once more posts are created.

## 6. Ecosystem Animation scrollPx Tuning
**Scope:** Desktop
**Priority:** Medium
CLAUDE.md notes that different pages need different `scrollPx` values for the Rive ecosystem animation (home uses 14000, some pages may need different values). The current values are set but may need tuning once viewed in a running browser to ensure the animation progress feels natural relative to scroll distance on each page.

## 7. Font Placeholders
**Scope:** Universal
**Priority:** Medium (brand)
Tungsten Narrow (display font) is using Bebas Neue as a placeholder. Test Die Grotesk (body font) is using Inter as a placeholder. Both are close but not exact matches. Swap in licensed .woff2 files when available from typography.com. The `clamp()` values may need minor adjustments after the font swap since Tungsten Narrow and Bebas Neue have different metrics.

## 8. Social Icons in Footer
**Scope:** Universal
**Priority:** Low
Footer social links use inline SVG icons that were manually recreated. Verify these match the Framer originals for Instagram, Facebook, YouTube, Discord, X (Twitter), and TikTok. The icon sizes and hover states should also be checked.

## 9. Dev Server Environment Issue
**Scope:** Development
**Priority:** Blocking for visual QA
The Next.js dev server couldn't start in this environment due to missing SWC binaries for arm64 architecture. All fixes in this pass were made via code review against the live Framer site and Figma. A full visual regression check on a running local dev server is strongly recommended before deploying any of these changes.
