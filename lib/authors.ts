/**
 * ── Author registry: the one place author facts live ────────────────────────
 * Added 2026-07-28. Before this file, every author fact (name, role line,
 * headshot path, bio) was hand-copied into each post page AND each author
 * page — Muhammad's role line existed in 3 files, his image path in 4.
 *
 * Everything author-shaped now reads from here:
 *   - components/blog/AuthorByline.tsx   (the byline on every post)
 *   - components/blog/AuthorPage.tsx     (the shared author-page template)
 *   - app/blog/author/<slug>/page.tsx    (metadata, via buildAuthorMetadata)
 *
 * Schema.org Person nodes still live in lib/schema.ts (one canonical entity
 * per person, referenced by @id). This registry points at them by `personId`;
 * it does not duplicate them.
 *
 * TWO KINDS OF AUTHOR:
 *   staff — linked byline, avatar, role line, author page.
 *   guest — name and date only. No link, no avatar, no author page. Decided
 *           2026-07-28: the two classes should read as visibly different, so
 *           guests deliberately get NOTHING in the avatar slot rather than a
 *           monogram placeholder.
 */

import { KARLIN_ID, JAMIE_ID, MUHAMMAD_ID } from "./schema";

export type AuthorKind = "staff" | "guest";

export type Author = {
  slug: string;
  name: string;
  kind: AuthorKind;

  /** Byline sub-label + author-page eyebrow. Staff only. */
  role?: string;

  /** 256x256 square. Rendered at 44px (mobile) / 64px (desktop) in bylines. */
  avatar?: string;

  /** Author-page hero portrait (square-cropped by CSS). */
  headshot?: string;
  headshotAlt?: string;
  /** Intrinsic dimensions of `headshot`, for OpenGraph/Twitter cards. */
  headshotWidth?: number;
  headshotHeight?: number;

  /** Meta description for the author page. */
  description?: string;

  /** Author-page bio. One entry per paragraph. */
  bio?: string[];

  /** Optional closing pull-quote on the author page. */
  pullQuote?: string;

  /** @id of the canonical Person node in lib/schema.ts. */
  personId?: string;

  /**
   * The full Person node, set ONLY for an author whose node is not yet in the
   * site-wide `rootGraph`. The author-page template inlines it into that one
   * page's @graph so `mainEntity` is not a dangling @id. Authors already in
   * rootGraph (Karlin, Jamie, and Muhammad since 2026-07-31) leave this
   * undefined so the node is not emitted twice. See lib/schema.ts.
   */
  personNode?: object;

  /** Does /blog/author/<slug> exist? Bylines only link when true. */
  hasPage: boolean;

  /**
   * Show the red enroll CTA strip at the bottom of the author page.
   * Defaults to true. False for Muhammad: the only route onto his page is the
   * byline of a Kassi post, and both of those posts dropped the FooterBanner
   * by design as non-promotional. A reader who clicks his name out of her
   * story should not land on an enroll pitch.
   */
  footerBanner?: boolean;

  /**
   * Emits robots: { index: false } in the author page metadata. Used as one of
   * six leak-guard layers for the Kassi bundle's pre-publication embargo
   * (cleared 2026-07-31). Kept on the type because the next unpublished author
   * page will want it.
   */
  noindex?: boolean;
};

