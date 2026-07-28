import AuthorPage, { type AuthorPost } from "@/components/blog/AuthorPage";
import { getAuthor, buildAuthorMetadata } from "@/lib/authors";

const SLUG = "muhammad-hossain";

export const metadata = buildAuthorMetadata(getAuthor(SLUG));

/*
 * ── Muhammad Hossain author page: read before editing ────────────────────────
 * CREATED 2026-07-28 alongside the Kassi bundle
 * (/blog/gaming-military-families + /blog/should-you-ban-fortnite), which he
 * wrote and which both carry his byline.
 *
 * SHIP STATE: LIVE BUT UNDISSEMINATED. This page mirrors the ship state of the
 * two posts it belongs to. Kassi has not yet blessed the bundle, so this page
 * must not surface either post to crawlers or to the blog UI:
 *   1. robots is index:false (from `noindex: true` on his lib/authors.ts
 *      entry, emitted by buildAuthorMetadata) + an X-Robots-Tag rule in
 *      next.config.mjs
 *   2. absent from app/sitemap.ts
 *   3. the two Kassi post cards in POSTS are COMMENTED OUT
 *   4. his Person node is NOT in rootGraph — it ships on this page only, via
 *      `personNode` on his lib/authors.ts entry, which the AuthorPage template
 *      passes to buildAuthorPageGraph. See lib/schema.ts for the reasoning.
 * The bio deliberately does not name Kassi, either piece, or any detail from
 * them. It describes the listening project only, which is already public.
 *
 * TO PUBLISH (runs at the same moment as both posts' TO PUBLISH checklists,
 * on Kassi's blessing — all three flip together):
 *   a. delete `noindex: true` from his entry in lib/authors.ts
 *   b. add /blog/author/muhammad-hossain to app/sitemap.ts (alongside
 *      karlin-oei and jamie-fitch)
 *   c. delete the X-Robots-Tag rule for this path in next.config.mjs
 *   d. UNCOMMENT the two entries in POSTS below
 *   e. add `personMuhammadHossain` to the rootGraph @graph array in
 *      lib/schema.ts, then delete `personNode` from his entry in
 *      lib/authors.ts (it would double-emit otherwise)
 *   f. swap the inline author objects in both post pages to { "@id": MUHAMMAD_ID }
 *
 * Bio copy (now in lib/authors.ts): Jamie's words, 2026-07-28, with a light
 * grammar/style polish only
 * (led, EKUZO, coach who, appositive comma). It is the whole bio: Jamie's
 * paragraph and nothing else. Do not pad it. Any addition needs his say-so.
 * Voice: knowledge-base system/methodology/voice-dna.md is law here as
 * everywhere. No em dashes in prose. Sentence case.
 * Headshot: /images/muhammad-hossain.jpg, square-cropped 2026-07-28 from the
 * source he sent (raw/inbox/2026-07-28-muhammad-hossain-headshot.jpg, 518x640).
 * Byline avatar: /images/authors/muhammad-hossain-avatar.jpg, a 256x256
 * derivative of the same file (2026-07-28).
 * This page's layout, bio, role line, and the absence of a FooterBanner are
 * all data now — see his entry in lib/authors.ts, not this file.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const POSTS: AuthorPost[] = [
  // {
  //   slug: "gaming-military-families",
  //   title: "Every move wiped their friend map. Gaming was the community that traveled.",
  //   date: "July 25, 2026",
  //   excerpt:
  //     "Military kids move constantly, and every move wipes the friend map. A military mom and a 21-year-old esports coach on the gaming communities that travel.",
  //   image: "/images/gaming-military-families-card.jpg",
  //   category: "Perspective",
  // },
  // {
  //   slug: "should-you-ban-fortnite",
  //   title: "She banned Fortnite and got her kid back. Then came a new problem.",
  //   date: "July 28, 2026",
  //   excerpt:
  //     "The ban worked, and it broke something no article warned her about. A military mom's game-by-game verdicts on Fortnite, Red Dead Redemption, and Minecraft.",
  //   image: "/images/should-you-ban-fortnite-card.jpg",
  //   category: "Perspective",
  // },
];

export default function MuhammadHossainAuthorPage() {
  return <AuthorPage author={SLUG} posts={POSTS} />;
}
