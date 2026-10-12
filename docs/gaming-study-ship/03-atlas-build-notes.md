# Atlas build notes (gaming-study ship)

Files: post `page.tsx` (P), `app/blog/page.tsx` (B), `app/sitemap.ts`, `public/llms.txt`, three images in `public/images/`.

1. C1 done: P TITLE_DISPLAY, B title. TITLE_SEO untouched.
2. C2 NOT applied (awaiting approval); opening paragraph as built.
3. C3 done: Short answer is first child of BlogPostBody (P), `<p><strong>Short answer:</strong> ...`.
4. C3b done: second paragraph trimmed.
5. C4 done: "tennis, piano, orchestra".
6. C5 done: png copied from `final/` (sha matches 7e4fd73c...). next/image 1080x1350 in `div.my-10.mx-auto.w-full.max-w-[560px]`, `sizes="(max-width: 640px) 100vw, 560px"`, alt exact. No existing in-body image pattern in BlogContent, so wrapper div used. Sits after "Everything around it is different." paragraph, before "In June a parent emailed me."
7. C6 done: both links now 2797596.
8. C7 NOT applied.
9. C8 done: "Is gaming good for kids' brains?" (ASCII apostrophe, matching neighbouring FAQ strings; also feeds FAQPage schema).
10. C9 done: `What the study found, and what it didn&apos;t`.
11. C10 done: FooterBanner heading "Every gamer deserves a team".
12. Dates done: DATE_PUBLISHED/MODIFIED 2026-10-12; B date "October 12, 2026"; BlogPostBody `date={DATE_MODIFIED} dateLabel="Updated"`.
13. Featured done: true on this post, false on should-you-ban-fortnite; exactly one `featured: true` in B. Replaced the stale "Not featured yet" comment; removed the stale TODO(assets) comment on the card in B.
14. Images done: hero and card copied, sha256 match expected values (and sources). TODO(assets) comment removed. Hero alt unchanged. Added `sizes="(max-width: 1264px) 100vw, 1232px"` to hero; object-cover and 520px frame unchanged.
15. Keep Reading done: three-card `KEEP_READING` array and the fortnite-page markup, order homeschool, fortnite, only-friends.
16. Sitemap done (after gaming-military-families, priority 0.6, lastModified 2026-10-12). llms.txt line added before the Fortnite line, with display title (no "this week") and the DESCRIPTION text verbatim.
17. Header comment: still true (Sep 13/14/15 facts, "This Week" refers to the wishlist brief title); unchanged.

## Judgment calls / flags (none blocking)
- Keep Reading `blurb` field: the pattern requires one. To avoid new copy I used each post's `excerpt` from B verbatim (apostrophes typographic in JS strings, like the existing KEEP_READING arrays; the only-friends title uses the curly apostrophe as in the fortnite page's array).
- Homeschool card changed vs the old single card to match B: category "Perspective" -> "Case Studies", image blog-post-6-hero.jpg -> blog-post-6-card.jpg, and the "by Karlin Oei" line is dropped (the pattern has no author line).
- The blog index excerpt still says "30M+ people" (not in the change list; untouched).
- llms.txt/sitemap use ASCII apostrophe in the description as in DESCRIPTION.
- Updated the stale comment in B above the Kassi bundle (said featured lives on fortnite); it now says the gaming-study post took the slot.