const AUTHORS: Author[] = [
  {
    slug: "karlin-oei",
    name: "Karlin Oei",
    kind: "staff",
    role: "Founder of EKUZO",
    avatar: "/images/authors/karlin-oei-avatar.jpg",
    // Action shot, kept on purpose: it reads as "competitive gaming founder,"
    // which is a stronger signal than a polite headshot. The 6349x4312 /
    // 10.2 MB original (/images/coach-karlin-faith.jpg) is no longer served —
    // this is a 1400px derivative with the same crop intent.
    headshot: "/images/authors/coach-karlin-faith-1400.jpg",
    headshotAlt: "Karlin Oei",
    headshotWidth: 1400,
    headshotHeight: 951,
    description:
      "Karlin Oei is the founder of EKUZO — a former national collegiate esports captain who earned $80,000+ in scholarships and now builds the structured, coached environment he didn't have growing up.",
    bio: [
      "Karlin Oei is the founder of EKUZO, a youth esports coaching program that turns a kid's existing gaming into a structured, coached, team-based experience.",
      "He builds EKUZO from the inside of the problem it solves. Karlin grew up gaming through social anxiety, low self-esteem, and a complicated home, and school rarely reached him. Games did. What he didn't have was anyone who knew what to do with that: no team, no routine, no coach to turn the hours into growth. He only started to see what gaming had taught him (ownership, accountability, how to lead) at 18, and stumbled into competitive League of Legends in college, where he became a national collegiate captain and earned $80,000+ in esports scholarships. EKUZO is the container he wishes he'd had.",
      "He writes here about what a kid's gaming is really telling parents, why structure beats restriction, and what coached play actually looks like.",
      "Karlin's mission is to help making gaming matter in the lives of students and the people that support them.",
    ],
    pullQuote: "games are the best teacher we already know.",
    personId: KARLIN_ID,
    hasPage: true,
  },
  {
    slug: "jamie-fitch",
    name: "Jamie Fitch",
    kind: "staff",
    role: "CEO of EKUZO · Parent",
    avatar: "/images/authors/jamie-fitch-avatar.jpg",
    headshot: "/images/jamie-fitch.jpg",
    headshotAlt: "Jamie Fitch, CEO of EKUZO",
    headshotWidth: 500,
    headshotHeight: 499,
    description:
      "Jamie Fitch is CEO of EKUZO, a parent and edtech founder. He writes about turning gaming from something parents worry about into something kids can grow through.",
    bio: [
      "Jamie Fitch is the CEO of EKUZO, where he helps turn gaming from something parents worry about into something kids can grow through, with coaching, structure, teammates, and purpose.",
      "He comes to the work from a few angles at once: as a parent, a lifelong competitive gamer, and a founder and operator who has spent his career building education and impact-driven companies. Jamie previously founded and led an edtech company, raised more than $40M, scaled it, and sold it. Today he advises, invests in, and helps operate companies focused on learning, youth development, technology, and impact.",
      "Gaming is personal for Jamie. He grew up playing competitively and still sees games as one of the clearest places where kids reveal how they think, compete, communicate, handle frustration, and respond to challenges. As a parent, he also understands the tension: the same screen time that can look isolating or excessive from the outside can sometimes be the place where a child is practicing focus, strategy, resilience, friendship, and identity.",
      "His work sits at that intersection. He believes the question is not simply whether gaming is “good” or “bad” for kids. The better question is: what kind of environment surrounds the game? Left alone, gaming can drift toward isolation, toxicity, or avoidance. With the right structure, it can become a coached, team-based, developmentally meaningful experience.",
      "Jamie writes for parents who do not want to dismiss gaming, but also do not want to leave it alone. His work is about seeing what kids are already drawn to, then building the structure around it that helps them grow.",
    ],
    personId: JAMIE_ID,
    hasPage: true,
  },
  {
    slug: "muhammad-hossain",
    name: "Muhammad Hossain",
    kind: "staff",
    role: "EKUZO coach · Texas A&M",
    avatar: "/images/authors/muhammad-hossain-avatar.jpg",
    headshot: "/images/muhammad-hossain.jpg",
    headshotAlt: "Muhammad Hossain, EKUZO coach",
    headshotWidth: 518,
    headshotHeight: 518,
    description:
      "Muhammad Hossain is an EKUZO coach and a senior English major at Texas A&M. He coaches kids in League of Legends and writes down what parents say when someone asks them about gaming.",
    // Bio copy: Jamie's words, 2026-07-28, with a light grammar/style polish
    // only. It is the whole bio. Do not pad it — any addition needs his
    // say-so. It deliberately does not name Kassi or any detail from either
    // post; it describes the listening project only, which is already public.
    bio: [
      "A native Texan, Muhammad Hossain is a senior English major at Texas A&M University. His lifelong passion for gaming and learning led him to EKUZO, where he is now a coach who helps others grow to their best selves. He loves to listen, learn, and broaden his perspective.",
    ],
    personId: MUHAMMAD_ID,
    // `personNode` and `noindex` both dropped 2026-07-31 when the Kassi bundle
    // went public. His Person node now lives in the site-wide rootGraph in
    // lib/schema.ts, so inlining it here as well would double-emit it on his
    // own page.
    hasPage: true,
    footerBanner: false,
  },
  // ── Guest authors ─────────────────────────────────────────────────────────
  // Name and date only. No avatar, no link, no author page. See the header.
  { slug: "john-hay", name: "John Hay", kind: "guest", hasPage: false },
  { slug: "lisa-holt", name: "Lisa Holt", kind: "guest", hasPage: false },
];

const BY_SLUG = new Map(AUTHORS.map((a) => [a.slug, a]));

export function getAuthor(slug: string): Author {
  const author = BY_SLUG.get(slug);
  if (!author) {
    // Fail loudly at build time rather than rendering a byline with a hole.
    throw new Error(`Unknown author slug "${slug}". Add them to lib/authors.ts.`);
  }
  return author;
}

export function authorHref(author: Author): string | null {
  return author.hasPage ? `/blog/author/${author.slug}` : null;
}

/**
 * Page metadata for /blog/author/<slug>. The root layout applies the
 * "%s | EKUZO" title template — do not suffix the brand in `title` or the tab
 * title double-stamps. OpenGraph/Twitter keep the suffix because share
 * previews are read out of context.
 */
export function buildAuthorMetadata(author: Author) {
  const url = `https://ekuzo.gg/blog/author/${author.slug}`;
  const image = author.headshot ?? "";
  const alt = author.headshotAlt ?? author.name;

  return {
    alternates: { canonical: `/blog/author/${author.slug}` },
    title: author.name,
    description: author.description,
    openGraph: {
      title: `${author.name} — EKUZO`,
      description: author.description,
      type: "profile" as const,
      url,
      siteName: "EKUZO",
      locale: "en_US",
      images: [
        {
          url: image,
          width: author.headshotWidth,
          height: author.headshotHeight,
          alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${author.name} — EKUZO`,
      description: author.description,
      images: [image],
    },
    ...(author.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

export default AUTHORS;
