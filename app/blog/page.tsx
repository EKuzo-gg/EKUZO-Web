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

// Card dates match each post's DATE_MODIFIED (the date its byline shows). Update both together.
const posts = [
  {
    slug: "gaming-study-13-7-years-younger-what-it-means-for-kids",
    title:
      "The gaming study everyone shared, and what it means for your twelve-year-old",
    date: "October 12, 2026",
    author: "Karlin Oei",
    category: "Perspective",
    excerpt:
      "A doctor's one-liner about a gaming study reached 30M+ people. Karlin read a thousand of the replies. The one that mattered wasn't about the study.",
    image: "/images/gaming-study-13-7-card.jpg",
    // Takes the featured slot from should-you-ban-fortnite for launch week.
    featured: true,
  },
  {
    slug: "what-your-kids-gaming-is-telling-you",
    title: "What your kid's gaming is telling you",
    date: "October 13, 2026",
    author: "Karlin Oei",
    category: "Perspective",
    excerpt:
      "The game is visible. The meaning is hidden. Six signs parents notice first in a gamer kid, and what they often mean.",
    image: "/images/what-your-kids-gaming-is-telling-you-card.jpg",
    // Lost the featured slot to should-you-ban-fortnite on 2026-07-31
    // (Jamie's call). Karlin knows.
    featured: false,
  },
  /*
   * The Kassi bundle, published 2026-07-31 after she blessed both pieces.
   * Both entries were commented out from 2026-07-25 / 2026-07-28 while the
   * posts sat live-but-undisseminated for her private review.
   * `featured: true` sat on the fortnite piece from 2026-07-31 until the gaming-study post took it. Only
   * one post may carry it — the finder below takes the first match.
   */
  {
    slug: "should-you-ban-fortnite",
    title: "She banned Fortnite and got her kid back. Then came a new problem.",
    date: "July 31, 2026",
    author: "Muhammad Hossain",
    category: "Perspective",
    excerpt:
      "The ban worked, and it broke something no article warned her about. A military mom's game-by-game verdicts on Fortnite, Red Dead Redemption, and Minecraft.",
    image: "/images/should-you-ban-fortnite-card.jpg",
    featured: false,
  },
  {
    slug: "gaming-military-families",
    title: "Every move wiped their friend map. Gaming was the community that traveled.",
    date: "July 31, 2026",
    author: "Muhammad Hossain",
    category: "Perspective",
    excerpt:
      "Military kids move constantly, and every move wipes the friend map. A military mom and a 21-year-old esports coach on the gaming communities that travel.",
    image: "/images/gaming-military-families-card.jpg",
    featured: false,
  },
  {
    slug: "when-your-sons-only-friends-are-online",
    title: "When your son's only friends are online",
    date: "October 13, 2026",
    author: "Jamie Fitch",
    category: "Perspective",
    excerpt:
      "Are online gaming friends real? The question isn't online vs offline. It's whether he's alone in a lobby of strangers or on a team with the same people.",
    image: "/images/when-your-sons-only-friends-are-online-hero.jpg",
    featured: false,
  },
  {
    slug: "our-family-s-esports-journey-with-ekuzo-and-the-k1ng",
    title: "Our Family's Esports Journey with EKUZO and the K1ng",
    date: "October 13, 2026",
    author: "Lisa Holt",
    category: "Case Studies",
    excerpt:
      "A mom's account of her son Ryan: bullied on his first day of sixth grade, then the esports team where he found his footing and learned to lead.",
    image: "/images/blog-post-1-card.jpg",
    featured: false,
  },
  {
    slug: "conquering-my-mountain-and-giants-how-esports-changed-my-life",
    title: "Conquering my Mountain and Giants: How Esports Changed My Life",
    date: "October 13, 2026",
    author: "John Hay",
    category: "Testimonials",
    excerpt:
      "I struggled with anxiety, perfectionism, and near-failing grades. Then I found EKUZO, and a coach who taught me how to reframe everything.",
    image: "/images/blog-post-2-card.jpg",
    featured: false,
  },
  {
    slug: "gaming-programs-for-kids",
    title: "Gaming programs for kids: a parent's guide, Fall 2026",
    date: "October 13, 2026",
    author: "Karlin Oei",
    excerpt:
      "What a kid who games can join in fall 2026: build classes, online clubs, school teams, local leagues and coached teams, with prices checked in October.",
    image: "/images/blog-post-3-card.jpg",
    category: "Guides",
    featured: false,
  },
  {
    slug: "league-of-legends-youth-development",
    title: "Is League of Legends OK for kids? Why we coach it",
    date: "October 13, 2026",
    author: "Karlin Oei",
    category: "Guides",
    excerpt:
      "Why League of Legends works for youth development when the structure is right. The honest answer on toxicity and what coached play actually teaches kids.",
    image: "/images/blog-post-4-card.jpg",
    featured: false,
  },
  {
    slug: "when-gaming-helps-homeschool-kids",
    title: "When gaming helps homeschool kids and when it hurts",
    date: "October 13, 2026",
    author: "Karlin Oei",
    category: "Guides",
    excerpt:
      "Gaming can grow a homeschooled kid or shrink their world. What decides which, why structure beats hours, and how to tilt it your way.",
    image: "/images/blog-post-5-card.jpg",
    featured: false,
  },
  {
    slug: "what-homeschool-parents-taught-us-about-gaming",
    title: "Should homeschool kids play video games? 200+ parents weigh in",
    date: "October 13, 2026",
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
