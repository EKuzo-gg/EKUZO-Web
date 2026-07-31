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
 * SHIP STATE: PUBLIC as of 2026-07-31. This page mirrors the ship state of the
 * two posts it belongs to, and all three flipped in one commit when Kassi
 * blessed the bundle. What that flip removed, for anyone tracing it back:
 *   a. `noindex: true` off his lib/authors.ts entry
 *   b. /blog/author/muhammad-hossain added to app/sitemap.ts
 *   c. the X-Robots-Tag rule for this path deleted from next.config.mjs
 *   d. the two post cards in POSTS below uncommented
 *   e. `personMuhammadHossain` added to the rootGraph @graph in lib/schema.ts,
 *      and `personNode` dropped from his lib/authors.ts entry so it does not
 *      double-emit here
 *   f. the inline author objects in both post pages swapped to
 *      { "@id": MUHAMMAD_ID }
 * The bio deliberately does not name her, either piece, or any detail from
 * them. It describes the listening project only, which is already public.
 * She is published as CASEY; her real first name stays out of anything
 * rendered. See either post's header note.
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
  {
    slug: "should-you-ban-fortnite",
    title: "She banned Fortnite and got her kid back. Then came a new problem.",
    date: "July 28, 2026",
    excerpt:
      "The ban worked, and it broke something no article warned her about. A military mom's game-by-game verdicts on Fortnite, Red Dead Redemption, and Minecraft.",
    image: "/images/should-you-ban-fortnite-card.jpg",
    category: "Perspective",
  },
  {
    slug: "gaming-military-families",
    title: "Every move wiped their friend map. Gaming was the community that traveled.",
    date: "July 25, 2026",
    excerpt:
      "Military kids move constantly, and every move wipes the friend map. A military mom and a 21-year-old esports coach on the gaming communities that travel.",
    image: "/images/gaming-military-families-card.jpg",
    category: "Perspective",
  },
];

export default function MuhammadHossainAuthorPage() {
  return <AuthorPage author={SLUG} posts={POSTS} />;
}
