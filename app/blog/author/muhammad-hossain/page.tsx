import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import JsonLd from "@/components/JsonLd";
import {
  buildAuthorPageGraph,
  MUHAMMAD_ID,
  personMuhammadHossain,
} from "@/lib/schema";
import Link from "next/link";
import Image from "next/image";

/*
 * ── Muhammad Hossain author page: read before editing ────────────────────────
 * CREATED 2026-07-28 alongside the Kassi bundle
 * (/blog/gaming-military-families + /blog/should-you-ban-fortnite), which he
 * wrote and which both carry his byline.
 *
 * SHIP STATE: LIVE BUT UNDISSEMINATED. This page mirrors the ship state of the
 * two posts it belongs to. Kassi has not yet blessed the bundle, so this page
 * must not surface either post to crawlers or to the blog UI:
 *   1. robots is index:false (below) + an X-Robots-Tag rule in next.config.mjs
 *   2. absent from app/sitemap.ts
 *   3. the two Kassi post cards in POSTS are COMMENTED OUT
 *   4. his Person node is NOT in rootGraph — it ships on this page only, via
 *      buildAuthorPageGraph({ person }). See lib/schema.ts for the reasoning.
 * The bio deliberately does not name Kassi, either piece, or any detail from
 * them. It describes the listening project only, which is already public.
 *
 * TO PUBLISH (runs at the same moment as both posts' TO PUBLISH checklists,
 * on Kassi's blessing — all three flip together):
 *   a. flip `robots` below to index:true
 *   b. add /blog/author/muhammad-hossain to app/sitemap.ts (alongside
 *      karlin-oei and jamie-fitch)
 *   c. delete the X-Robots-Tag rule for this path in next.config.mjs
 *   d. UNCOMMENT the two entries in POSTS below
 *   e. add `personMuhammadHossain` to the rootGraph @graph array in
 *      lib/schema.ts, then drop the `person` argument from the
 *      buildAuthorPageGraph call below (it would double-emit otherwise)
 *   f. swap the inline author objects in both post pages to { "@id": MUHAMMAD_ID }
 *
 * Bio copy: Jamie's words, 2026-07-28, with a light grammar/style polish only
 * (led, EKUZO, coach who, appositive comma). It is the whole bio: Jamie's
 * paragraph and nothing else. Do not pad it. Any addition needs his say-so.
 * Voice: knowledge-base system/methodology/voice-dna.md is law here as
 * everywhere. No em dashes in prose. Sentence case.
 * Headshot: /images/muhammad-hossain.jpg, square-cropped 2026-07-28 from the
 * source he sent (raw/inbox/2026-07-28-muhammad-hossain-headshot.jpg, 518x640).
 * ─────────────────────────────────────────────────────────────────────────────
 */

const NAME = "Muhammad Hossain";
const SLUG = "muhammad-hossain";
const HEADSHOT = "/images/muhammad-hossain.jpg";
const DESCRIPTION =
  "Muhammad Hossain is an EKUZO coach and a senior English major at Texas A&M. He coaches kids in League of Legends and writes down what parents say when someone asks them about gaming.";

