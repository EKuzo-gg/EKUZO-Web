import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import JsonLd from "@/components/JsonLd";
import { buildAuthorPageGraph, KARLIN_ID } from "@/lib/schema";
import Link from "next/link";
import Image from "next/image";

const NAME = "Karlin Oei";
const SLUG = "karlin-oei";
const DESCRIPTION =
  "Karlin Oei is the founder of EKUZO — a former national collegiate esports captain who earned $80,000+ in scholarships and now builds the structured, coached environment he didn't have growing up.";

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
        url: "/images/coach-karlin-faith.jpg",
        width: 1200,
        height: 1200,
        alt: NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${NAME} — EKUZO`,
    description: DESCRIPTION,
    images: ["/images/coach-karlin-faith.jpg"],
  },
};

const POSTS = [
  {
    slug: "what-your-kids-gaming-is-telling-you",
    title: "What your kid's gaming is telling you",
    date: "May 24, 2026",
    excerpt:
      "The game is visible. The meaning is hidden. Six signs parents notice first in a gamer kid, and what they often mean.",
    image: "/images/what-your-kids-gaming-is-telling-you-card.jpg",
    category: "Perspective",
  },
  {
    slug: "what-homeschool-parents-taught-us-about-gaming",
    title: "What 200+ homeschool parents taught us about gaming",
    date: "May 21, 2026",
    excerpt:
      "We read a 200+ parent thread on kids and gaming. Three camps, the language they use, and the one structured, social, supervised thing they all want.",
    image: "/images/blog-post-6-card.jpg",
    category: "Case Studies",
  },
  {
    slug: "when-gaming-helps-homeschool-kids",
    title: "When gaming helps homeschool kids and when it hurts",
    date: "May 21, 2026",
    excerpt:
      "Gaming can grow a homeschooled kid or shrink their world. What decides which, why structure beats hours, and how to tilt it your way.",
    image: "/images/blog-post-5-card.jpg",
    category: "Guides",
  },
  {
    slug: "league-of-legends-youth-development",
    title: "Why League of Legends is perfect for youth development",
    date: "May 16, 2026",
    excerpt:
      "Why League of Legends works for youth development when the structure is right. The honest answer on toxicity and what coached play actually teaches kids.",
    image: "/images/blog-post-4-card.jpg",
    category: "Guides",
  },
  {
    slug: "summer-camps-for-kids-who-game-2026",
    title:
      "Virtual summer camps for kids who'd rather be gaming (still open for summer 2026)",
    date: "May 14, 2026",
    excerpt:
      "A parent's guide to virtual summer camps for kids who game. Four categories, real cost ranges, and how to tell a coached program from a supervised hangout.",
    image: "/images/blog-post-3-card.jpg",
    category: "Guides",
  },
];

export default function KarlinOeiAuthorPage() {
  const profileGraph = buildAuthorPageGraph({
    slug: SLUG,
    name: NAME,
    personId: KARLIN_ID,
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
                  src="/images/coach-karlin-faith.jpg"
                  alt={NAME}
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
                  className="font-display text-black uppercase leading-[0.9] mb-6"
                  style={{ fontSize: "clamp(2.75rem, 6vw, 4.5rem)" }}
                >
                  {NAME}
                </h1>
                <p className="font-body text-black/70 text-lg leading-[1.6] mb-5">
                  Karlin Oei is the founder of EKUZO, a youth esports coaching
                  program that turns a kid's existing gaming into a structured,
                  coached, team-based experience.
                </p>
                <p className="font-body text-black/70 text-lg leading-[1.6] mb-5">
                  He builds EKUZO from the inside of the problem it solves.
                  Karlin grew up gaming through social anxiety, low self-esteem,
                  and a complicated home, and school rarely reached him — but
                  games did. What he didn't have was anyone who knew what to do
                  with that: no team, no routine, no coach to turn the hours
                  into growth. He only started to see what gaming had taught
                  him — ownership, accountability, how to lead — at 18, and
                  stumbled into competitive League of Legends in college, where
                  he became a national collegiate captain and earned $80,000+
                  in esports scholarships. EKUZO is the container he wishes
                  he'd had.
                </p>
                <p className="font-body text-black/70 text-lg leading-[1.6] mb-6">
                  He writes here about what a kid's gaming is really telling
                  parents, why structure beats restriction, and what coached
                  play actually looks like.
                </p>
                <blockquote className="font-body italic text-black text-lg leading-[1.5] border-l-4 border-red pl-5">
                  "Our job isn't to add pedagogy to games; it's to help students
                  see it, use it, and carry that mindset into school, careers,
                  and life."
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        <TornPaperDivider color="grey" variant="top" style={1} />

        {/* ── POSTS BY KARLIN ───────────────────────────────────────────── */}
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
      </article>

      <FooterBanner heading="Enroll into a transformational program today" />
      <Footer />
    </>
  );
}
