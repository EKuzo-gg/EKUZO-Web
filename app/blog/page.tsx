import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import FooterBanner from "@/components/sections/FooterBanner";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  alternates: { canonical: "/blog" },
  title: "Blog — EKUZO",
  description:
    "Stories, insights, and updates from the EKUZO team. Read about gamers who found confidence, leadership, and community through esports.",
};

const posts = [
  {
    slug: "our-family-s-esports-journey-with-ekuso-and-the-k1ng",
    title: "Our Family's Esports Journey with EKUZO and the K1ng",
    date: "Jan 14, 2026",
    author: "Lisa Holt",
    category: "Case Studies",
    excerpt:
      "My son Ryan was always a happy kid in his early years. Then junior high happened — and everything changed. This is how EKUZO gave him back his confidence.",
    image: "/images/blog-post-1-card.jpg",
    featured: true,
  },
  {
    slug: "conquering-my-mountain-and-giants-how-esports-changed-my-life",
    title: "Conquering my Mountain and Giants: How Esports Changed My Life",
    date: "Jan 14, 2026",
    author: "John Hay",
    category: "Testimonials",
    excerpt:
      "I struggled with anxiety, perfectionism, and near-failing grades. Then I found EKUZO — and a coach who taught me how to reframe everything.",
    image: "/images/blog-post-2-card.jpg",
    featured: false,
  },
  {
    slug: "summer-camps-for-kids-who-game-2026",
    title:
      "Virtual summer camps for kids who'd rather be gaming (still open for summer 2026)",
    date: "May 14, 2026",
    author: "Karlin",
    category: "Guides",
    excerpt:
      "A parent's guide to virtual summer camps for kids who game. Four categories, real cost ranges, and how to tell a coached program from a supervised hangout.",
    image: "/images/blog-post-3-card.jpg",
    featured: false,
  },
  {
    slug: "league-of-legends-youth-development",
    title: "Why League of Legends is perfect for youth development",
    date: "May 16, 2026",
    author: "Karlin",
    category: "Guides",
    excerpt:
      "Why League of Legends works for youth development when the structure is right. The honest answer on toxicity and what coached play actually teaches kids.",
    image: "/images/blog-post-4-card.jpg",
    featured: false,
  },
  {
    slug: "when-gaming-helps-homeschool-kids",
    title: "When gaming helps homeschool kids and when it hurts",
    date: "May 21, 2026",
    author: "Karlin Oei",
    category: "Guides",
    excerpt:
      "Gaming can grow a homeschooled kid or shrink their world. What decides which, why structure beats hours, and how to tilt it your way.",
    image: "/images/blog-post-5-card.jpg",
    featured: false,
  },
  {
    slug: "what-homeschool-parents-taught-us-about-gaming",
    title: "What 200+ homeschool parents taught us about gaming",
    date: "May 21, 2026",
    author: "Karlin Oei",
    category: "Case Studies",
    excerpt:
      "We read a 200+ parent thread on kids and gaming. Three camps, the language they use, and the one structured, social, supervised thing they all want.",
    image: "/images/blog-post-6-card.jpg",
    featured: false,
  },
];

export default function BlogPage() {
  const featured = posts.find((p) => p.featured)!;
  const all = posts;

  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-20">
        <Nav variant="dark" />
      </div>

      {/* ══ 1. HERO ══════════════════════════════════════════════════════════ */}
      <section
        className="relative bg-black overflow-hidden"
        style={{ paddingTop: "188px", paddingBottom: "80px" }}
      >
        <div className="max-w-[1232px] mx-auto" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
          <h1
            className="font-display text-white leading-[0.85] text-center mb-20"
            style={{ fontSize: "clamp(4rem, 11vw, 12rem)" }}
          >
            STORIES OF GAMING
            <br />
            AND GROWTH
          </h1>

          {/* Featured card */}
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid grid-cols-1 lg:grid-cols-2 overflow-hidden"
          >
            <div className="relative min-h-[400px] overflow-hidden">
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="bg-white p-10 md:p-14 flex flex-col justify-end gap-4">
              <span className="font-body text-xs font-bold text-red tracking-[0.15em] uppercase">
                {featured.category} · Featured
              </span>
              <h2
                className="font-display text-black leading-none group-hover:text-red transition-colors"
                style={{ fontSize: "clamp(1.75rem, 3.5vw, 3rem)" }}
              >
                {featured.title.toUpperCase()}
              </h2>
              <p className="font-body text-black/60 text-base leading-relaxed">
                {featured.excerpt}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="font-body text-black/40 text-sm">{featured.date}</span>
                <span className="font-body text-black/40 text-sm">·</span>
                <span className="font-body text-black/40 text-sm">by {featured.author}</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <TornPaperDivider color="black" />

      {/* ══ 2. ALL BLOGS ═════════════════════════════════════════════════════ */}
      <section className="bg-white py-[144px]" style={{ paddingLeft: "clamp(1.5rem, 7.2vw, 104px)", paddingRight: "clamp(1.5rem, 7.2vw, 104px)" }}>
        <div className="max-w-[1232px] mx-auto">
          <h2
            className="font-display text-black leading-none mb-14"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            ALL BLOGS
          </h2>

          {/*
            Filter sidebar hidden until the blog has enough posts for filtering
            to be useful. Reintroduce once the blog reaches ~10 posts:
              - re-add the <div className="bg-black p-8 ..."> sidebar
              - restore lg:grid-cols-[280px_1fr] on the wrapper below
              - wire actual filter state so clicks change which posts render
          */}
          <div className="grid grid-cols-1 gap-10 items-start">
            {/* Posts grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {all.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-grey">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="pt-5 flex flex-col gap-2">
                    <span className="font-body text-xs font-bold text-red tracking-[0.15em] uppercase">
                      {post.category}
                    </span>
                    <h3 className="font-body font-bold text-black text-lg leading-snug group-hover:text-red transition-colors">
                      {post.title}
                    </h3>
                    <p className="font-body text-black/50 text-sm leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-body text-black/40 text-xs">{post.date}</span>
                      <span className="font-body text-black/40 text-xs">·</span>
                      <span className="font-body text-black/40 text-xs">by {post.author}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FooterBanner heading="Enroll into a transformational program today" />
      <Footer />
    </>
  );
}