export const metadata = {
  alternates: { canonical: `/blog/author/${SLUG}` },
  // Root layout applies the "%s | EKUZO" template — do not suffix the brand
  // here or the tab title double-stamps. OpenGraph/Twitter keep the suffix
  // because share previews are read out of context.
  title: NAME,
  description: DESCRIPTION,
  openGraph: {
    title: `${NAME} — EKUZO`,
    description: DESCRIPTION,
    type: "profile",
    url: `https://ekuzo.gg/blog/author/${SLUG}`,
    siteName: "EKUZO",
    locale: "en_US",
    images: [
      {
        url: HEADSHOT,
        width: 518,
        height: 518,
        alt: `${NAME}, EKUZO coach`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${NAME} — EKUZO`,
    description: DESCRIPTION,
    images: [HEADSHOT],
  },
  // Undisseminated ship state, mirroring both posts: keep this page out of
  // search until Kassi blesses the bundle, then flip index to true and add
  // the sitemap entry. See the TO PUBLISH checklist above.
  robots: { index: false, follow: true },
};

// Posts authored by Muhammad. The grid is hidden while empty so the page
// renders cleanly with just the bio.
// BOTH ENTRIES ARE COMMENTED OUT ON PURPOSE (2026-07-28): the Kassi bundle is
// live but undisseminated, and an author page that lists the posts would
// surface them in the blog UI before she has blessed them. Uncomment both at
// the flip, together, per the TO PUBLISH checklist above.
const POSTS: {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  image: string;
  category: string;
}[] = [
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
  const profileGraph = buildAuthorPageGraph({
    slug: SLUG,
    name: NAME,
    personId: MUHAMMAD_ID,
    // Ships his Person node on this page only. Drop this argument at the flip,
    // once personMuhammadHossain is in rootGraph. See lib/schema.ts.
    person: personMuhammadHossain,
  });

  return (
    <>
      <JsonLd data={profileGraph} />

      <div className="absolute top-0 left-0 right-0 z-20">
        <Nav variant="light" />
      </div>

      <article className="bg-white relative overflow-hidden">
        {/* ── HERO: portrait + bio ─────────────────────────────────────── */}
        <section
          className="relative bg-white"
          style={{
            paddingTop: "clamp(140px, 18vw, 220px)",
            paddingBottom: "clamp(60px, 9vw, 120px)",
          }}
        >
          <div
            className="max-w-[1100px] mx-auto"
            style={{
              paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
              paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
            }}
          >
            <nav
              aria-label="Breadcrumb"
              className="font-body text-sm text-black/60 mb-10"
            >
              <Link href="/" className="hover:text-red">
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link href="/blog" className="hover:text-red">
                Blog
              </Link>
              <span className="mx-2">/</span>
              <span className="text-black">{NAME}</span>
            </nav>

            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 md:gap-14 items-start">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-grey">
                <Image
                  src={HEADSHOT}
                  alt={`${NAME}, EKUZO coach`}
                  fill
                  sizes="(max-width: 768px) 100vw, 280px"
                  className="object-cover"
                  priority
                />
              </div>

              <div>
                <p className="font-body font-bold text-red text-sm tracking-[0.15em] uppercase mb-4">
                  Author
                </p>
                <h1
                  className="font-display text-black uppercase leading-[0.9] mb-3"
                  style={{ fontSize: "clamp(2.75rem, 6vw, 4.5rem)" }}
                >
                  {NAME}
                </h1>
                {/* Matches the byline sub-label on both of his posts. */}
                <p className="font-body font-bold text-black/50 text-sm tracking-[0.1em] uppercase mb-6">
                  EKUZO coach · Texas A&amp;M
                </p>
                <p className="font-body text-black/70 text-lg leading-[1.6] mb-6">
                  A native Texan, Muhammad Hossain is a senior English major at
                  Texas A&amp;M University. His lifelong passion for gaming and
                  learning led him to EKUZO, where he is now a coach who helps
                  others grow to their best selves. He loves to listen, learn,
                  and broaden his perspective.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── POSTS BY MUHAMMAD ─────────────────────────────────────────── */}
        {/* Hidden while POSTS is empty. It is empty on purpose right now: see
            the leak-guard note on the POSTS array above. */}
        {POSTS.length > 0 && (
          <>
            <TornPaperDivider color="grey" variant="top" style={1} />
            <section
              className="relative bg-grey"
              style={{
                paddingTop: "clamp(60px, 9vw, 110px)",
                paddingBottom: "clamp(80px, 12vw, 150px)",
              }}
            >
              <div
                className="max-w-[1232px] mx-auto"
                style={{
                  paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
                  paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
                }}
              >
                <p className="font-body font-bold text-red text-sm tracking-[0.15em] uppercase mb-4">
                  Posts by {NAME}
                </p>
                <h2
                  className="font-display text-black uppercase leading-[0.9] mb-12"
                  style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
                >
                  Stories, guides, and perspective
                </h2>

                <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 list-none p-0 m-0">
                  {POSTS.map((post) => (
                    <li key={post.slug}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="group block bg-white overflow-hidden h-full"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden bg-black">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
                          />
                        </div>
                        <div className="p-6 md:p-8">
                          <p className="font-body font-bold text-red text-xs tracking-[0.15em] uppercase mb-3">
                            {post.category} · {post.date}
                          </p>
                          <h3
                            className="font-display text-black uppercase leading-[1] mb-3 group-hover:text-red transition-colors"
                            style={{ fontSize: "clamp(1.4rem, 2.4vw, 2rem)" }}
                          >
                            {post.title}
                          </h3>
                          <p className="font-body text-black/70 leading-[1.5]">
                            {post.excerpt}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </>
        )}
      </article>

      {/* NO FooterBanner, deliberately (2026-07-28). Karlin's and Jamie's
          author pages carry the red enroll CTA; this one does not, because the
          only route onto this page is the byline of a Kassi post, and both of
          those pages dropped the FooterBanner by design as non-promotional.
          A reader who clicks "Muhammad Hossain" out of her story should not
          land on an enroll pitch. Restore the banner (import + one line) once
          he has posts that are not part of the Kassi bundle. */}
      <Footer />
    </>
  );
}
