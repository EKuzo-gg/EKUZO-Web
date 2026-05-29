import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import JsonLd from "@/components/JsonLd";
import { buildAuthorPageGraph, JAMIE_ID } from "@/lib/schema";
import Link from "next/link";
import Image from "next/image";

const NAME = "Jamie Fitch";
const SLUG = "jamie-fitch";
const DESCRIPTION =
  "Jamie Fitch is CEO of EKUZO, a parent and edtech founder. He writes about turning gaming from something parents worry about into something kids can grow through.";

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
        url: "/images/jamie-fitch.jpg",
        width: 500,
        height: 499,
        alt: "Jamie Fitch, CEO of EKUZO",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${NAME} — EKUZO`,
    description: DESCRIPTION,
    images: ["/images/jamie-fitch.jpg"],
  },
};

// Posts authored by Jamie. Populated in Phase 2 when the post route + card
// image exist (the grid is hidden while empty so the page renders cleanly).
const POSTS: {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  image: string;
  category: string;
}[] = [];

export default function JamieFitchAuthorPage() {
  const profileGraph = buildAuthorPageGraph({
    slug: SLUG,
    name: NAME,
    personId: JAMIE_ID,
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
                  src="/images/jamie-fitch.jpg"
                  alt="Jamie Fitch, CEO of EKUZO"
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
                <p className="font-body font-bold text-black/50 text-sm tracking-[0.1em] uppercase mb-6">
                  CEO of EKUZO · Parent
                </p>
                <p className="font-body text-black/70 text-lg leading-[1.6] mb-5">
                  Jamie Fitch is the CEO of EKUZO, where he helps turn gaming
                  from something parents worry about into something kids can
                  grow through, with coaching, structure, teammates, and
                  purpose.
                </p>
                <p className="font-body text-black/70 text-lg leading-[1.6] mb-5">
                  He comes to the work from a few angles at once: as a parent, a
                  lifelong competitive gamer, and a founder and operator who has
                  spent his career building education and impact-driven
                  companies. Jamie previously founded and led an edtech company,
                  raised more than $40M, scaled it, and sold it. Today he
                  advises, invests in, and helps operate companies focused on
                  learning, youth development, technology, and impact.
                </p>
                <p className="font-body text-black/70 text-lg leading-[1.6] mb-5">
                  Gaming is personal for Jamie. He grew up playing competitively
                  and still sees games as one of the clearest places where kids
                  reveal how they think, compete, communicate, handle
                  frustration, and respond to challenges. As a parent, he also
                  understands the tension: the same screen time that can look
                  isolating or excessive from the outside can sometimes be the
                  place where a child is practicing focus, strategy, resilience,
                  friendship, and identity.
                </p>
                <p className="font-body text-black/70 text-lg leading-[1.6] mb-5">
                  His work sits at that intersection. He believes the question
                  is not simply whether gaming is &ldquo;good&rdquo; or
                  &ldquo;bad&rdquo; for kids. The better question is: what kind
                  of environment surrounds the game? Left alone, gaming can
                  drift toward isolation, toxicity, or avoidance. With the right
                  structure, it can become a coached, team-based,
                  developmentally meaningful experience.
                </p>
                <p className="font-body text-black/70 text-lg leading-[1.6] mb-6">
                  Jamie writes for parents who do not want to dismiss gaming,
                  but also do not want to leave it alone. His work is about
                  seeing what kids are already drawn to, then building the
                  structure around it that helps them grow.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── POSTS BY JAMIE ────────────────────────────────────────────── */}
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

      <FooterBanner heading="Enroll into a transformational program today" />
      <Footer />
    </>
  );
}
