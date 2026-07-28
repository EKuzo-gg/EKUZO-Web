import Link from "next/link";
import Image from "next/image";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import JsonLd from "@/components/JsonLd";
import { buildAuthorPageGraph } from "@/lib/schema";
import { getAuthor } from "@/lib/authors";

/**
 * ── Shared author-page template ─────────────────────────────────────────────
 * Added 2026-07-28. The three author pages were near-identical copies that had
 * drifted apart: Karlin's had a pull-quote and no role line, Jamie's and
 * Muhammad's had a role line and no pull-quote; Karlin's post grid was always
 * on while the other two hid when empty. One template, one set of behaviours,
 * differences expressed as data in lib/authors.ts.
 *
 * Each route file still owns its own POSTS array and its own `metadata`
 * export (Next requires metadata to be exported from the route). Post lists
 * deliberately stay in the route files rather than moving to a shared index:
 * the commented-out entries on Muhammad's page are one of the six layers of
 * the Kassi leak guard, and relocating them would move the guard.
 */

export type AuthorPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  image: string;
  category: string;
};

export default function AuthorPage({
  author: slug,
  posts,
}: {
  author: string;
  posts: AuthorPost[];
}) {
  const author = getAuthor(slug);

  const profileGraph = buildAuthorPageGraph({
    slug: author.slug,
    name: author.name,
    personId: author.personId!,
    // Set only for an author whose Person node is not yet in the site-wide
    // rootGraph (Muhammad, until the Kassi bundle flips). Undefined for Karlin
    // and Jamie, who resolve by @id from rootGraph. See lib/schema.ts.
    person: author.personNode,
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
              <span className="text-black">{author.name}</span>
            </nav>

            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 md:gap-14 items-start">
              {author.headshot && (
                <div className="relative aspect-square overflow-hidden rounded-lg bg-grey">
                  <Image
                    src={author.headshot}
                    alt={author.headshotAlt ?? author.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 280px"
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              <div>
                <p className="font-body font-bold text-red text-sm tracking-[0.15em] uppercase mb-4">
                  Author
                </p>
                <h1
                  className={`font-display text-black uppercase leading-[0.9] ${
                    author.role ? "mb-3" : "mb-6"
                  }`}
                  style={{ fontSize: "clamp(2.75rem, 6vw, 4.5rem)" }}
                >
                  {author.name}
                </h1>
                {/* Matches the byline sub-label on every post they write. */}
                {author.role && (
                  <p className="font-body font-bold text-black/50 text-sm tracking-[0.1em] uppercase mb-6">
                    {author.role}
                  </p>
                )}
                {author.bio?.map((paragraph, i) => (
                  <p
                    key={i}
                    className={`font-body text-black/70 text-lg leading-[1.6] ${
                      i === (author.bio?.length ?? 0) - 1 ? "mb-6" : "mb-5"
                    }`}
                  >
                    {paragraph}
                  </p>
                ))}
                {author.pullQuote && (
                  <blockquote className="font-body italic text-black text-lg leading-[1.5] border-l-4 border-red pl-5">
                    &ldquo;{author.pullQuote}&rdquo;
                  </blockquote>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── POSTS ─────────────────────────────────────────────────────── */}
        {/* Hidden while empty, so a brand-new author renders cleanly with just
            the bio. Muhammad's list is empty ON PURPOSE right now: see the
            leak-guard note on the POSTS array in his route file. */}
        {posts.length > 0 && (
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
                  Posts by {author.name}
                </p>
                <h2
                  className="font-display text-black uppercase leading-[0.9] mb-12"
                  style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
                >
                  Stories, guides, and perspective
                </h2>

                <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 list-none p-0 m-0">
                  {posts.map((post) => (
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

      {/* Karlin's and Jamie's author pages carry the red enroll CTA.
          Muhammad's does not, deliberately (2026-07-28): the only route onto
          his page is the byline of a Kassi post, and both of those posts
          dropped the FooterBanner by design as non-promotional. A reader who
          clicks his name out of her story should not land on an enroll pitch.
          Flip `footerBanner` in lib/authors.ts once he has posts outside that
          bundle. */}
      {author.footerBanner !== false && (
        <FooterBanner heading="Enroll into a transformational program today" />
      )}
      <Footer />
    </>
  );
}
